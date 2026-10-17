-- Tests de qué funciones pueden ejecutarse desde la API y de que los
-- disparadores siguen funcionando sin que nadie pueda llamarlos.
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos cascade;

select plan(17);

-- Las funciones internas de disparadores no se pueden ejecutar desde fuera.
select is(
  has_function_privilege('anon', 'public.gestionar_nuevo_usuario()', 'execute'), false,
  'sin cuenta no se puede ejecutar gestionar_nuevo_usuario'
);
select is(
  has_function_privilege('authenticated', 'public.gestionar_nuevo_usuario()', 'execute'), false,
  'ni con cuenta'
);
select is(
  has_function_privilege('anon', 'public.marcar_actualizacion()', 'execute'), false,
  'sin cuenta no se puede ejecutar marcar_actualizacion'
);
select is(
  has_function_privilege('authenticated', 'public.marcar_actualizacion()', 'execute'), false,
  'ni con cuenta'
);
select is(
  has_function_privilege('anon', 'public.comprobar_resultado_con_alineacion()', 'execute'), false,
  'sin cuenta no se puede ejecutar comprobar_resultado_con_alineacion'
);
select is(
  has_function_privilege('authenticated', 'public.comprobar_resultado_con_alineacion()', 'execute'), false,
  'ni con cuenta'
);

-- Las que sí se llaman desde fuera siguen pudiéndose (o la aplicación dejaría
-- de funcionar).
select is(
  has_function_privilege('anon', 'public.es_administrador()', 'execute'), true,
  'es_administrador la usan las reglas de RLS, también sin cuenta'
);
select is(
  has_function_privilege('anon', 'public.ranking_votaciones(integer)', 'execute'), true,
  'el ranking de las votaciones es público'
);
select is(
  has_function_privilege('anon', 'public.resultados_votacion(uuid)', 'execute'), true,
  'los resultados de una votación son públicos'
);
select is(
  has_function_privilege('anon', 'public.intentos_agotados(text, text)', 'execute'), true,
  'la aplicación comprueba los límites de intentos sin cuenta'
);
select is(
  has_function_privilege('anon', 'public.apuntar_intento(text, text)', 'execute'), true,
  'y apunta los intentos sin cuenta'
);
select is(
  has_function_privilege('authenticated', 'public.votar(uuid, public.categoria_votacion, uuid)', 'execute'), true,
  'con cuenta se puede votar'
);
select is(
  has_function_privilege('anon', 'public.borrar_mi_cuenta()', 'execute'), false,
  'sin cuenta no se puede borrar una cuenta'
);

-- Y los disparadores siguen saltando.
insert into auth.users (id, email) values
  ('e0000000-0000-0000-0000-000000000001', 'admin@test.local');

select is(
  (select count(*)::int from public.perfiles
   where id = 'e0000000-0000-0000-0000-000000000001'), 1,
  'al registrarse alguien, se le crea el perfil'
);

update public.perfiles set rol = 'administrador'
  where id = 'e0000000-0000-0000-0000-000000000001';

-- Se apaga el disparador un momento para poner una fecha vieja, y se vuelve
-- a encender: así se ve si salta cuando cambia el administrador.
alter table public.club disable trigger club_marcar_actualizacion;
update public.club set actualizado_en = '2020-01-01';
alter table public.club enable trigger club_marcar_actualizacion;

set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select lives_ok(
  $$ update public.club set campo = 'Campo de prueba' $$,
  'el administrador cambia el club'
);

reset role;

select ok(
  (select actualizado_en from public.club) > '2020-01-01',
  'y el disparador apunta cuándo (aunque quien cambia no pueda ejecutarlo)'
);

insert into public.partidos (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra)
values ('a0000000-0000-0000-0000-00000000000a', 'Rival', now() - interval '3 days',
        'local', 'jugado', 1, 0);
insert into public.jugadores (id, nombre, apellidos, dorsal, posicion)
values ('b0000000-0000-0000-0000-00000000000b', 'Ana', 'Pérez', 9, 'delantero');
insert into public.estadisticas_partido (partido_id, jugador_id, titular, minutos, goles)
values ('a0000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-00000000000b', true, 90, 1);

set local role authenticated;
set local request.jwt.claim.sub = 'e0000000-0000-0000-0000-000000000001';

select throws_ok(
  $$ update public.partidos set goles_favor = 0
     where id = 'a0000000-0000-0000-0000-00000000000a' $$,
  null, null,
  'el disparador de resultados sigue parando un marcador que no cuadra con la alineación'
);

reset role;

select * from finish();
rollback;
