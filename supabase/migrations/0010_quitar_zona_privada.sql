-- La aplicación deja de tener una zona privada del equipo: ya no hay
-- convocatorias con confirmación, ni entrenamientos, ni asistencia, y las
-- cuentas pasan a ser de aficionados (para votar), no de jugadores.

-- Tablas del equipo que dejan de usarse (con ellas se van sus políticas,
-- índices y triggers).
drop table public.convocatorias;
drop table public.asistencias;
drop table public.entrenamientos;

drop function public.restringir_actualizacion_convocatoria();
drop type public.estado_confirmacion;
drop type public.estado_asistencia;

-- Las cuentas ya no se vinculan a una ficha de jugador.
drop function public.cuentas_usuario();
drop view public.jugadores_roster;

drop policy "jugadores_leer_propio" on public.jugadores;
drop policy "partidos_leer_equipo" on public.partidos;
drop policy "estadisticas_partido_leer_equipo" on public.estadisticas_partido;

drop function public.tiene_acceso();
drop function public.mi_jugador_id();

-- Datos personales que ya no tienen ningún uso: sin zona privada, nadie
-- iba a poder verlos, y no se guardan datos personales que no se usan.
alter table public.jugadores
  drop column perfil_id,
  drop column telefono,
  drop column fecha_nacimiento;
