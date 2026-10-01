-- Tests de las fotos de las noticias (bucket "noticias").
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.noticias cascade;
-- Storage no deja borrar sus filas con SQL si no es desde su API, que activa
-- esta opción. Aquí se activa para poder probar las políticas de borrado.
set local storage.allow_delete_query = 'true';
delete from storage.objects where bucket_id = 'noticias';

select plan(9);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into storage.objects (bucket_id, name) values ('noticias', 'y/existente.jpg');

select is(
  (select public from storage.buckets where id = 'noticias'), true,
  'el bucket de las noticias es público (las fotos se ven sin sesión)'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('noticias', 'x/foto.jpg') $$,
  '42501', null,
  'sin cuenta no se suben fotos de noticias'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('noticias', 'x/foto.jpg') $$,
  '42501', null,
  'un aficionado no sube fotos de noticias'
);

delete from storage.objects where bucket_id = 'noticias';

reset role;

select is(
  (select count(*)::int from storage.objects where bucket_id = 'noticias'), 1,
  'ni borra las que hay'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ insert into public.noticias (titulo, cuerpo, foto)
     values ('Con foto', 'Texto.', 'n/portada.jpg') $$,
  'el administrador guarda una noticia con foto'
);

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('noticias', 'x/foto.jpg') $$,
  'y sube fotos de noticias'
);

select lives_ok(
  $$ delete from storage.objects where bucket_id = 'noticias' and name = 'x/foto.jpg' $$,
  'y las borra'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('otro', 'x/foto.jpg') $$,
  '42501', null,
  'pero solo en los buckets que tiene permitidos'
);

reset role;

select is(
  (select count(*)::int from storage.objects where bucket_id = 'noticias'), 1,
  'la foto borrada ya no está (queda la que había)'
);

select * from finish();
rollback;
