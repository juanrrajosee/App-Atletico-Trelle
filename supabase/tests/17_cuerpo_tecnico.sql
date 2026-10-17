-- Tests de RLS y reglas del cuerpo técnico.
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.cuerpo_tecnico cascade;

select plan(13);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.cuerpo_tecnico (nombre, cargo, orden)
values ('Persona Uno', 'Entrenador', 1);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select is(
  (select count(*)::int from public.cuerpo_tecnico), 1,
  'sin cuenta se lee el cuerpo técnico'
);

select throws_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo) values ('X', 'Delegado') $$,
  '42501', null,
  'sin cuenta no se puede añadir a nadie'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.cuerpo_tecnico), 1,
  'un aficionado también lo lee'
);

select throws_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo) values ('X', 'Delegado') $$,
  '42501', null,
  'un aficionado no puede añadir a nadie'
);

-- Un update o un delete sin permiso no dan error: RLS no le deja ver ninguna
-- fila de las que cambiaría, así que no toca nada.
update public.cuerpo_tecnico set cargo = 'Otro';
delete from public.cuerpo_tecnico;

reset role;

select is(
  (select cargo from public.cuerpo_tecnico), 'Entrenador',
  'ni cambiar el cargo de nadie'
);

select is(
  (select count(*)::int from public.cuerpo_tecnico), 1,
  'ni borrar a nadie'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo, orden) values ('Persona Dos', 'Delegado', 2) $$,
  'el administrador añade a alguien'
);

select lives_ok(
  $$ update public.cuerpo_tecnico set cargo = 'Delegado de campo' where nombre = 'Persona Dos' $$,
  'le cambia el cargo'
);

select lives_ok(
  $$ delete from public.cuerpo_tecnico where nombre = 'Persona Dos' $$,
  'y lo quita'
);

-- Las reglas de los datos.
select throws_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo) values ('   ', 'Delegado') $$,
  '23514', null,
  'el nombre no puede estar vacío'
);

select throws_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo) values ('X', repeat('a', 61)) $$,
  '23514', null,
  'el cargo llega hasta 60 caracteres'
);

select throws_ok(
  $$ insert into public.cuerpo_tecnico (nombre, cargo, orden) values ('X', 'Delegado', 100) $$,
  '23514', null,
  'la posición en la lista llega hasta 99'
);

reset role;

select is(
  (select count(*)::int from public.cuerpo_tecnico), 1,
  'queda solo quien estaba'
);

select * from finish();
rollback;
