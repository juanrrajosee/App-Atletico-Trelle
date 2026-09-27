-- Tests de borrar la propia cuenta.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(7);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'aficionado-b@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

-- Un voto de la aficionada A en un partido ya cerrado.
insert into public.jugadores (id, nombre, apellidos, dorsal, posicion) values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero');
insert into public.partidos
  (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra)
values
  ('11111111-0000-0000-0000-000000000001', 'X', '2025-10-05 15:00+00', 'local', 'jugado', 1, 0);
insert into public.votos (partido_id, categoria, perfil_id, jugador_id) values
  ('11111111-0000-0000-0000-000000000001', 'mvp',
   'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a');

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ select public.borrar_mi_cuenta() $$,
  '42501', null,
  'sin sesión no se puede llamar'
);

reset role;

-- La aficionada A borra su cuenta.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ select public.borrar_mi_cuenta() $$,
  'una aficionada borra su cuenta'
);

reset role;

select is(
  (select count(*)::int from auth.users where id = 'a0000000-0000-0000-0000-000000000001'),
  0, 'la cuenta ya no existe'
);
select is(
  (select count(*)::int from public.perfiles where id = 'a0000000-0000-0000-0000-000000000001'),
  0, 'ni su perfil'
);
select is(
  (select count(*)::int from public.votos where perfil_id is null),
  1, 'su voto sigue contando, sin dueño'
);
select is(
  (select count(*)::int from auth.users), 2,
  'las demás cuentas siguen ahí'
);

-- Un administrador no puede borrarse.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ select public.borrar_mi_cuenta() $$,
  'P0001', 'Una cuenta de administrador no se puede borrar desde la aplicación.',
  'un administrador no puede borrar su cuenta desde la aplicación'
);

select * from finish();
rollback;
