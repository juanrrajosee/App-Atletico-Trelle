import "server-only";

import { cache } from "react";
import { esIdValido } from "@/lib/ids";
import type { Noticia } from "@/lib/noticias";
import { crearClienteServidor } from "@/lib/supabase/servidor";

const COLUMNAS = "id, titulo, resumen, cuerpo, publicada_en, actualizado_en";

/**
 * Las noticias, de la más reciente a la más antigua. El administrador ve
 * también los borradores (primero) y las programadas; el resto, solo las
 * publicadas (lo impone también la RLS).
 */
export async function cargarNoticias(
  esAdministrador: boolean,
  limite?: number,
): Promise<Noticia[]> {
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("noticias")
    .select(COLUMNAS)
    .order("publicada_en", { ascending: false, nullsFirst: true })
    .order("creado_en", { ascending: false });

  if (!esAdministrador) {
    consulta = consulta
      .not("publicada_en", "is", null)
      .lte("publicada_en", new Date().toISOString());
  }
  if (limite) {
    consulta = consulta.limit(limite);
  }

  const { data, error } = await consulta;

  if (error) {
    throw new Error(`No se han podido cargar las noticias: ${error.message}`);
  }

  return data;
}

/**
 * Una noticia, o null si no existe o no se puede ver (un borrador, sin ser
 * administrador). Con cache: la página y sus metadatos la piden a la vez.
 */
export const cargarNoticia = cache(async function cargarNoticia(
  id: string,
): Promise<Noticia | null> {
  if (!esIdValido(id)) {
    return null;
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("noticias")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar la noticia: ${error.message}`);
  }

  return data;
});
