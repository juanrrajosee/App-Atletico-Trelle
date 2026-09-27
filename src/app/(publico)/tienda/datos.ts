import "server-only";

import { cache } from "react";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Producto } from "@/lib/tienda";

const COLUMNAS = "id, nombre, descripcion, precio_orientativo, foto, visible, orden";

/**
 * Los productos, en su orden (y por nombre si dos tienen el mismo). El
 * administrador ve también los ocultos; el resto, solo los visibles (lo
 * impone también la RLS).
 */
export async function cargarProductos(
  esAdministrador: boolean,
): Promise<Producto[]> {
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("productos")
    .select(COLUMNAS)
    .order("orden")
    .order("nombre");

  if (!esAdministrador) {
    consulta = consulta.eq("visible", true);
  }

  const { data, error } = await consulta;

  if (error) {
    throw new Error(`No se han podido cargar los productos: ${error.message}`);
  }

  return data;
}

/**
 * Un producto, o null si no existe o no se puede ver. Con cache: la página
 * y sus metadatos lo piden a la vez.
 */
export const cargarProducto = cache(async function cargarProducto(
  id: string,
): Promise<Producto | null> {
  if (!esIdValido(id)) {
    return null;
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("productos")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el producto: ${error.message}`);
  }

  return data;
});
