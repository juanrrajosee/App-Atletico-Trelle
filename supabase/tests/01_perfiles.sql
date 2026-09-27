-- Tests de RLS para la tabla "perfiles".
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(7);

-- Fixture: una cuenta de administrador y dos de aficionado (el trigger
-- al_crear_usuario crea el perfil de cada una, con rol "aficionado").
insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'aficionado-b@test.local');

select is(
  (select rol::text from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'aficionado',
  'una cuenta nueva empieza con el rol aficionado'
);

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

-- Como el administrador: ve todos los perfiles.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles)::int, 3,
  'el administrador ve todos los perfiles'
);

reset role;

-- Como un aficionado: solo ve su propio perfil.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles)::int, 1,
  'un aficionado solo ve su propio perfil'
);

select is(
  (select id from public.perfiles limit 1)::text,
  'a0000000-0000-0000-0000-000000000001',
  'el perfil que ve un aficionado es el suyo'
);

-- No puede hacerse administrador: no hay política de update, así que la
-- fila queda sin tocar (RLS deniega en silencio).
update public.perfiles set rol = 'administrador'
  where id = 'a0000000-0000-0000-0000-000000000001';

reset role;

select is(
  (select rol::text from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'aficionado',
  'un aficionado no puede hacerse administrador desde la aplicación'
);

-- Como el otro aficionado: no ve el perfil del primero.
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001')::int,
  0,
  'un aficionado no ve el perfil de otro'
);

reset role;

-- Sin sesión: no ve ningún perfil.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select is(
  (select count(*) from public.perfiles)::int, 0,
  'sin sesión no se ve ningún perfil'
);

select * from finish();
rollback;
