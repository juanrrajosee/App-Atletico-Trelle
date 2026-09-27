-- Tests de las votaciones: quién vota, cuándo, a quién, y qué se ve.
begin;

-- Cada test parte de una base de datos vacía, tenga los datos que tenga la
-- base local. Todo va dentro de la transacción: el rollback del final lo
-- deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(37);

insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'aficionado-a@test.local'),
  ('b0000000-0000-0000-0000-000000000001', 'aficionado-b@test.local');

-- Ana jugó de titular, Bea salió desde el banquillo y Cris se quedó en él.
insert into public.jugadores (id, nombre, apellidos, dorsal, posicion) values
  ('a0000000-0000-0000-0000-00000000000a', 'Ana', 'Ruiz', 7, 'delantero'),
  ('b0000000-0000-0000-0000-00000000000b', 'Bea', 'Soto', 9, 'centrocampista'),
  ('c0000000-0000-0000-0000-00000000000c', 'Cris', 'Vila', 12, 'defensa');

insert into public.partidos
  (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra,
   alineacion_registrada_en)
values
  -- Abierto: jugado hoy y con la alineación registrada ahora mismo.
  ('11111111-0000-0000-0000-000000000001', 'Abierto', now(), 'local', 'jugado', 1, 0, now()),
  -- Cerrado: se jugó hace tiempo.
  ('22222222-0000-0000-0000-000000000002', 'Cerrado', '2025-10-05 15:00+00', 'local', 'jugado', 2, 1, '2025-10-05 18:00+00'),
  -- Jugado hoy, pero aún sin alineación.
  ('33333333-0000-0000-0000-000000000003', 'Sin alineación', now(), 'local', 'jugado', 0, 0, null),
  -- Por jugar.
  ('44444444-0000-0000-0000-000000000004', 'Programado', now() + interval '1 day', 'local', 'programado', null, null, null),
  -- Otro cerrado de la misma temporada, y uno de la siguiente.
  ('55555555-0000-0000-0000-000000000005', 'Cerrado 2', '2025-10-12 15:00+00', 'local', 'jugado', 1, 1, '2025-10-12 18:00+00'),
  ('66666666-0000-0000-0000-000000000006', 'Otra temporada', '2026-08-01 15:00+00', 'local', 'jugado', 3, 0, '2026-08-01 18:00+00'),
  -- Alineación registrada al día siguiente del partido: aún abierta.
  ('77777777-0000-0000-0000-000000000007', 'Registrada ayer', now() - interval '2 days', 'local', 'jugado', 1, 0, now() - interval '23 hours'),
  -- Registrada hace más de 24 horas: cerrada.
  ('88888888-0000-0000-0000-000000000008', 'Pasadas 24 h', now() - interval '2 days', 'local', 'jugado', 1, 0, now() - interval '25 hours'),
  -- Partido de hace 10 días al que se le registra ahora la alineación: no
  -- abre votación. Y otro igual de antiguo, todavía sin alineación.
  ('99999999-0000-0000-0000-000000000009', 'Antiguo', now() - interval '10 days', 'local', 'jugado', 1, 0, now()),
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'Antiguo sin alineación', now() - interval '10 days', 'local', 'jugado', 1, 0, null),
  -- Con la alineación registrada hace un rato pero luego vaciada.
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'Vaciada', now(), 'local', 'jugado', 1, 0, now());

insert into public.estadisticas_partido (partido_id, jugador_id, titular, minutos)
select p.id, j.id, j.titular, j.minutos
from (values
  ('11111111-0000-0000-0000-000000000001'::uuid),
  ('77777777-0000-0000-0000-000000000007'),
  ('22222222-0000-0000-0000-000000000002'),
  ('55555555-0000-0000-0000-000000000005'),
  ('66666666-0000-0000-0000-000000000006')
) as p (id)
cross join (values
  ('a0000000-0000-0000-0000-00000000000a'::uuid, true, 90),
  ('b0000000-0000-0000-0000-00000000000b', false, 20),
  ('c0000000-0000-0000-0000-00000000000c', false, 0)
) as j (id, titular, minutos);

-- Votos ya emitidos en los partidos cerrados (de cuentas que ya no existen,
-- sin dueño). Cerrado: MVP Ana 3 - Bea 1. Cerrado 2: MVP Ana 2 - Bea 2
-- (empate). Otra temporada: MVP Bea 5.
insert into public.votos (partido_id, categoria, perfil_id, jugador_id)
select partido, 'mvp', null, jugador
from (values
  ('22222222-0000-0000-0000-000000000002'::uuid, 'a0000000-0000-0000-0000-00000000000a'::uuid, 3),
  ('22222222-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-00000000000b', 1),
  ('55555555-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-00000000000a', 2),
  ('55555555-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-00000000000b', 2),
  ('66666666-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-00000000000b', 5)
) as v (partido, jugador, cuantos)
cross join lateral generate_series(1, v.cuantos);

