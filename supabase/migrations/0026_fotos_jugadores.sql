-- Foto de cada jugador (opcional).
--
-- Es una imagen de una persona: solo se sube la de quien ha dado su permiso
-- para publicarla. La sube el administrador desde la ficha del jugador.

-- La ruta de la foto dentro del bucket "jugadores" (sin foto, null). La
-- columna ya existía desde el principio, sin usarse.
comment on column public.jugadores.foto is
  'Ruta de la foto en el bucket "jugadores", o null si no tiene (solo con el permiso del jugador).';

-- Fotos de los jugadores. Como los de la tienda y las noticias, el bucket es
-- público: las fotos se ven con su dirección, sin sesión. La dirección lleva
-- un identificador aleatorio y solo la conoce quien ya ve al jugador. Solo
-- imágenes, de 3 MB como mucho (la aplicación las reduce antes de subirlas).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jugadores',
  'jugadores',
  true,
  3 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Subir, cambiar y borrar fotos: solo el administrador. También leerlas por
-- la API (Storage lo hace al subir y al borrar); verlas por su dirección
-- pública no pasa por aquí.
create policy "jugadores_fotos_administrador_leer"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'jugadores' and public.es_administrador());

create policy "jugadores_fotos_administrador_subir"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'jugadores' and public.es_administrador());

create policy "jugadores_fotos_administrador_cambiar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'jugadores' and public.es_administrador())
  with check (bucket_id = 'jugadores' and public.es_administrador());

create policy "jugadores_fotos_administrador_borrar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'jugadores' and public.es_administrador());

-- La vista pública también lleva la foto. "create or replace" solo deja
-- añadir columnas al final, y conserva los permisos y el comentario de la
-- vista. Sigue sin enseñar el estado (un dato de salud).
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
    apodo,
    foto
  from public.jugadores;
