-- Tests de las reglas de longitud y de máximos de la migración 0024.
begin;

-- Cada test parte de una base de datos vacía. Todo va dentro de la
-- transacción: el rollback del final lo deja todo como estaba.
truncate auth.users, public.jugadores, public.partidos, public.directiva,
  public.productos cascade;

select plan(14);

insert into public.jugadores (id, nombre, apellidos, dorsal, posicion)
values ('a0000000-0000-0000-0000-00000000000a', 'Hugo', 'Ruiz Soto', 1, 'portero');

insert into public.partidos (id, rival, fecha_hora, condicion, estado, goles_favor, goles_contra)
values ('b0000000-0000-0000-0000-00000000000b', 'Rival', now() - interval '1 day',
        'local', 'jugado', 2, 1);

-- Plantilla
select throws_ok(
  $$ update public.jugadores set nombre = '  ' $$,
  '23514', null, 'el nombre del jugador no puede estar en blanco'
);
select throws_ok(
  $$ update public.jugadores set nombre = repeat('x', 61) $$,
  '23514', null, 'el nombre tiene como mucho 60 caracteres'
);
select throws_ok(
  $$ update public.jugadores set apellidos = repeat('x', 81) $$,
  '23514', null, 'los apellidos tienen como mucho 80 caracteres'
);
select lives_ok(
  $$ update public.jugadores set nombre = repeat('x', 60), apellidos = repeat('y', 80) $$,
  'nombre y apellidos en el límite valen'
);

-- Partidos
select throws_ok(
  $$ update public.partidos set rival = '' $$,
  '23514', null, 'el rival no puede estar en blanco'
);
select throws_ok(
  $$ update public.partidos set rival = repeat('x', 81) $$,
  '23514', null, 'el rival tiene como mucho 80 caracteres'
);
select throws_ok(
  $$ update public.partidos set campo = repeat('x', 121) $$,
  '23514', null, 'el campo tiene como mucho 120 caracteres'
);
select throws_ok(
  $$ update public.partidos set competicion = repeat('x', 81) $$,
  '23514', null, 'la competición tiene como mucho 80 caracteres'
);
select throws_ok(
  $$ update public.partidos set goles_favor = 100 $$,
  '23514', null, 'como mucho 99 goles'
);

-- Alineación
select throws_ok(
  $$ insert into public.estadisticas_partido (partido_id, jugador_id, goles)
     values ('b0000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-00000000000a', 21) $$,
  '23514', null, 'como mucho 20 goles de un jugador en un partido'
);
select throws_ok(
  $$ insert into public.estadisticas_partido (partido_id, jugador_id, asistencias)
     values ('b0000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-00000000000a', 21) $$,
  '23514', null, 'como mucho 20 asistencias'
);

-- Posiciones en las listas
select throws_ok(
  $$ insert into public.directiva (nombre, cargo, orden) values ('X', 'Vocal', 100) $$,
  '23514', null, 'la posición en la directiva llega hasta 99'
);
select throws_ok(
  $$ insert into public.productos (nombre, orden) values ('X', 1000) $$,
  '23514', null, 'la posición en la tienda llega hasta 999'
);
select lives_ok(
  $$ insert into public.productos (nombre) values ('Sin posición') $$,
  'sin posición, la de por defecto (0) vale'
);

select * from finish();
rollback;