-- Cuándo está abierta.
select is(
  (select estado::text from public.consultar_votacion('11111111-0000-0000-0000-000000000001')),
  'abierta', 'jugado hoy y con alineación: abierta'
);
select is(
  (select cierre from public.consultar_votacion('11111111-0000-0000-0000-000000000001')),
  now() + interval '24 hours', 'se cierra 24 horas después de registrar la alineación'
);
select is(
  (select estado::text from public.consultar_votacion('77777777-0000-0000-0000-000000000007')),
  'abierta', 'da igual que la alineación se registre al día siguiente'
);
select is(
  (select estado::text from public.consultar_votacion('88888888-0000-0000-0000-000000000008')),
  'cerrada', 'pasadas las 24 horas: cerrada'
);
select is(
  (select estado::text from public.consultar_votacion('22222222-0000-0000-0000-000000000002')),
  'cerrada', 'un partido de otra temporada: cerrada'
);
select is(
  (select estado::text from public.consultar_votacion('33333333-0000-0000-0000-000000000003')),
  'pendiente', 'sin alineación: pendiente'
);
select is(
  (select estado::text from public.consultar_votacion('44444444-0000-0000-0000-000000000004')),
  'pendiente', 'sin jugar: pendiente'
);
select is(
  (select estado::text from public.consultar_votacion('bbbbbbbb-0000-0000-0000-00000000000b')),
  'pendiente', 'si se vacía la alineación, no hay a quién votar'
);
select is(
  (select estado::text from public.consultar_votacion('99999999-0000-0000-0000-000000000009')),
  'cerrada', 'un partido de hace más de 7 días no abre votación al registrar su alineación'
);
select is(
  (select estado::text from public.consultar_votacion('aaaaaaaa-0000-0000-0000-00000000000a')),
  'cerrada', 'ni se queda esperándola'
);

-- Como la aficionada A.
set local role authenticated;
set local request.jwt.claim.sub = 'a0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mvp',
       'a0000000-0000-0000-0000-00000000000a') $$,
  'vota al MVP'
);
select is(
  (select count(*)::int from public.votos), 1,
  've su propio voto'
);
select throws_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mvp',
       'b0000000-0000-0000-0000-00000000000b') $$,
  'P0001', 'Ya has votado en esta categoría.',
  'no puede votar dos veces en la misma categoría'
);
select throws_ok(
  $$ insert into public.votos (partido_id, categoria, jugador_id)
     values ('11111111-0000-0000-0000-000000000001', 'mvp',
       'b0000000-0000-0000-0000-00000000000b') $$,
  '23505', null,
  'ni saltándose la función'
);
select throws_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mejor_suplente',
       'c0000000-0000-0000-0000-00000000000c') $$,
  'P0001', 'Ese jugador no se puede votar en esta categoría.',
  'un suplente que no salió al campo no puede ser el mejor suplente'
);
select throws_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mejor_suplente',
       'a0000000-0000-0000-0000-00000000000a') $$,
  'P0001', 'Ese jugador no se puede votar en esta categoría.',
  'un titular no puede ser el mejor suplente'
);
select lives_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mejor_suplente',
       'b0000000-0000-0000-0000-00000000000b') $$,
  'vota al suplente que salió'
);
select lives_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'compromiso',
       'c0000000-0000-0000-0000-00000000000c') $$,
  'al compromiso se puede votar a cualquier convocado, aunque no jugara'
);
select throws_ok(
  $$ select public.votar('22222222-0000-0000-0000-000000000002', 'mvp',
       'a0000000-0000-0000-0000-00000000000a') $$,
  'P0001', 'La votación de este partido no está abierta.',
  'no se vota en una votación cerrada'
);
select throws_ok(
  $$ insert into public.votos (partido_id, categoria, jugador_id)
     values ('22222222-0000-0000-0000-000000000002', 'mvp',
       'a0000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'ni saltándose la función'
);
select throws_ok(
  $$ select public.votar('33333333-0000-0000-0000-000000000003', 'mvp',
       'a0000000-0000-0000-0000-00000000000a') $$,
  'P0001', 'La votación de este partido no está abierta.',
  'ni en un partido sin alineación'
);
select throws_ok(
  $$ insert into public.votos (partido_id, categoria, perfil_id, jugador_id)
     values ('11111111-0000-0000-0000-000000000001', 'compromiso',
       'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'no puede votar en nombre de otra cuenta'
);

update public.votos set jugador_id = 'c0000000-0000-0000-0000-00000000000c'
  where categoria = 'mvp';
select is(
  (select jugador_id from public.votos where categoria = 'mvp'),
  'a0000000-0000-0000-0000-00000000000a'::uuid,
  'no puede cambiar su voto'
);

delete from public.votos;
select is(
  (select count(*)::int from public.votos), 3,
  'ni borrarlo'
);

select is(
  (select count(*)::int from public.resultados_votacion('11111111-0000-0000-0000-000000000001')),
  0,
  'mientras está abierta no se ve cómo va'
);

reset role;

-- Como la aficionada B: no ve los votos de A.
set local role authenticated;
set local request.jwt.claim.sub = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.votos), 0,
  'nadie ve los votos de otra cuenta'
);

