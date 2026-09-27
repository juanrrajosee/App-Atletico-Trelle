-- Tests de RLS de las noticias.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.noticias cascade;

select plan(12);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

-- El borrador se escribió ayer (para ver que al editarlo cambia la fecha de
-- edición: dentro de un test, now() es siempre el mismo instante).
insert into public.noticias
  (id, titulo, cuerpo, publicada_en, creado_en, actualizado_en)
values
  ('11111111-0000-0000-0000-000000000001', 'Publicada', 'Texto.',
    now() - interval '1 day', now(), now()),
  ('22222222-0000-0000-0000-000000000002', 'Borrador', 'Texto.',
    null, now() - interval '1 day', now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000003', 'Programada', 'Texto.',
    now() + interval '1 day', now(), now());

select throws_ok(
  $$ insert into public.noticias (titulo, cuerpo) values ('   ', 'Texto.') $$,
  '23514', null,
  'una noticia necesita título'
);

select throws_ok(
  $$ insert into public.noticias (titulo, cuerpo) values ('Título', '') $$,
  '23514', null,
  'y texto'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select results_eq(
  $$ select titulo from public.noticias $$,
  $$ values ('Publicada') $$,
  'sin cuenta solo se leen las publicadas (ni borradores ni programadas)'
);

select throws_ok(
  $$ insert into public.noticias (titulo, cuerpo) values ('Nueva', 'Texto.') $$,
  '42501', null,
  'sin cuenta no se puede escribir'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.noticias), 1,
  'un aficionado tampoco ve los borradores'
);

select throws_ok(
  $$ insert into public.noticias (titulo, cuerpo) values ('Nueva', 'Texto.') $$,
  '42501', null,
  'un aficionado no puede escribir noticias'
);

update public.noticias set titulo = 'Cambiada'
  where id = '11111111-0000-0000-0000-000000000001';
delete from public.noticias;

reset role;

select is(
  (select count(*)::int from public.noticias where titulo = 'Publicada'), 1,
  'ni cambiarlas ni borrarlas'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.noticias), 3,
  'el administrador ve también los borradores y las programadas'
);

select lives_ok(
  $$ insert into public.noticias (titulo, cuerpo) values ('Nueva', 'Texto.') $$,
  'el administrador escribe noticias'
);

select lives_ok(
  $$ update public.noticias set publicada_en = now()
     where id = '22222222-0000-0000-0000-000000000002' $$,
  'y las publica'
);

select lives_ok(
  $$ delete from public.noticias where titulo = 'Nueva' $$,
  'y las borra'
);

reset role;

select is(
  (select actualizado_en from public.noticias
   where id = '22222222-0000-0000-0000-000000000002'),
  now(),
  'al editarla se guarda cuándo'
);

select * from finish();
rollback;
