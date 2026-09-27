-- Tests de RLS de la tienda: productos y fotos.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.productos cascade;
-- Storage no deja borrar sus filas con SQL si no es desde su API, que activa
-- esta opción. Aquí se activa para poder probar las políticas de borrado.
set local storage.allow_delete_query = 'true';
delete from storage.objects where bucket_id = 'productos';

select plan(14);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.productos (nombre, precio_orientativo, visible) values
  ('Visible', 20, true),
  ('Oculto', null, false);

insert into storage.objects (bucket_id, name) values ('productos', 'y/existente.jpg');

select throws_ok(
  $$ insert into public.productos (nombre, precio_orientativo) values ('X', -1) $$,
  '23514', null,
  'el precio no puede ser negativo'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select results_eq(
  $$ select nombre from public.productos $$,
  $$ values ('Visible') $$,
  'sin cuenta se ven los productos visibles, no los ocultos'
);

select throws_ok(
  $$ insert into public.productos (nombre) values ('Nuevo') $$,
  '42501', null,
  'sin cuenta no se añaden productos'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('productos', 'x/foto.jpg') $$,
  '42501', null,
  'sin cuenta no se suben fotos'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.productos), 1,
  'un aficionado tampoco ve los ocultos'
);

select throws_ok(
  $$ insert into public.productos (nombre) values ('Nuevo') $$,
  '42501', null,
  'un aficionado no añade productos'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('productos', 'x/foto.jpg') $$,
  '42501', null,
  'ni sube fotos'
);

delete from storage.objects where bucket_id = 'productos';

reset role;

select is(
  (select count(*)::int from storage.objects where bucket_id = 'productos'), 1,
  'ni borra las que hay'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.productos), 2,
  'el administrador ve también los ocultos'
);

select lives_ok(
  $$ insert into public.productos (nombre, descripcion, precio_orientativo)
     values ('Nuevo', 'Descripción.', 12.50) $$,
  'el administrador añade productos'
);

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('productos', 'x/foto.jpg') $$,
  'y sube fotos'
);

select lives_ok(
  $$ delete from storage.objects where bucket_id = 'productos' and name = 'x/foto.jpg' $$,
  'y las borra'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('otro', 'x/foto.jpg') $$,
  '42501', null,
  'pero solo en el bucket de la tienda'
);

reset role;

select is(
  (select count(*)::int from storage.objects where bucket_id = 'productos'), 1,
  'la foto borrada ya no está (queda la que había)'
);

select * from finish();
rollback;
