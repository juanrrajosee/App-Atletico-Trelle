-- Tests de RLS y reglas de la clasificación de la liga.
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.clasificacion cascade;

select plan(16);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.clasificacion
  (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos, ultimos, zona)
values
  (2026, 1, 'Equipo Uno', 7, 3, 2, 1, 0, 'GGE', 'ascenso');

-- Sin sesión.
set local role anon;
set local request.jwt.claim.sub = '';

select is(
  (select count(*)::int from public.clasificacion), 1,
  'sin cuenta se lee la clasificación'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2026, 2, 'X', 0, 0, 0, 0, 0) $$,
  '42501', null,
  'sin cuenta no se puede añadir un equipo'
);

reset role;

-- Como un aficionado.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.clasificacion), 1,
  'un aficionado también la lee'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2026, 2, 'X', 0, 0, 0, 0, 0) $$,
  '42501', null,
  'un aficionado no puede añadir un equipo'
);

-- Un update o un delete sin permiso no dan error: RLS no le deja ver ninguna
-- fila de las que cambiaría, así que no toca nada.
update public.clasificacion set puntos = 99;
delete from public.clasificacion;

reset role;

select is(
  (select puntos::int from public.clasificacion), 7,
  'ni cambiar los puntos'
);

select is(
  (select count(*)::int from public.clasificacion), 1,
  'ni borrar equipos'
);

-- Como el administrador.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos, sancion)
     values (2026, 2, 'Equipo Dos', 3, 3, 1, 0, 2, 1) $$,
  'el administrador añade un equipo'
);

select lives_ok(
  $$ update public.clasificacion set puntos = 4, ultimos = 'PGP' where equipo = 'Equipo Dos' $$,
  'le cambia los datos'
);

select lives_ok(
  $$ delete from public.clasificacion where equipo = 'Equipo Dos' $$,
  'y lo quita'
);

-- Las reglas de los datos.
select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2026, 1, 'Otro', 0, 0, 0, 0, 0) $$,
  '23505', null,
  'dos equipos no pueden ir en la misma posición'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2026, 2, 'Equipo Uno', 0, 0, 0, 0, 0) $$,
  '23505', null,
  'ni un equipo salir dos veces en la misma temporada'
);

select lives_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2025, 1, 'Equipo Uno', 0, 0, 0, 0, 0) $$,
  'pero sí en otra temporada'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos)
     values (2026, 3, 'X', 3, 2, 1, 0, 0) $$,
  '23514', null,
  'los ganados, empatados y perdidos suman los jugados'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos, ultimos)
     values (2026, 3, 'X', 0, 0, 0, 0, 0, 'GGX') $$,
  '23514', null,
  'los últimos resultados solo llevan G, E o P'
);

select throws_ok(
  $$ insert into public.clasificacion (temporada, posicion, equipo, puntos, jugados, ganados, empatados, perdidos, zona)
     values (2026, 3, 'X', 0, 0, 0, 0, 0, 'campeon') $$,
  '23514', null,
  'la zona es ascenso, promoción o descenso'
);

reset role;

select is(
  (select count(*)::int from public.clasificacion where temporada = 2026), 1,
  'en la temporada queda solo el equipo que estaba'
);

select * from finish();
rollback;
