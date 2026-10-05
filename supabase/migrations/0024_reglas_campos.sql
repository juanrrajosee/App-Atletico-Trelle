-- Reglas que la aplicación ya comprueba en sus formularios y faltaban en la
-- base de datos. Solo el administrador puede escribir en estas tablas, pero
-- así lo que se guarda cumple las mismas reglas venga de donde venga (de la
-- aplicación o de una llamada directa a la API con su sesión).

-- Plantilla: nombre (1 a 60) y apellidos (1 a 80), como en el formulario.
alter table public.jugadores
  add constraint jugadores_nombre_longitud
    check (char_length(trim(nombre)) between 1 and 60),
  add constraint jugadores_apellidos_longitud
    check (char_length(trim(apellidos)) between 1 and 80);

-- Partidos: rival (1 a 80), campo (hasta 120), competición (hasta 80) y
-- goles hasta 99.
alter table public.partidos
  add constraint partidos_rival_longitud
    check (char_length(trim(rival)) between 1 and 80),
  add constraint partidos_campo_longitud
    check (char_length(campo) <= 120),
  add constraint partidos_competicion_longitud
    check (char_length(competicion) <= 80),
  add constraint partidos_goles_maximo
    check (goles_favor <= 99 and goles_contra <= 99);

-- Alineación: hasta 20 goles y 20 asistencias por jugador y partido.
alter table public.estadisticas_partido
  add constraint estadisticas_partido_goles_maximo check (goles <= 20),
  add constraint estadisticas_partido_asistencias_maximo check (asistencias <= 20);

-- Posición en la lista: hasta 99 en la directiva y 999 en la tienda. El 0
-- es el valor por defecto de las dos columnas.
alter table public.directiva
  add constraint directiva_orden_rango check (orden between 0 and 99);

alter table public.productos
  add constraint productos_orden_rango check (orden between 0 and 999);
