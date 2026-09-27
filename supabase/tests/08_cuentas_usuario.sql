-- Tests de la función cuentas_usuario(): emails de las cuentas, solo para
-- el entrenador.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.entrenamientos
  cascade;

select plan(5);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('c0000000-0000-0000-0000-000000000001', 'sin-vincular@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, perfil_id)
  values ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    'a0000000-0000-0000-0000-000000000001');

-- Como el entrenador: ve todas las cuentas, con su email y su vínculo.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.cuentas_usuario())::int, 3,
  'el entrenador ve todas las cuentas'
);

select is(
  (select jugador_id from public.cuentas_usuario()
   where email = 'jugador-a@test.local')::text,
  'a0000000-0000-0000-0000-00000000000a',
  'cada cuenta indica la ficha a la que está vinculada'
);

select is(
  (select count(*) from public.cuentas_usuario() where jugador_id is null)::int, 2,
  'las cuentas sin ficha se distinguen (incluida la del entrenador)'
);

reset role;

-- Como un jugador vinculado: no ve ninguna cuenta.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.cuentas_usuario())::int, 0,
  'un jugador no ve los emails de las cuentas'
);

reset role;

-- Sin sesión (rol anon) ni siquiera puede llamarla.
set local role anon;

select throws_ok(
  $$ select * from public.cuentas_usuario() $$,
  '42501',
  null,
  'sin sesión no se puede llamar a la función'
);

select * from finish();
rollback;
