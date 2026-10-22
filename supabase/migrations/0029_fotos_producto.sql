-- Varias fotos por producto.
--
-- "fotos" es la lista de rutas de las fotos dentro del bucket "productos", en
-- su orden: la primera es la portada (la de la lista de la tienda y la que
-- sale al compartir el enlace). Hasta 6, sin huecos. Solo la cambia el
-- administrador, como el resto del producto (la RLS de la tabla no cambia).
alter table public.productos
  add column fotos text[] not null default '{}',
  add constraint productos_fotos_maximo check (cardinality(fotos) <= 6),
  add constraint productos_fotos_sin_huecos check (array_position(fotos, null) is null);

comment on column public.productos.fotos is
  'Rutas de las fotos en el bucket "productos", en orden; la primera es la portada. Hasta 6.';

-- La foto que ya tenía cada producto pasa a ser la primera de la lista.
update public.productos
set fotos = array[foto]
where foto is not null;

-- La columna "foto" ya no la usa la aplicación: se deja unos días por si hay
-- que volver atrás, y se quita en una migración posterior.
comment on column public.productos.foto is
  'En desuso: ahora son las "fotos". Se quitará en una migración posterior.';
