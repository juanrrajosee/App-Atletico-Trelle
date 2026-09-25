-- Tests de RLS para "convocatorias", incluido el trigger que limita lo
-- que puede cambiar un jugador.
begin;
select plan(10);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'jugador-b@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, perfil_id)
values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista',
    'b0000000-0000-0000-0000-000000000001');

insert into public.partidos (id, rival, fecha_hora, condicion)
  values ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() + interval '7 days', 'local');

-- El entrenador convoca a Ana, pero no a Bea.
insert into public.convocatorias (id, partido_id, jugador_id, convocado)
values
  ('c1111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-00000000000a', true),
  ('c1111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-00000000000b', false);

-- Como Ana (convocada): puede confirmar su propia convocatoria.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.convocatorias)::int, 2,
  'un jugador ve toda la lista de convocados, no solo la suya'
);

update public.convocatorias set confirmacion = 'confirmado'
  where id = 'c1111111-0000-0000-0000-000000000001';

select is(
  (select confirmacion::text from public.convocatorias
   where id = 'c1111111-0000-0000-0000-000000000001'),
  'confirmado',
  'un jugador convocado puede confirmar su disponibilidad'
);

select isnt(
  (select respondido_en from public.convocatorias
   where id = 'c1111111-0000-0000-0000-000000000001'),
  null,
  'al confirmar se registra la fecha de respuesta'
);

-- Ana no puede desconvocarse a sí misma cambiando "convocado" en su
-- propia fila (la única que la política de update le deja tocar).
select throws_ok(
  $$ update public.convocatorias set convocado = false
     where id = 'c1111111-0000-0000-0000-000000000001' $$,
  'P0001',
  null,
  'un jugador no puede cambiar el campo "convocado"'
);

-- Bea (no convocada) no puede confirmar su disponibilidad.
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ update public.convocatorias set confirmacion = 'confirmado'
     where id = 'c1111111-0000-0000-0000-000000000002' $$,
  'P0001',
  null,
  'un jugador no convocado no puede confirmar su disponibilidad'
);

-- Bea no puede tocar la convocatoria de Ana: la política de update solo
-- alcanza a su propia fila, así que este update no afecta a ninguna.
update public.convocatorias set confirmacion = 'rechazado'
  where id = 'c1111111-0000-0000-0000-000000000001';

select is(
  (select confirmacion::text from public.convocatorias
   where id = 'c1111111-0000-0000-0000-000000000001'),
  'confirmado',
  'un jugador no puede cambiar la confirmación de otro'
);

reset role;

-- Como el entrenador: gestión completa, incluida la confirmación ajena.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

update public.convocatorias set confirmacion = 'rechazado'
  where id = 'c1111111-0000-0000-0000-000000000001';

select is(
  (select confirmacion::text from public.convocatorias
   where id = 'c1111111-0000-0000-0000-000000000001'),
  'rechazado',
  'el entrenador puede cambiar la confirmación de un jugador'
);

update public.convocatorias set convocado = true
  where id = 'c1111111-0000-0000-0000-000000000002';

select is(
  (select convocado from public.convocatorias
   where id = 'c1111111-0000-0000-0000-000000000002'),
  true,
  'el entrenador puede convocar o desconvocar libremente'
);

insert into public.convocatorias (partido_id, jugador_id)
  values ('11111111-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000b')
  on conflict do nothing;

delete from public.convocatorias where id = 'c1111111-0000-0000-0000-000000000002';

select is(
  (select count(*) from public.convocatorias)::int, 1,
  'el entrenador puede borrar una convocatoria'
);

reset role;

select is(
  (select count(*) from public.convocatorias)::int, 1,
  'los cambios del entrenador se ven fuera de su sesión'
);

select * from finish();
rollback;
