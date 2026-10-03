-- Apodo de cada jugador: en el club se les conoce así (Gato, Couto,
-- Nacho…). Es opcional; sin él, la aplicación enseña el nombre y los
-- apellidos.

alter table public.jugadores
  add column apodo text check (char_length(trim(apodo)) between 1 and 30);

comment on column public.jugadores.apodo is
  'Como se le conoce en el club. Opcional: sin él se usan el nombre y los apellidos.';

-- La vista pública también lo lleva. "create or replace" solo deja añadir
-- columnas al final, y conserva los permisos y el comentario de la vista.
create or replace view public.jugadores_publicos
  with (security_invoker = false)
  as
  select
    id,
    nombre,
    apellidos,
    dorsal,
    posicion,
    estado <> 'baja' as activo,
    apodo
  from public.jugadores;
