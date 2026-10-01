import "server-only";

import { randomUUID } from "node:crypto";
import type { crearClienteServidor } from "./servidor";

type Supabase = Awaited<ReturnType<typeof crearClienteServidor>>;

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Sube una foto a la carpeta de su ficha (un producto, una noticia…) con un
 * nombre nuevo, así la dirección cambia y nadie ve la anterior guardada en
 * caché. Devuelve la ruta, o null si no se ha podido. La sesión es la del
 * administrador: lo permiten las políticas de Storage.
 */
export async function subirFoto(
  supabase: Supabase,
  bucket: string,
  carpeta: string,
  foto: File,
) {
  const ruta = `${carpeta}/${randomUUID()}.${EXTENSION[foto.type] ?? "jpg"}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(ruta, foto, { contentType: foto.type, upsert: false });
  return error ? null : ruta;
}

/** Borra fotos que ya no se usan. Si falla, solo queda un archivo suelto. */
export async function borrarFotos(
  supabase: Supabase,
  bucket: string,
  rutas: (string | null)[],
) {
  const aBorrar = rutas.filter((ruta): ruta is string => Boolean(ruta));
  if (aBorrar.length > 0) {
    await supabase.storage.from(bucket).remove(aBorrar);
  }
}
