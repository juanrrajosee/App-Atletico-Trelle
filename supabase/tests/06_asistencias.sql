-- Tests de RLS para "asistencias" (la asistencia es un dato personal:
-- un jugador solo ve la suya, no la de sus compañeros).
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.entrenamientos
  cascade;

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

insert into public.entrenamientos (id, fecha_hora, lugar)
  values ('e1111111-0000-0000-0000-000000000001', now() + interval '2 days', 'Campo municipal');

-- El entrenador pasa lista.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

insert into public.asistencias (entrenamiento_id, jugador_id, estado)
values
  ('e1111111-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'presente'),
  ('e1111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b', 'ausente');

select is(
  (select count(*) from public.asistencias)::int, 2,
  'el entrenador ve toda la asistencia al pasar lista'
);

reset role;

-- Como Ana: solo ve su propia asistencia.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.asistencias)::int, 1,
  'un jugador solo ve su propia asistencia'
);

select is(
  (select estado::text from public.asistencias limit 1),
  'presente',
  'la asistencia que ve es la suya'
);

-- Ana no puede pasarse lista a sí misma: no hay política de update para
-- el rol jugador en esta tabla, así que este update no afecta a nada.
update public.asistencias set estado = 'justificado'
  where jugador_id = 'a0000000-0000-0000-0000-00000000000a';

reset role;

select is(
  (select estado::text from public.asistencias
   where jugador_id = 'a0000000-0000-0000-0000-00000000000a'),
  'presente',
  'un jugador no puede pasarse lista a sí mismo'
);

-- Al borrar el entrenamiento se borran también sus asistencias.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

delete from public.entrenamientos where id = 'e1111111-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.asistencias)::int, 0,
  'borrar un entrenamiento borra también sus asistencias'
);

reset role;

select is(
  (select count(*) from public.asistencias)::int, 0,
  'las asistencias siguen borradas fuera de la sesión del entrenador'
);

select * from finish();
rollback;
