-- Tests de RLS del club y de la directiva.
begin;

-- Cada test parte de una base de datos vacía (salvo la fila única del club,
-- que se deja en blanco). Todo va dentro de la transacción: el rollback del
-- final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.directiva cascade;
update public.club
  set historia_club = null, historia_trelle = null, email = null,
    telefono = null, campo = null;

select plan(16);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.directiva (nombre, cargo, orden) values ('Persona Uno', 'Presidencia', 1);

select is((select count(*)::int from public.club), 1, 'el club tiene una sola fila');

select throws_ok(
  $$ insert into public.club (id) values (true) $$,
  '23505', null,
  'no se puede crear otra fila del club'
);

select throws_ok(
  $$ update public.club set email = 'no-es-un-email' $$,
  '23514', null,
  'el email tiene que tener forma de email'
);

select throws_ok(
  $$ update public.club set telefono = 'llámame' $$,
  '23514', null,
  'el teléfono, solo números'
);

select throws_ok(
  $$ update public.club set titular_cif = 'no vale' $$,
  '23514', null,
  'el CIF tiene nueve letras o cifras'
);

select throws_ok(
  $$ update public.club set email_privacidad = 'no-es-un-email' $$,
  '23514', null,
  'el email de privacidad tiene que tener forma de email'
);

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select is((select count(*)::int from public.club), 1, 'sin cuenta se lee el club');
select is((select count(*)::int from public.directiva), 1, 'y la directiva');

update public.club set historia_club = 'Cambiada';
select throws_ok(
  $$ insert into public.directiva (nombre, cargo) values ('X', 'Vocal') $$,
  '42501', null,
  'sin cuenta no se puede añadir a la directiva'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

update public.club set historia_club = 'Cambiada';
delete from public.directiva;
select throws_ok(
  $$ insert into public.directiva (nombre, cargo) values ('X', 'Vocal') $$,
  '42501', null,
  'un aficionado no puede añadir a la directiva'
);

reset role;

select is(
  (select coalesce(historia_club, 'vacía') from public.club), 'vacía',
  'ni sin cuenta ni un aficionado pueden cambiar el club'
);
select is(
  (select count(*)::int from public.directiva), 1,
  'ni borrar a la directiva'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ update public.club
     set historia_club = 'Texto.', email = 'club@ejemplo.com', telefono = '+34 600 000 000' $$,
  'el administrador cambia la información del club'
);

select lives_ok(
  $$ insert into public.directiva (nombre, cargo, orden) values ('Persona Dos', 'Vocal', 5) $$,
  'y añade a la directiva'
);

delete from public.club;

reset role;

select is((select count(*)::int from public.club), 1, 'ni el administrador puede borrar el club');
select is(
  (select historia_club from public.club), 'Texto.',
  'los cambios del administrador se guardan'
);

select * from finish();
rollback;
