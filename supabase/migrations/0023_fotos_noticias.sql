-- Foto de portada de las noticias (opcional).

-- Ruta de la foto dentro del bucket "noticias" (sin foto, null).
alter table public.noticias add column foto text;

comment on column public.noticias.foto is
  'Ruta de la foto de portada en el bucket "noticias", o null si no tiene.';

-- Fotos de las noticias. Como el de la tienda, el bucket es público: las
-- fotos se ven con su dirección, sin pasar por las políticas. La de un
-- borrador también, pero su dirección lleva un identificador aleatorio que
-- solo conoce quien ya ve la noticia. Solo imágenes, de 3 MB como mucho (la
-- aplicación las reduce antes de subirlas).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'noticias',
  'noticias',
  true,
  3 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Subir, cambiar y borrar fotos: solo el administrador. También leerlas por
-- la API (Storage lo hace al subir y al borrar); verlas por su dirección
-- pública no pasa por aquí.
create policy "noticias_fotos_administrador_leer"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'noticias' and public.es_administrador());

create policy "noticias_fotos_administrador_subir"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'noticias' and public.es_administrador());

create policy "noticias_fotos_administrador_cambiar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'noticias' and public.es_administrador())
  with check (bucket_id = 'noticias' and public.es_administrador());

create policy "noticias_fotos_administrador_borrar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'noticias' and public.es_administrador());
