import { urlFotoPublica } from "@/lib/fotos";
import type { Tables } from "@/types/database";

/** Lo que se muestra de cada noticia. */
export type Noticia = Pick<
  Tables<"noticias">,
  | "id"
  | "titulo"
  | "resumen"
  | "cuerpo"
  | "foto"
  | "publicada_en"
  | "actualizado_en"
>;

/** El bucket de Storage donde están las fotos de portada de las noticias. */
export const BUCKET_FOTOS_NOTICIAS = "noticias";

/** La dirección pública de la foto de portada de una noticia. */
export function urlFotoNoticia(ruta: string) {
  return urlFotoPublica(BUCKET_FOTOS_NOTICIAS, ruta);
}

export type EstadoNoticia = "borrador" | "programada" | "publicada";

/** Borrador (sin fecha), programada (fecha futura) o publicada. */
export function estadoNoticia({ publicada_en }: Pick<Noticia, "publicada_en">) {
  if (!publicada_en) {
    return "borrador";
  }
  return new Date(publicada_en) > new Date() ? "programada" : "publicada";
}

const LONGITUD_RESUMEN = 160;

/**
 * El resumen de la noticia o, si no tiene, el principio del texto cortado
 * en una palabra entera.
 */
export function resumenDe({ resumen, cuerpo }: Pick<Noticia, "resumen" | "cuerpo">) {
  if (resumen?.trim()) {
    return resumen.trim();
  }
  const texto = cuerpo.replace(/\s+/g, " ").trim();
  if (texto.length <= LONGITUD_RESUMEN) {
    return texto;
  }
  const corte = texto.lastIndexOf(" ", LONGITUD_RESUMEN);
  return `${texto.slice(0, corte > 0 ? corte : LONGITUD_RESUMEN)}…`;
}
