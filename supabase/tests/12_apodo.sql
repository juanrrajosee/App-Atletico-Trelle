-- Tests del apodo de los jugadores.
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(6);

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, apodo)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Hugo', 'Ruiz Soto', 1, 'portero', 'Gato'),
  ('b0000000-0000-0000-0000-00000000000b', 'Ana', 'Pérez', 9, 'delantero', null);

select throws_ok(
  $$ update public.jugadores set apodo = '   '
     where id = 'b0000000-0000-0000-0000-00000000000b' $$,
  '23514',
  null,
  'el apodo no puede estar en blanco'
);

select throws_ok(
  $$ update public.jugadores set apodo = repeat('x', 31)
     where id = 'b0000000-0000-0000-0000-00000000000b' $$,
  '23514',
  null,
  'el apodo tiene como mucho 30 caracteres'
);

-- Sin sesión, por la vista pública.
set local role anon;
set local request.jwt.claim.sub = '';

select is(
  (select apodo from public.jugadores_publicos
   where id = 'a0000000-0000-0000-0000-00000000000a'),
  'Gato',
  'la vista pública enseña el apodo'
);

select is(
  (select apodo from public.jugadores_publicos
   where id = 'b0000000-0000-0000-0000-00000000000b'),
  null,
  'y nada si el jugador no tiene'
);

select throws_ok(
  $$ select estado from public.jugadores_publicos $$,
  '42703',
  null,
  'la vista sigue sin enseñar el estado'
);

select is(
  (select count(*)::int from public.jugadores),
  0,
  'sin cuenta sigue sin leerse la tabla de jugadores'
);

reset role;

select * from finish();
rollback;
