-- Tests de RLS para "jugadores" y la vista pública "jugadores_publicos".
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(13);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, estado)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero', 'lesionado'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista', 'baja');

-- Restricciones del dorsal.
select throws_ok(
  $$ insert into public.jugadores (nombre, apellidos, dorsal, posicion)
     values ('X', 'Y', 0, 'portero') $$,
  '23514',
  null,
  'el dorsal no puede ser 0'
);

select throws_ok(
  $$ insert into public.jugadores (nombre, apellidos, dorsal, posicion)
     values ('Otra', 'Delantera', 7, 'delantero') $$,
  '23505',
  null,
  'el dorsal debe ser único entre jugadores activos'
);

-- El 9 lo llevaba Bea, que está de baja: queda libre.
insert into public.jugadores (nombre, apellidos, dorsal, posicion)
  values ('Otra', 'Centrocampista', 9, 'centrocampista');
select ok(true, 'el dorsal de un jugador de baja lo puede usar otro');
delete from public.jugadores where nombre = 'Otra';

-- Como el administrador: gestión completa, con el estado.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.jugadores)::int, 2,
  'el administrador ve la tabla completa'
);

update public.jugadores set estado = 'disponible'
  where id = 'a0000000-0000-0000-0000-00000000000a';

select is(
  (select estado::text from public.jugadores where id = 'a0000000-0000-0000-0000-00000000000a'),
  'disponible',
  'el administrador puede editar a un jugador'
);

update public.jugadores set estado = 'lesionado'
  where id = 'a0000000-0000-0000-0000-00000000000a';

reset role;

-- Como un aficionado: no lee la tabla ni puede escribir en ella.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.jugadores)::int, 0,
  'un aficionado no lee la tabla de jugadores (con el estado)'
);

select throws_ok(
  $$ insert into public.jugadores (nombre, apellidos, dorsal, posicion)
     values ('Intrusa', 'Prueba', 30, 'portero') $$,
  '42501',
  null,
  'un aficionado no puede añadir jugadores'
);

update public.jugadores set nombre = 'Cambiado'
  where id = 'a0000000-0000-0000-0000-00000000000a';

reset role;

select is(
  (select nombre from public.jugadores where id = 'a0000000-0000-0000-0000-00000000000a'),
  'Ana',
  'un aficionado no puede editar jugadores'
);

-- Sin sesión: la tabla no, la vista pública sí.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select is(
  (select count(*) from public.jugadores)::int, 0,
  'sin sesión no se lee la tabla de jugadores'
);

select is(
  (select count(*) from public.jugadores_publicos)::int, 2,
  'sin sesión se ve la plantilla en la vista pública'
);

select throws_ok(
  $$ select estado from public.jugadores_publicos $$,
  '42703',
  null,
  'la vista pública no incluye el estado (lesiones)'
);

select is(
  (select activo from public.jugadores_publicos
   where id = 'b0000000-0000-0000-0000-00000000000b'),
  false,
  'la vista pública indica quién está de baja'
);

select is(
  (select activo from public.jugadores_publicos
   where id = 'a0000000-0000-0000-0000-00000000000a'),
  true,
  'un lesionado aparece como activo, sin más detalle'
);

select * from finish();
rollback;
