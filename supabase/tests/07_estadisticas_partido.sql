-- Tests de RLS para "estadisticas_partido" (públicas dentro del equipo,
-- como una clasificación interna).
begin;
select plan(6);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'jugador-b@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, perfil_id)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista',
    'b0000000-0000-0000-0000-000000000001');

insert into public.partidos (id, rival, fecha_hora, condicion, estado)
  values ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() - interval '1 day', 'local', 'jugado');

-- El entrenador registra las estadísticas del partido.
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
    true, 75, 0, 2, 1);

select is(
  (select count(*) from public.estadisticas_partido)::int, 2,
  'el entrenador registra las estadísticas del partido'
);

reset role;

-- Como Bea: ve las estadísticas de todo el equipo, como una clasificación.
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.estadisticas_partido)::int, 2,
  'un jugador ve las estadísticas de todo el equipo'
);

select is(
  (select goles::int from public.estadisticas_partido
   where jugador_id = 'a0000000-0000-0000-0000-00000000000a'),
  2,
  'incluidas las de sus compañeros'
);

-- Bea no puede tocar sus propias estadísticas.
update public.estadisticas_partido set goles = 99
  where jugador_id = 'b0000000-0000-0000-0000-00000000000b';

reset role;

select is(
  (select goles::int from public.estadisticas_partido
   where jugador_id = 'b0000000-0000-0000-0000-00000000000b'),
  0,
  'un jugador no puede editar sus propias estadísticas'
);

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
