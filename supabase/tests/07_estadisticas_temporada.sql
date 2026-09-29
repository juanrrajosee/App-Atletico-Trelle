-- Tests de las estadísticas de los jugadores por temporada.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(6);

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion) values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista');

insert into public.partidos
  (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra)
values
  -- Temporada 2025/26: dos jugados y uno aplazado.
  ('11111111-0000-0000-0000-000000000001', 'Uno', '2025-10-05 15:00+00', 'local', 'jugado', 3, 0),
  ('22222222-0000-0000-0000-000000000002', 'Dos', '2026-03-01 16:00+00', 'visitante', 'jugado', 1, 1),
  ('33333333-0000-0000-0000-000000000003', 'Aplazado', '2025-11-09 16:00+00', 'local', 'aplazado', null, null),
  -- El 1 de julio a las 00:30 de España ya es la temporada 2026/27.
  ('44444444-0000-0000-0000-000000000004', 'Siguiente', '2026-06-30 22:30+00', 'local', 'jugado', 1, 0);

insert into public.estadisticas_partido
  (partido_id, jugador_id, titular, minutos, goles, asistencias,
   tarjetas_amarillas, tarjeta_roja)
values
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', true, 90, 2, 0, 1, false),
  ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', false, 0, 0, 0, 0, false),
  ('22222222-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-00000000000a', true, 80, 1, 1, 0, true),
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-00000000000b', false, 20, 0, 1, 2, false),
  -- En un partido sin jugar no cuenta nada (aunque tuviera filas).
  ('33333333-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-00000000000a', true, 90, 5, 0, 0, false),
  ('44444444-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-00000000000a', true, 90, 1, 0, 0, false);

select is(
  public.inicio_temporada(2025), '2025-06-30 22:00+00'::timestamptz,
  'la temporada empieza el 1 de julio a las 00:00 de España'
);

-- Sin sesión, como cualquiera que abre la aplicación.
set local role anon;
set local request.jwt.claim.sub = '';

select results_eq(
  $$ select convocatorias, partidos_jugados, titularidades, minutos, goles,
       asistencias, tarjetas_amarillas, tarjetas_rojas
     from public.estadisticas_jugadores(2025)
     where jugador_id = 'a0000000-0000-0000-0000-00000000000a' $$,
  $$ values (2, 2, 2, 170, 3, 1, 1, 1) $$,
  'suma los partidos jugados de la temporada'
);

select results_eq(
  $$ select convocatorias, partidos_jugados, titularidades, minutos, goles,
       asistencias, tarjetas_amarillas, tarjetas_rojas
     from public.estadisticas_jugadores(2025)
     where jugador_id = 'b0000000-0000-0000-0000-00000000000b' $$,
  $$ values (2, 1, 0, 20, 0, 1, 2, 0) $$,
  'un suplente que no sale cuenta como convocado, no como jugado'
);

select results_eq(
  $$ select goles from public.estadisticas_jugadores(2026)
     where jugador_id = 'a0000000-0000-0000-0000-00000000000a' $$,
  $$ values (1) $$,
  'cada partido cuenta en su temporada'
);

select is(
  (select count(*)::int from public.estadisticas_jugadores(2024)), 0,
  'una temporada sin partidos no tiene estadísticas'
);

reset role;

-- El ranking de las votaciones sigue funcionando con la nueva definición.
insert into public.votos (partido_id, categoria, perfil_id, jugador_id) values
  ('22222222-0000-0000-0000-000000000002', 'mvp', null, 'b0000000-0000-0000-0000-00000000000b');

select results_eq(
  $$ select categoria::text, jugador_id, victorias, votos
     from public.ranking_votaciones(2025) $$,
  $$ values ('mvp', 'b0000000-0000-0000-0000-00000000000b'::uuid, 1, 1) $$,
  'el ranking de las votaciones usa la misma temporada'
);

select * from finish();
rollback;
