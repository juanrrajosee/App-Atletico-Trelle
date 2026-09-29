-- Estadísticas públicas de los jugadores, por temporada.

-- Cuándo empieza una temporada: el 1 de julio a las 00:00 (hora de España)
-- del año indicado. La 2026/27 es la temporada 2026: va desde
-- inicio_temporada(2026) hasta inicio_temporada(2027).
create function public.inicio_temporada(p_temporada integer)
returns timestamptz
language sql
immutable
set search_path = public
as $$
  select make_date(p_temporada, 7, 1)::timestamp at time zone 'Europe/Madrid';
$$;

-- Lo que ha hecho cada jugador en una temporada, sumando sus partidos
-- jugados (los programados o aplazados no cuentan):
-- - convocatorias: partidos en los que estuvo en la alineación;
-- - partidos_jugados: de titular o saliendo desde el banquillo;
-- - titularidades, minutos, goles, asistencias, amarillas y rojas.
--
-- security invoker: solo lee tablas que ya son públicas.
create function public.estadisticas_jugadores(p_temporada integer)
returns table (
  jugador_id uuid,
  convocatorias integer,
  partidos_jugados integer,
  titularidades integer,
  minutos integer,
  goles integer,
  asistencias integer,
  tarjetas_amarillas integer,
  tarjetas_rojas integer
)
language sql
stable
set search_path = public
as $$
  select
    e.jugador_id,
    count(*)::integer,
    (count(*) filter (where e.titular or e.minutos > 0))::integer,
    (count(*) filter (where e.titular))::integer,
    sum(e.minutos)::integer,
    sum(e.goles)::integer,
    sum(e.asistencias)::integer,
    sum(e.tarjetas_amarillas)::integer,
    (count(*) filter (where e.tarjeta_roja))::integer
  from public.estadisticas_partido e
  join public.partidos p on p.id = e.partido_id
  where p.estado = 'jugado'
    and p.fecha_hora >= public.inicio_temporada(p_temporada)
    and p.fecha_hora < public.inicio_temporada(p_temporada + 1)
  group by e.jugador_id;
$$;

comment on function public.estadisticas_jugadores(integer) is
  'Totales de cada jugador en una temporada (solo partidos jugados).';

-- El ranking de las votaciones pasa a usar la misma definición de
-- temporada. El resultado es el mismo que antes.
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
    where p.estado = 'jugado'
      and now() >= public.cierre_votacion(p.fecha_hora)
      and p.fecha_hora >= public.inicio_temporada(p_temporada)
      and p.fecha_hora < public.inicio_temporada(p_temporada + 1)
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
