-- Sin votación cuando el Atlético Trelle pierde por goleada.
--
-- Si el equipo pierde por 4 goles o más, el partido no abre votación: nadie
-- vota al MVP, al mejor suplente ni al más comprometido de un día así. Es un
-- estado nuevo de la votación, "sin_votacion", que se sabe en cuanto se
-- registra el resultado (sin esperar a la alineación) y no depende de la hora.
--
-- La regla manda en la base de datos: votar() y la política de los votos
-- (que solo dejan votar con la votación "abierta") ya no dejan votar en estos
-- partidos, ni siquiera saltándose la aplicación. Si un partido ya tenía votos
-- y luego su resultado se corrige a una goleada, esos votos no cuentan en el
-- ranking (solo cuentan las votaciones "cerradas").

alter type public.estado_votacion add value 'sin_votacion';

-- Con cuántos goles de diferencia en contra no hay votación. Para cambiar la
-- regla basta con cambiar este número (create or replace) en otra migración.
create function public.diferencia_sin_votacion()
returns integer
language sql
immutable
set search_path = public
as $$
  select 4;
$$;

comment on function public.diferencia_sin_votacion() is
  'Goles de diferencia en contra a partir de los cuales un partido no tiene votación.';

-- En qué punto está la votación de un partido y cuándo se cierra:
-- - pendiente: el partido no se ha jugado, o se ha jugado hace poco y aún no
--   tiene la alineación (sin ella no se sabe a quién se puede votar).
-- - sin_votacion: se ha jugado y se perdió por goleada: no se abre votación.
-- - abierta: durante las 24 horas siguientes a registrar la alineación
--   (mientras tenga alineación).
-- - cerrada: pasadas esas 24 horas.
--
-- Igual que antes (un partido de hace más de 7 días no abre votación aunque
-- se le registre ahora la alineación), con la goleada por delante de todo lo
-- demás. Es plpgsql porque un estado recién añadido a un tipo no se puede usar
-- en una función sql creada en la misma migración.
create or replace function public.consultar_votacion(p_partido_id uuid)
returns table (estado public.estado_votacion, cierre timestamptz)
language plpgsql
stable
set search_path = public
as $$
declare
  v_partido public.partidos;
  v_estado public.estado_votacion;
begin
  select * into v_partido from public.partidos where id = p_partido_id;

  if not found then
    return;
  end if;

  v_estado := case
    when v_partido.estado <> 'jugado' then 'pendiente'::public.estado_votacion
    when v_partido.goles_contra - v_partido.goles_favor
         >= public.diferencia_sin_votacion()
      then 'sin_votacion'::public.estado_votacion
    when v_partido.alineacion_registrada_en is null
      then case
        when now() < v_partido.fecha_hora + interval '7 days'
          then 'pendiente'::public.estado_votacion
        else 'cerrada'::public.estado_votacion
      end
    when v_partido.alineacion_registrada_en >= v_partido.fecha_hora + interval '7 days'
      then 'cerrada'::public.estado_votacion
    when now() >= v_partido.alineacion_registrada_en + interval '24 hours'
      then 'cerrada'::public.estado_votacion
    -- Si se ha vaciado la alineación, no hay a quién votar hasta que se
    -- registre otra (dentro de las mismas 24 horas).
    when not exists (
      select 1 from public.estadisticas_partido e
      where e.partido_id = v_partido.id
    ) then 'pendiente'::public.estado_votacion
    else 'abierta'::public.estado_votacion
  end;

  return query
  select
    v_estado,
    case
      when v_estado = 'sin_votacion'::public.estado_votacion then null
      else v_partido.alineacion_registrada_en + interval '24 hours'
    end;
end;
$$;

comment on function public.consultar_votacion(uuid) is
  'Estado de la votación de un partido (pendiente, sin_votacion, abierta o cerrada) y cuándo se cierra.';

-- votar() igual que antes, con un mensaje propio para los partidos sin
-- votación (las reglas de verdad siguen siendo las de la política de los
-- votos, que también se aplica al insert).
create or replace function public.votar(
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

  if exists (
    select 1 from public.consultar_votacion(p_partido_id) c
    where c.estado = 'sin_votacion'
  ) then
    raise exception 'En este partido no hay votación.';
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