reset role;

-- Sin sesión.
set local role anon;
-- Sin sesión no hay usuario: se borra el que quedara del bloque anterior.
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ select public.votar('11111111-0000-0000-0000-000000000001', 'mvp',
       'a0000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'sin sesión no se puede votar'
);
select is(
  (select count(*)::int from public.votos), 0,
  'sin sesión no se ve ningún voto'
);
select results_eq(
  $$ select categoria::text, jugador_id, votos
     from public.resultados_votacion('22222222-0000-0000-0000-000000000002') $$,
  $$ values
       ('mvp', 'a0000000-0000-0000-0000-00000000000a'::uuid, 3),
       ('mvp', 'b0000000-0000-0000-0000-00000000000b'::uuid, 1) $$,
  'con la votación cerrada, cualquiera ve el recuento'
);
select is(
  (select count(*)::int from public.consultar_votacion('11111111-0000-0000-0000-000000000001')),
  1,
  'cualquiera puede consultar si una votación está abierta'
);

-- Ranking de la temporada 2025/26: Ana gana en Cerrado y empata en Cerrado 2
-- (2 victorias, 5 votos); Bea empata en Cerrado 2 (1 victoria, 3 votos). Lo
-- de la temporada siguiente no cuenta.
select results_eq(
  $$ select categoria::text, jugador_id, victorias, votos
     from public.ranking_votaciones(2025) $$,
  $$ values
       ('mvp', 'a0000000-0000-0000-0000-00000000000a'::uuid, 2, 5),
       ('mvp', 'b0000000-0000-0000-0000-00000000000b'::uuid, 1, 3) $$,
  'ranking: victorias (con empate ganan todos) y votos, por temporada'
);
select results_eq(
  $$ select categoria::text, jugador_id, victorias, votos
     from public.ranking_votaciones(2026) where categoria = 'mvp'
       and jugador_id = 'b0000000-0000-0000-0000-00000000000b' $$,
  $$ values ('mvp', 'b0000000-0000-0000-0000-00000000000b'::uuid, 1, 5) $$,
  'la temporada 2026/27 empieza el 1 de julio'
);
select is(
  (select count(*)::int from public.ranking_votaciones(2026)
   where jugador_id = 'a0000000-0000-0000-0000-00000000000a'),
  0,
  'las votaciones abiertas no cuentan en el ranking'
);

reset role;

-- El administrador tampoco ve quién ha votado a quién.
insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local');
update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::int from public.votos), 0,
  'el administrador no ve los votos de nadie'
);

reset role;

-- Si se borra una cuenta, sus votos se quedan (sin dueño).
delete from auth.users where id = 'a0000000-0000-0000-0000-000000000001';
select is(
  (select count(*)::int from public.votos
   where partido_id = '11111111-0000-0000-0000-000000000001'),
  3,
  'al borrar una cuenta sus votos siguen contando'
);
select is(
  (select count(*)::int from public.votos
   where partido_id = '11111111-0000-0000-0000-000000000001' and perfil_id is null),
  3,
  'pero ya sin dueño'
);

-- Un jugador con votos no se puede borrar (se le da de baja). Se le quitan
-- antes las estadísticas, que por sí solas ya lo impedirían.
delete from public.estadisticas_partido
  where jugador_id = 'c0000000-0000-0000-0000-00000000000c';
select throws_ok(
  $$ delete from public.jugadores where id = 'c0000000-0000-0000-0000-00000000000c' $$,
  '23503', null,
  'un jugador con votos no se puede borrar'
);

select * from finish();
rollback;
