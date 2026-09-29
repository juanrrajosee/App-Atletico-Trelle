-- Tests de la coherencia de los resultados y de guardar_alineacion().
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(17);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista');

-- Resultado coherente con el estado.
select throws_ok(
  $$ insert into public.partidos (rival, fecha_hora, condicion, estado)
     values ('X', now(), 'local', 'jugado') $$,
  '23514', null,
  'un partido jugado necesita el resultado'
);

select throws_ok(
  $$ insert into public.partidos (rival, fecha_hora, condicion, goles_favor, goles_contra)
     values ('X', now(), 'local', 1, 0) $$,
  '23514', null,
  'un partido programado no puede tener resultado'
);

select throws_ok(
  $$ insert into public.partidos (rival, fecha_hora, condicion, estado, goles_favor)
     values ('X', now(), 'local', 'jugado', 1) $$,
  '23514', null,
  'no vale un resultado a medias'
);

insert into public.partidos
  (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra)
values
  ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() - interval '1 day',
    'local', 'jugado', 2, 1),
  ('22222222-0000-0000-0000-000000000002', 'CD Otro', now() + interval '7 days',
    'visitante', 'programado', null, null);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[
       {"jugador_id": "a0000000-0000-0000-0000-00000000000a", "titular": true,
        "minutos": 90, "goles": 2, "asistencias": 0, "tarjetas_amarillas": 1,
        "tarjeta_roja": false},
       {"jugador_id": "b0000000-0000-0000-0000-00000000000b", "titular": false,
        "minutos": 20, "goles": 0, "asistencias": 1, "tarjetas_amarillas": 0,
        "tarjeta_roja": false}
     ]'::jsonb) $$,
  'el administrador guarda la alineación de un partido jugado'
);

select is(
  (select count(*) from public.estadisticas_partido)::int, 2,
  'se guardan las dos filas'
);

-- Volver a guardar reemplaza la alineación, no la duplica.
select lives_ok(
  $$ select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[
       {"jugador_id": "a0000000-0000-0000-0000-00000000000a", "titular": true,
        "minutos": 80, "goles": 1, "asistencias": 1, "tarjetas_amarillas": 0,
        "tarjeta_roja": false}
     ]'::jsonb) $$,
  'se puede volver a guardar'
);

select is(
  (select count(*)::int || '-' || max(minutos)::text from public.estadisticas_partido),
  '1-80',
  'la nueva alineación sustituye a la anterior'
);

select is(
  (select alineacion_registrada_en from public.partidos
   where id = '11111111-0000-0000-0000-000000000001'),
  now(),
  'al registrar la alineación se apunta cuándo (abre la votación)'
);

reset role;
update public.partidos set alineacion_registrada_en = now() - interval '1 hour'
  where id = '11111111-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[
  {"jugador_id": "a0000000-0000-0000-0000-00000000000a", "titular": true,
   "minutos": 80, "goles": 1, "asistencias": 1, "tarjetas_amarillas": 0,
   "tarjeta_roja": false}
]'::jsonb);

select is(
  (select alineacion_registrada_en from public.partidos
   where id = '11111111-0000-0000-0000-000000000001'),
  now() - interval '1 hour',
  'volver a guardarla no alarga la votación'
);

select throws_ok(
  $$ select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[
       {"jugador_id": "a0000000-0000-0000-0000-00000000000a", "titular": true,
        "minutos": 90, "goles": 3, "asistencias": 0, "tarjetas_amarillas": 0,
        "tarjeta_roja": false}
     ]'::jsonb) $$,
  'P0001', null,
  'los goles de los jugadores no pueden pasar de los del equipo'
);

select is(
  (select max(minutos)::int from public.estadisticas_partido), 80,
  'si falla, la alineación anterior se queda como estaba'
);

-- Con la alineación guardada (1 gol de Ana), el resultado ya no puede
-- quedarse por debajo ni desaparecer.
select throws_ok(
  $$ update public.partidos set goles_favor = 0
     where id = '11111111-0000-0000-0000-000000000001' $$,
  'P0001', null,
  'no se pueden bajar los goles por debajo de los de los jugadores'
);

select throws_ok(
  $$ update public.partidos
     set estado = 'programado', goles_favor = null, goles_contra = null
     where id = '11111111-0000-0000-0000-000000000001' $$,
  'P0001', null,
  'no se puede quitar el resultado a un partido con alineación'
);

select lives_ok(
  $$ update public.partidos set goles_favor = 1
     where id = '11111111-0000-0000-0000-000000000001' $$,
  'sí se puede corregir el resultado si sigue cuadrando'
);

select throws_ok(
  $$ select public.guardar_alineacion('22222222-0000-0000-0000-000000000002', '[]'::jsonb) $$,
  'P0001', null,
  'no se guarda la alineación de un partido sin jugar'
);

reset role;

-- Como un aficionado: no puede.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[]'::jsonb) $$,
  '42501', null,
  'un aficionado no puede guardar alineaciones'
);

reset role;

-- Sin sesión: ni siquiera puede llamar a la función.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ select public.guardar_alineacion('11111111-0000-0000-0000-000000000001', '[]'::jsonb) $$,
  '42501', null,
  'sin sesión no se puede llamar a la función'
);

select * from finish();
rollback;
