-- Votaciones de la afición: en cada partido jugado, cada cuenta vota una vez
-- por categoría (MVP, mejor suplente y jugador con más compromiso).
--
-- Todas las reglas las impone la base de datos, no solo la pantalla:
-- - La votación se abre cuando el partido está jugado y tiene la alineación
--   registrada, y se cierra a las 23:59 (hora de España) del día del partido.
-- - Solo se puede votar a los candidatos de cada categoría (es_candidato).
-- - Un voto por cuenta, categoría y partido, y no se puede cambiar.
-- - Mientras está abierta, nadie ve cómo va: cada cuenta solo lee sus
--   propios votos, y los recuentos solo se sirven con la votación cerrada.

create type public.categoria_votacion as enum (
  'mvp',
  'mejor_suplente',
  'compromiso'
);

create type public.estado_votacion as enum ('pendiente', 'abierta', 'cerrada');

create table public.votos (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references public.partidos (id) on delete cascade,
  categoria public.categoria_votacion not null,
  -- Si se borra la cuenta, su voto se queda sin dueño: así no cambian los
  -- resultados ya publicados.
  perfil_id uuid default auth.uid()
    references public.perfiles (id) on delete set null,
  jugador_id uuid not null references public.jugadores (id),
  creado_en timestamptz not null default now(),
  unique (partido_id, categoria, perfil_id)
);

comment on table public.votos is
  'Votos de la afición: uno por cuenta, categoría y partido.';

create index votos_jugador_id_idx on public.votos (jugador_id);

alter table public.votos enable row level security;

-- Las 00:00 (hora de España) del día siguiente al partido: hasta entonces
-- se puede votar, es decir, hasta las 23:59 del día del partido.
create function public.cierre_votacion(p_fecha_hora timestamptz)
returns timestamptz
language sql
immutable
set search_path = public
as $$
  select ((p_fecha_hora at time zone 'Europe/Madrid')::date + 1)::timestamp
    at time zone 'Europe/Madrid';
$$;

-- En qué punto está la votación de un partido y cuándo se cierra:
-- - pendiente: el partido no se ha jugado o aún no tiene la alineación
--   (sin ella no se sabe a quién se puede votar).
-- - abierta: jugado, con alineación, y todavía no son las 00:00.
-- - cerrada: ya han pasado las 23:59 del día del partido.
create function public.consultar_votacion(p_partido_id uuid)
returns table (estado public.estado_votacion, cierre timestamptz)
language sql
stable
set search_path = public
as $$
  select
    (case
      when p.estado <> 'jugado' then 'pendiente'
      when now() >= public.cierre_votacion(p.fecha_hora) then 'cerrada'
      when now() < p.fecha_hora then 'pendiente'
      when not exists (
        select 1 from public.estadisticas_partido e where e.partido_id = p.id
      ) then 'pendiente'
      else 'abierta'
    end)::public.estado_votacion,
    public.cierre_votacion(p.fecha_hora)
  from public.partidos p
  where p.id = p_partido_id;
$$;

comment on function public.consultar_votacion(uuid) is
  'Estado de la votación de un partido (pendiente, abierta o cerrada) y cuándo se cierra.';

create function public.votacion_abierta(p_partido_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select estado = 'abierta' from public.consultar_votacion(p_partido_id)),
    false
  );
$$;

-- A quién se puede votar en cada categoría, según la alineación:
-- - MVP: quien jugó (titular, o suplente que salió al campo).
-- - Mejor suplente: los suplentes que salieron al campo.
-- - Compromiso: cualquier convocado, haya jugado o no.
create function public.es_candidato(
  p_partido_id uuid,
  p_categoria public.categoria_votacion,
  p_jugador_id uuid
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.estadisticas_partido e
    where e.partido_id = p_partido_id
      and e.jugador_id = p_jugador_id
      and case p_categoria
        when 'mvp' then e.titular or e.minutos > 0
        when 'mejor_suplente' then not e.titular and e.minutos > 0
        when 'compromiso' then true
      end
  );
$$;

-- Cada cuenta ve solo sus propios votos (para saber a quién votó).
create policy "votos_leer_propios"
  on public.votos for select
  to authenticated
  using (perfil_id = auth.uid());

