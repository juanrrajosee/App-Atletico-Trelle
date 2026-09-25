-- Tests de RLS para "entrenamientos".
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.entrenamientos
  cascade;

select plan(4);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, perfil_id)
  values ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    'a0000000-0000-0000-0000-000000000001');

-- Como el entrenador: crea un entrenamiento.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

insert into public.entrenamientos (id, fecha_hora, lugar)
  values ('e1111111-0000-0000-0000-000000000001', now() + interval '2 days', 'Campo municipal');

select is(
  (select count(*) from public.entrenamientos)::int, 1,
  'el entrenador puede crear un entrenamiento'
);

reset role;

-- Como un jugador vinculado: puede consultarlo, no editarlo.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select lugar from public.entrenamientos limit 1),
  'Campo municipal',
  'un jugador vinculado ve los entrenamientos'
);

update public.entrenamientos set lugar = 'Cambiado'
  where id = 'e1111111-0000-0000-0000-000000000001';

reset role;

select is(
  (select lugar from public.entrenamientos where id = 'e1111111-0000-0000-0000-000000000001'),
  'Campo municipal',
  'un jugador no puede editar un entrenamiento'
);

-- Borrar el entrenamiento se lleva por delante sus asistencias (lo prueba
-- el test de asistencias); aquí solo comprobamos que el entrenador puede.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

delete from public.entrenamientos where id = 'e1111111-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.entrenamientos)::int, 0,
  'el entrenador puede borrar un entrenamiento'
);

select * from finish();
rollback;
