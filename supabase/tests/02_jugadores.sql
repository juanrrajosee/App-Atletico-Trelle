-- Tests de RLS para "jugadores" y la vista "jugadores_roster".
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.entrenamientos
  cascade;

select plan(12);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'jugador-b@test.local'),
  ('c0000000-0000-0000-0000-000000000001', 'sin-vincular@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores
  (id, nombre, apellidos, dorsal, posicion, telefono, fecha_nacimiento, perfil_id)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    '600111222', '2000-01-01', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista',
    '600333444', '1999-05-05', 'b0000000-0000-0000-0000-000000000001');

-- El dorsal debe estar entre 1 y 99.
select throws_ok(
  $$ insert into public.jugadores (nombre, apellidos, dorsal, posicion)
     values ('X', 'Y', 0, 'portero') $$,
  '23514',
  null,
  'el dorsal no puede ser 0'
);

-- El dorsal es único entre jugadores que no estén de baja.
select throws_ok(
  $$ insert into public.jugadores (nombre, apellidos, dorsal, posicion)
     values ('Otra', 'Delantera', 7, 'delantero') $$,
  '23505',
  null,
  'el dorsal debe ser único entre jugadores activos'
);

-- ...pero si el que lo tenía está de baja, el dorsal queda libre.
update public.jugadores set estado = 'baja'
  where id = 'a0000000-0000-0000-0000-00000000000a';

insert into public.jugadores (nombre, apellidos, dorsal, posicion)
  values ('Otra', 'Delantera', 7, 'delantero');

select ok(true, 'el dorsal de un jugador de baja lo puede usar otro');

delete from public.jugadores where nombre = 'Otra';

update public.jugadores set estado = 'disponible'
  where id = 'a0000000-0000-0000-0000-00000000000a';

-- Como el entrenador: gestión completa.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.jugadores)::int, 2,
  'el entrenador ve toda la plantilla, con todas sus columnas'
);

update public.jugadores set estado = 'lesionado'
  where id = 'a0000000-0000-0000-0000-00000000000a';

select is(
  (select estado::text from public.jugadores where id = 'a0000000-0000-0000-0000-00000000000a'),
  'lesionado',
  'el entrenador puede editar la ficha de un jugador'
);

reset role;

-- Como un jugador vinculado: solo su propia ficha completa.
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.jugadores)::int, 1,
  'un jugador solo ve su propia ficha en la tabla base'
);

select is(
  (select telefono from public.jugadores limit 1),
  '600333444',
  'un jugador ve su propio teléfono'
);

-- La vista pública sí incluye a todo el mundo, pero sin teléfono ni
-- fecha de nacimiento.
select is(
  (select count(*) from public.jugadores_roster)::int, 2,
  'el roster público lista a toda la plantilla'
);

select throws_ok(
  $$ select telefono from public.jugadores_roster $$,
  '42703',
  null,
  'el roster público no expone el teléfono'
);

select is(
  (select estado::text from public.jugadores_roster
   where id = 'a0000000-0000-0000-0000-00000000000a'),
  'lesionado',
  'el roster público sí muestra el estado del jugador'
);

-- Un jugador no puede editar ni siquiera su propia ficha.
update public.jugadores set nombre = 'Cambiado'
  where id = 'b0000000-0000-0000-0000-00000000000b';

reset role;

select is(
  (select nombre from public.jugadores where id = 'b0000000-0000-0000-0000-00000000000b'),
  'Bea',
  'un jugador no puede editar su propia ficha'
);

-- Una cuenta de jugador sin vincular no ve nada.
set local role authenticated;
set local request.jwt.claim.sub = 'c0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.jugadores_roster)::int, 0,
  'una cuenta sin vincular no ve el roster del equipo'
);

select * from finish();
rollback;
