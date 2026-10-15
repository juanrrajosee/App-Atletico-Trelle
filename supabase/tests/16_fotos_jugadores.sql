-- Tests de las fotos de los jugadores (bucket "jugadores").
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;
-- Storage no deja borrar sus filas con SQL si no es desde su API, que activa
-- esta opción. Aquí se activa para poder probar las políticas de borrado.
set local storage.allow_delete_query = 'true';
delete from storage.objects where bucket_id = 'jugadores';

select plan(14);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, estado, foto)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Hugo', 'Ruiz Soto', 1, 'portero',
   'lesionado', 'a0000000-0000-0000-0000-00000000000a/foto.jpg'),
  ('b0000000-0000-0000-0000-00000000000b', 'Ana', 'Pérez', 9, 'delantero',
   'disponible', null);

insert into storage.objects (bucket_id, name)
values ('jugadores', 'a0000000-0000-0000-0000-00000000000a/foto.jpg');

select is(
  (select public from storage.buckets where id = 'jugadores'), true,
  'el bucket de los jugadores es público (las fotos se ven sin sesión)'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select is(
  (select foto from public.jugadores_publicos
   where id = 'a0000000-0000-0000-0000-00000000000a'),
  'a0000000-0000-0000-0000-00000000000a/foto.jpg',
  'la vista pública enseña la foto'
);

select is(
  (select foto from public.jugadores_publicos
   where id = 'b0000000-0000-0000-0000-00000000000b'),
  null,
  'y nada si el jugador no tiene'
);

select throws_ok(
  $$ select estado from public.jugadores_publicos $$,
  '42703', null,
  'la vista sigue sin enseñar el estado'
);

select is(
  (select count(*)::int from public.jugadores), 0,
  'sin cuenta sigue sin leerse la tabla de jugadores'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('jugadores', 'x/foto.jpg') $$,
  '42501', null,
  'sin cuenta no se suben fotos de jugadores'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('jugadores', 'x/foto.jpg') $$,
  '42501', null,
  'un aficionado no sube fotos de jugadores'
);

-- Un update sin permiso no da error: RLS no le deja ver ninguna fila, así que
-- no cambia nada.
update public.jugadores set foto = 'x/otra.jpg';

delete from storage.objects where bucket_id = 'jugadores';

reset role;

select is(
  (select foto from public.jugadores where id = 'a0000000-0000-0000-0000-00000000000a'),
  'a0000000-0000-0000-0000-00000000000a/foto.jpg',
  'ni cambia la foto de un jugador'
);

select is(
  (select count(*)::int from storage.objects where bucket_id = 'jugadores'), 1,
  'ni borra las fotos que hay'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('jugadores', 'x/foto.jpg') $$,
  'el administrador sube fotos de jugadores'
);

select lives_ok(
  $$ update public.jugadores set foto = 'x/foto.jpg'
     where id = 'b0000000-0000-0000-0000-00000000000b' $$,
  'y se la pone a un jugador'
);

select lives_ok(
  $$ delete from storage.objects where bucket_id = 'jugadores' and name = 'x/foto.jpg' $$,
  'y las borra'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('otro', 'x/foto.jpg') $$,
  '42501', null,
  'pero solo en los buckets que tiene permitidos'
);

reset role;

select is(
  (select count(*)::int from storage.objects where bucket_id = 'jugadores'), 1,
  'la foto borrada ya no está (queda la que había)'
);

select * from finish();
rollback;
