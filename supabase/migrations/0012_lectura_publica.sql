-- La aplicación es pública: cualquiera, con cuenta o sin ella, puede
-- consultar el calendario, los resultados, la plantilla y las estadísticas.
-- Escribir sigue siendo solo cosa del administrador.

create policy "partidos_leer_todos"
  on public.partidos for select
  using (true);

create policy "estadisticas_partido_leer_todos"
  on public.estadisticas_partido for select
  using (true);

-- La tabla de jugadores solo la lee el administrador, porque incluye el
-- estado (que un jugador esté lesionado es un dato de salud y no se
-- publica). Al público se le sirve esta vista, sin el estado: solo si sigue
-- en la plantilla o está de baja.
--
-- Es una vista normal (no "security_invoker"): se ejecuta con los permisos
-- de su dueño (postgres), que salta la RLS de la tabla.
create view public.jugadores_publicos
  with (security_invoker = false)
  as
  select
    id,
    nombre,
    apellidos,
    dorsal,
    posicion,
    estado <> 'baja' as activo
  from public.jugadores;

comment on view public.jugadores_publicos is
  'Datos públicos de la plantilla, sin el estado de cada jugador.';

grant select on public.jugadores_publicos to anon, authenticated;
