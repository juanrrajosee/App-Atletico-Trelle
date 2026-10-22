-- Tests de las fotos de los productos (la lista "fotos").
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.productos cascade;

select plan(14);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.productos (id, nombre, orden, fotos) values
  ('c0000000-0000-0000-0000-00000000000c', 'Sudadera', 1,
   array['c0/uno.jpg', 'c0/dos.jpg', 'c0/tres.jpg']);
insert into public.productos (id, nombre, orden) values
  ('d0000000-0000-0000-0000-00000000000d', 'Bufanda', 2);
insert into public.productos (id, nombre, orden, visible, fotos) values
  ('f0000000-0000-0000-0000-00000000000f', 'Oculto', 3, false, array['f0/a.jpg']);

select is(
  (select fotos from public.productos where nombre = 'Bufanda'), '{}'::text[],
  'un producto nuevo no tiene fotos (lista vacía, no nula)'
);

-- La foto antigua pasa a la lista (la misma sentencia de la migración).
insert into public.productos (nombre, orden, foto) values ('Antiguo', 4, 'a0/vieja.jpg');
update public.productos set fotos = array[foto] where foto is not null and nombre = 'Antiguo';
select is(
  (select fotos from public.productos where nombre = 'Antiguo'), array['a0/vieja.jpg'],
  'la foto que tenía un producto pasa a ser la primera de la lista'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select is(
  (select fotos from public.productos where nombre = 'Sudadera'),
  array['c0/uno.jpg', 'c0/dos.jpg', 'c0/tres.jpg'],
  'sin cuenta se ven las fotos, en su orden'
);
select is(
  (select count(*)::int from public.productos where nombre = 'Oculto'), 0,
  'pero no las de un producto oculto'
);

update public.productos set fotos = '{}' where nombre = 'Sudadera';

reset role;
select is(
  (select cardinality(fotos) from public.productos where nombre = 'Sudadera'), 3,
  'sin cuenta no se cambian las fotos de un producto'
);

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

update public.productos set fotos = '{}' where nombre = 'Sudadera';

reset role;
select is(
  (select cardinality(fotos) from public.productos where nombre = 'Sudadera'), 3,
  'un aficionado tampoco'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ update public.productos set fotos = array['c0/dos.jpg', 'c0/uno.jpg'] where nombre = 'Sudadera' $$,
  'el administrador cambia las fotos y su orden'
);
select lives_ok(
  $$ update public.productos set fotos = array['a','b','c','d','e','f'] where nombre = 'Bufanda' $$,
  'hasta 6 fotos'
);
select throws_ok(
  $$ update public.productos set fotos = array['a','b','c','d','e','f','g'] where nombre = 'Bufanda' $$,
  '23514', null,
  'a la séptima, la base de datos no la deja'
);
select throws_ok(
  $$ update public.productos set fotos = array['a', null] where nombre = 'Bufanda' $$,
  '23514', null,
  'una lista con huecos tampoco'
);
select throws_ok(
  $$ update public.productos set fotos = null where nombre = 'Bufanda' $$,
  '23502', null,
  'ni una lista nula (sin fotos es una lista vacía)'
);

reset role;

select is(
  (select fotos from public.productos where nombre = 'Sudadera'),
  array['c0/dos.jpg', 'c0/uno.jpg'],
  'el orden cambiado se queda guardado'
);

-- El tope no depende de quién escriba.
select throws_ok(
  $$ insert into public.productos (nombre, orden, fotos) values ('Demasiadas', 5, array['1','2','3','4','5','6','7']) $$,
  '23514', null,
  'ni siquiera creando el producto con 7 fotos'
);
select is(
  (select count(*)::int from public.productos where nombre = 'Demasiadas'), 0,
  'y no queda creado'
);

select * from finish();
rollback;
