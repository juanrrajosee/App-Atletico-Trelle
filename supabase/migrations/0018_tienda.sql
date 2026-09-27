-- Tienda del club: productos que no se compran en la aplicación; se pide
-- presupuesto por teléfono o por WhatsApp al número del club.

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 1 and 80),
  descripcion text check (char_length(descripcion) <= 2000),
  -- Orientativo: el precio de verdad se da al pedir presupuesto. Sin él no
  -- se enseña ninguno.
  precio_orientativo numeric(8, 2) check (precio_orientativo >= 0),
  -- Ruta de la foto dentro del bucket "productos" (sin foto, null).
  foto text,
  -- Se puede ocultar un producto (por ejemplo, agotado) sin borrarlo.
  visible boolean not null default true,
  -- Posición en la tienda, de menor a mayor.
  orden smallint not null default 0,
  creado_en timestamptz not null default now()
);

comment on table public.productos is 'Productos de la tienda del club.';

alter table public.productos enable row level security;

create policy "productos_leer_visibles"
  on public.productos for select
  using (visible);

create policy "productos_administrador_todo"
  on public.productos for all
  using (public.es_administrador())
  with check (public.es_administrador());

-- Fotos de los productos. El bucket es público: cualquiera ve las fotos
-- con su dirección, sin pasar por las políticas. Solo imágenes, de 3 MB
-- como mucho (la aplicación las reduce antes de subirlas).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  3 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Subir, cambiar y borrar fotos: solo el administrador. También leerlas por
-- la API (Storage lo hace al subir y al borrar); verlas por su dirección
-- pública no pasa por aquí.
create policy "productos_fotos_administrador_leer"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'productos' and public.es_administrador());

create policy "productos_fotos_administrador_subir"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos' and public.es_administrador());

create policy "productos_fotos_administrador_cambiar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos' and public.es_administrador())
  with check (bucket_id = 'productos' and public.es_administrador());

create policy "productos_fotos_administrador_borrar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos' and public.es_administrador());
