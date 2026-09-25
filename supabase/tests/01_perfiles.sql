-- Tests de RLS para la tabla "perfiles".
begin;
select plan(6);

-- Fixture: una cuenta de entrenador y dos de jugador (el trigger
-- al_crear_usuario crea el perfil de cada una, con rol "jugador").
insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'jugador-b@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select rol::text from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'jugador',
  'una cuenta nueva empieza con el rol jugador'
);

-- Como el entrenador: ve todos los perfiles.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles)::int, 3,
  'el entrenador ve todos los perfiles'
);

reset role;

-- Como un jugador: solo ve su propio perfil.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles)::int, 1,
  'un jugador solo ve su propio perfil'
);

select is(
  (select id from public.perfiles limit 1)::text,
  'a0000000-0000-0000-0000-000000000001',
  'el perfil que ve un jugador es el suyo'
);

-- Un jugador no puede cambiarse el rol a sí mismo: no hay política de
-- update, así que la fila queda sin tocar (RLS deniega en silencio, no
-- hace falta que la sentencia lance un error).
update public.perfiles set rol = 'entrenador'
  where id = 'a0000000-0000-0000-0000-000000000001';

reset role;

select is(
  (select rol::text from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'jugador',
  'un jugador no puede ascenderse a entrenador desde la aplicación'
);

-- Como el otro jugador: no ve el perfil del primero.
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001')::int,
  0,
  'un jugador no ve el perfil de otro jugador'
);

select * from finish();
rollback;
