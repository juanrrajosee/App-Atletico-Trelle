-- Tests de RLS para "partidos".
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.entrenamientos
  cascade;

select plan(5);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'entrenador@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'jugador-a@test.local'),
  ('c0000000-0000-0000-0000-000000000001', 'sin-vincular@test.local');

update public.perfiles set rol = 'entrenador'
  where id = 'e0000000-0000-0000-0000-000000000001';

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion, perfil_id)
  values ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero',
    'a0000000-0000-0000-0000-000000000001');

-- Como el entrenador: crea un partido.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

insert into public.partidos (id, rival, fecha_hora, condicion)
  values ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() + interval '7 days', 'local');

select is(
  (select count(*) from public.partidos)::int, 1,
  'el entrenador puede crear un partido'
);

update public.partidos set estado = 'jugado', goles_favor = 3, goles_contra = 1
  where id = '11111111-0000-0000-0000-000000000001';

select is(
  (select estado::text from public.partidos where id = '11111111-0000-0000-0000-000000000001'),
  'jugado',
  'el entrenador puede registrar el resultado'
);

reset role;

-- Como un jugador vinculado: puede consultar el calendario, no editarlo.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.partidos)::int, 1,
  'un jugador vinculado ve el calendario de partidos'
);

update public.partidos set rival = 'Cambiado'
  where id = '11111111-0000-0000-0000-000000000001';

reset role;

select is(
  (select rival from public.partidos where id = '11111111-0000-0000-0000-000000000001'),
  'CD Rival',
  'un jugador no puede editar un partido'
);

-- Una cuenta sin vincular no ve el calendario.
set local role authenticated;
set local request.jwt.claim.sub = 'c0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.partidos)::int, 0,
  'una cuenta sin vincular no ve el calendario'
);

select * from finish();
rollback;
