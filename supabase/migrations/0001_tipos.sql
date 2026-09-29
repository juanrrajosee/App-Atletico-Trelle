-- Tipos enumerados usados por el resto de migraciones.

create type public.rol_usuario as enum ('entrenador', 'jugador');

create type public.posicion_jugador as enum (
  'portero',
  'defensa',
  'centrocampista',
  'delantero'
);

create type public.estado_jugador as enum (
  'disponible',
  'lesionado',
  'sancionado',
  'baja'
);

create type public.condicion_partido as enum ('local', 'visitante');

create type public.estado_partido as enum ('programado', 'jugado', 'aplazado');

create type public.estado_confirmacion as enum (
  'pendiente',
  'confirmado',
  'rechazado'
);

create type public.estado_asistencia as enum (
  'presente',
  'ausente',
  'justificado'
);
