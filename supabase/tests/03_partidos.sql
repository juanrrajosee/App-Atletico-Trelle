-- Tests de RLS para "partidos": lectura pública, escritura del administrador.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(7);

insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local'),
  ('a0000000-0000-0000-0000-000000000001', 'aficionado@test.local');

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

-- Como el administrador: crea un partido y registra el resultado.
set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

insert into public.partidos (id, rival, fecha_hora, condicion)
  values ('11111111-0000-0000-0000-000000000001', 'CD Rival', now() + interval '7 days', 'local');

select is(
  (select count(*) from public.partidos)::int, 1,
  'el administrador puede crear un partido'
);

update public.partidos set estado = 'jugado', goles_favor = 3, goles_contra = 1
  where id = '11111111-0000-0000-0000-000000000001';

select is(
  (select estado::text from public.partidos where id = '11111111-0000-0000-0000-000000000001'),
  'jugado',
  'el administrador puede registrar el resultado'
);

reset role;

-- Como un aficionado: puede consultar el calendario, no tocarlo.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.partidos)::int, 1,
  'un aficionado ve el calendario'
);

select throws_ok(
  $$ insert into public.partidos (rival, fecha_hora, condicion)
     values ('Otro', now(), 'visitante') $$,
  '42501',
  null,
  'un aficionado no puede crear partidos'
);

update public.partidos set rival = 'Cambiado'
  where id = '11111111-0000-0000-0000-000000000001';

reset role;

select is(
  (select rival from public.partidos where id = '11111111-0000-0000-0000-000000000001'),
  'CD Rival',
  'un aficionado no puede editar partidos'
);

-- Sin sesión: también ve el calendario, y tampoco puede tocarlo.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select is(
  (select rival from public.partidos limit 1),
  'CD Rival',
  'sin sesión se ve el calendario'
);

delete from public.partidos;

reset role;

select is(
  (select count(*) from public.partidos)::int, 1,
  'sin sesión no se pueden borrar partidos'
);

select * from finish();
rollback;
