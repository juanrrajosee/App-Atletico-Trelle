-- Tests de RLS para "estadisticas_partido": lectura pública, escritura del
-- administrador.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(7);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista');

insert into public.partidos (id, rival, fecha_hora, condicion, estado)
  values ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() - interval '1 day', 'local', 'jugado');

-- El administrador registra las estadísticas del partido.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

-- Las tarjetas amarillas no pueden pasar de 2 (se comprueba antes de
-- insertar las estadísticas reales, para no chocar con la restricción de
-- unicidad por partido y jugador).
select throws_ok(
  $$ insert into public.estadisticas_partido (partido_id, jugador_id, tarjetas_amarillas)
     values ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 3) $$,
  '23514',
  null,
  'no se pueden registrar más de 2 tarjetas amarillas'
);

insert into public.estadisticas_partido
  (partido_id, jugador_id, titular, minutos, goles, asistencias, tarjetas_amarillas)
values
  ('11111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a',
    true, 90, 2, 1, 0),
  ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b',
    false, 25, 0, 2, 1);

select is(
  (select count(*) from public.estadisticas_partido)::int, 2,
  'el administrador registra las estadísticas del partido'
);

reset role;

-- Como un aficionado: las ve, no las toca.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select goles::int from public.estadisticas_partido
   where jugador_id = 'a0000000-0000-0000-0000-00000000000a'),
  2,
  'un aficionado ve las estadísticas'
);

update public.estadisticas_partido set goles = 99;

select throws_ok(
  $$ insert into public.estadisticas_partido (partido_id, jugador_id)
     values ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b') $$,
  '42501',
  null,
  'un aficionado no puede registrar estadísticas'
);

reset role;

select is(
  (select max(goles)::int from public.estadisticas_partido),
  2,
  'un aficionado no puede editar estadísticas'
);

-- Sin sesión: también se ven.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select is(
  (select count(*) from public.estadisticas_partido)::int, 2,
  'sin sesión se ven las estadísticas'
);

reset role;

-- Al borrar el partido se borran también sus estadísticas.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

delete from public.partidos where id = '11111111-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.estadisticas_partido)::int, 0,
  'borrar un partido borra también sus estadísticas'
);

select * from finish();
rollback;
