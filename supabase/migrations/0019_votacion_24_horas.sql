-- La votación de un partido pasa a durar 24 horas desde que se registra su
-- alineación (antes se cerraba a las 23:59 del día del partido), para que
-- dé igual si la alineación se registra esa noche o al día siguiente.

-- Cuándo se registró la alineación por primera vez. Volver a guardarla
-- (para corregir algo) no alarga la votación.
alter table public.partidos add column alineacion_registrada_en timestamptz;

comment on column public.partidos.alineacion_registrada_en is
  'Cuándo se registró la alineación por primera vez: la votación dura 24 horas desde entonces.';

-- A los partidos que ya tenían alineación se les pone la hora del partido:
-- su votación ya pasó.
update public.partidos p
set alineacion_registrada_en = p.fecha_hora
where exists (
  select 1 from public.estadisticas_partido e where e.partido_id = p.id
);

-- guardar_alineacion() igual que antes, y además apunta cuándo se registró
-- la alineación la primera vez.
create or replace function public.guardar_alineacion(p_partido_id uuid, p_filas jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_partido public.partidos;
  v_goles_jugadores integer;
begin
  if not public.es_administrador() then
    raise exception 'Solo el administrador puede guardar alineaciones.'
      using errcode = '42501';
  end if;

  select * into v_partido from public.partidos where id = p_partido_id;

  if not found then
    raise exception 'El partido no existe.' using errcode = 'P0002';
  end if;

  if v_partido.estado <> 'jugado' then
    raise exception 'Solo se puede guardar la alineación de un partido jugado.';
  end if;

  -- Los goles de los jugadores no pueden pasar de los del equipo (pueden
  -- quedarse por debajo: un gol en propia puerta del rival no es de nadie).
  select coalesce(sum(f.goles), 0) into v_goles_jugadores
  from jsonb_to_recordset(p_filas) as f(goles smallint);

  if v_goles_jugadores > v_partido.goles_favor then
    raise exception 'Los goles de los jugadores (%) pasan de los que marcó el Atlético Trelle (%).',
      v_goles_jugadores, v_partido.goles_favor;
  end if;

  delete from public.estadisticas_partido where partido_id = p_partido_id;

  insert into public.estadisticas_partido (
    partido_id, jugador_id, titular, minutos, goles, asistencias,
    tarjetas_amarillas, tarjeta_roja
  )
  select
    p_partido_id, f.jugador_id, f.titular, f.minutos, f.goles,
    f.asistencias, f.tarjetas_amarillas, f.tarjeta_roja
  from jsonb_to_recordset(p_filas) as f(
    jugador_id uuid,
    titular boolean,
    minutos smallint,
    goles smallint,
    asistencias smallint,
    tarjetas_amarillas smallint,
    tarjeta_roja boolean
  );

  if jsonb_array_length(p_filas) > 0 and v_partido.alineacion_registrada_en is null then
    update public.partidos
    set alineacion_registrada_en = now()
    where id = p_partido_id;
  end if;
end;
$$;

-- En qué punto está la votación de un partido y cuándo se cierra:
-- - pendiente: el partido no se ha jugado, o se ha jugado hace poco y aún no
--   tiene la alineación (sin ella no se sabe a quién se puede votar).
-- - abierta: durante las 24 horas siguientes a registrar la alineación
--   (mientras tenga alineación).
-- - cerrada: pasadas esas 24 horas.
--
-- Un partido de hace más de 7 días no abre votación aunque se le registre
-- ahora la alineación (por ejemplo, al meter partidos antiguos): queda como
-- cerrada, sin votos.
create or replace function public.consultar_votacion(p_partido_id uuid)
returns table (estado public.estado_votacion, cierre timestamptz)
language sql
stable
set search_path = public
as $$
  select
    (case
      when p.estado <> 'jugado' then 'pendiente'
      when p.alineacion_registrada_en is null
        then case
          when now() < p.fecha_hora + interval '7 days' then 'pendiente'
          else 'cerrada'
        end
      when p.alineacion_registrada_en >= p.fecha_hora + interval '7 days'
        then 'cerrada'
      when now() >= p.alineacion_registrada_en + interval '24 hours'
        then 'cerrada'
      -- Si se ha vaciado la alineación, no hay a quién votar hasta que se
      -- registre otra (dentro de las mismas 24 horas).
      when not exists (
        select 1 from public.estadisticas_partido e where e.partido_id = p.id
      ) then 'pendiente'
      else 'abierta'
    end)::public.estado_votacion,
    p.alineacion_registrada_en + interval '24 hours'
  from public.partidos p
  where p.id = p_partido_id;
$$;

-- El ranking, igual que antes, pero con las votaciones cerradas según la
-- nueva regla.
create or replace function public.ranking_votaciones(p_temporada integer)
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
    where p.fecha_hora >= public.inicio_temporada(p_temporada)
      and p.fecha_hora < public.inicio_temporada(p_temporada + 1)
      and exists (
        select 1 from public.consultar_votacion(p.id) c
        where c.estado = 'cerrada'
      )
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

-- Ya no se usa: el cierre depende de la alineación, no del día del partido.
drop function public.cierre_votacion(timestamptz);