-- Votar: en nombre propio, con la votación abierta y a un candidato. No hay
-- políticas de update ni de delete: el voto no se cambia.
create policy "votos_votar"
  on public.votos for insert
  to authenticated
  with check (
    perfil_id = auth.uid()
    and public.votacion_abierta(partido_id)
    and public.es_candidato(partido_id, categoria, jugador_id)
  );

-- Votar con mensajes claros. Las reglas son las mismas de la política de
-- arriba (que se aplica igualmente al insert): esto solo da un error que se
-- puede enseñar tal cual (código P0001).
create function public.votar(
  p_partido_id uuid,
  p_categoria public.categoria_votacion,
  p_jugador_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Entra con tu cuenta para votar.' using errcode = '42501';
  end if;

  if not public.votacion_abierta(p_partido_id) then
    raise exception 'La votación de este partido no está abierta.';
  end if;

  if not public.es_candidato(p_partido_id, p_categoria, p_jugador_id) then
    raise exception 'Ese jugador no se puede votar en esta categoría.';
  end if;

  if exists (
    select 1 from public.votos
    where partido_id = p_partido_id
      and categoria = p_categoria
      and perfil_id = auth.uid()
  ) then
    raise exception 'Ya has votado en esta categoría.';
  end if;

  insert into public.votos (partido_id, categoria, jugador_id)
  values (p_partido_id, p_categoria, p_jugador_id);
end;
$$;

revoke execute on function public.votar(uuid, public.categoria_votacion, uuid)
  from public, anon;

-- Recuento de una votación, solo cuando ya está cerrada (antes devuelve
-- vacío). security definer para contar los votos de todos, que la RLS no
-- deja leer; solo sale el total por jugador, nunca quién votó a quién.
create function public.resultados_votacion(p_partido_id uuid)
returns table (
  categoria public.categoria_votacion,
  jugador_id uuid,
  votos integer
)
language sql
stable
security definer
set search_path = public
as $$
  select v.categoria, v.jugador_id, count(*)::integer
  from public.votos v
  where v.partido_id = p_partido_id
    and exists (
      select 1 from public.consultar_votacion(p_partido_id) c
      where c.estado = 'cerrada'
    )
  group by v.categoria, v.jugador_id
  order by v.categoria, count(*) desc;
$$;

comment on function public.resultados_votacion(uuid) is
  'Votos por categoría y jugador de un partido, solo con la votación cerrada.';

-- Ranking de una temporada (p_temporada = año en que empieza: 2026 es la
-- 2026/27, del 1 de julio al 30 de junio), con las votaciones ya cerradas.
-- Por categoría y jugador: cuántas veces ha ganado (con empate en un
-- partido, ganan todos los empatados) y cuántos votos suma.
create function public.ranking_votaciones(p_temporada integer)
returns table (
  categoria public.categoria_votacion,
  jugador_id uuid,
  victorias integer,
  votos integer
)
language sql
stable
security definer
set search_path = public
as $$
  with recuento as (
    select v.partido_id, v.categoria, v.jugador_id, count(*)::integer as votos
    from public.votos v
    join public.partidos p on p.id = v.partido_id
    where p.estado = 'jugado'
      and now() >= public.cierre_votacion(p.fecha_hora)
      and p.fecha_hora >= make_date(p_temporada, 7, 1)::timestamp
        at time zone 'Europe/Madrid'
      and p.fecha_hora < make_date(p_temporada + 1, 7, 1)::timestamp
        at time zone 'Europe/Madrid'
    group by v.partido_id, v.categoria, v.jugador_id
  ),
  con_ganador as (
    select
      r.*,
      r.votos = max(r.votos) over (partition by r.partido_id, r.categoria)
        as gano
    from recuento r
  )
  select
    categoria,
    jugador_id,
    (count(*) filter (where gano))::integer,
    sum(votos)::integer
  from con_ganador
  group by categoria, jugador_id
  order by categoria, 3 desc, 4 desc;
$$;

comment on function public.ranking_votaciones(integer) is
  'Ranking de una temporada por categoría: victorias y, para desempatar, votos.';
