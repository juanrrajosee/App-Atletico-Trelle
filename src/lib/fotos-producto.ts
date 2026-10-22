/**
 * Varias fotos por producto: cómo llega su orden desde el formulario y cómo
 * se junta con las que ya tiene. Es lógica sin acceso a la base de datos ni a
 * Storage, para poder probarla sola.
 */
import { z } from "zod";
import {
  CAMPO_FOTO_NUEVA,
  MAX_BYTES_FOTOS_NUEVAS,
  MAX_FOTOS_PRODUCTO,
} from "./fotos-producto-limites.ts";

export { CAMPO_FOTO_NUEVA, MAX_BYTES_FOTOS_NUEVAS, MAX_FOTOS_PRODUCTO };

/**
 * Un elemento del orden: una foto que el producto ya tiene (su ruta en
 * Storage) o una foto nueva (el número de su campo en el formulario).
 */
export type ItemFoto = { ruta: string } | { nueva: number };

/** Las rutas que sube la aplicación: "<id del producto>/<id de la foto>.<extensión>". */
const RUTA = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(jpg|png|webp)$/;

const esquemaOrden = z
  .array(
    z.union([
      z.object({ ruta: z.string().regex(RUTA) }).strict(),
      z
        .object({ nueva: z.number().int().min(0).max(MAX_FOTOS_PRODUCTO - 1) })
        .strict(),
    ]),
  )
  .max(MAX_FOTOS_PRODUCTO);

/**
 * El orden de las fotos tal como lo manda el formulario (un JSON). Vacío es
 * "sin fotos". Se rechaza lo que no tenga la forma esperada o lo repetido.
 */
export function leerOrdenFotos(
  texto: string,
): { ok: true; items: ItemFoto[] } | { ok: false; error: string } {
  if (texto.trim() === "") {
    return { ok: true, items: [] };
  }

  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, error: "No se han podido leer las fotos. Vuelve a elegirlas." };
  }

  const resultado = esquemaOrden.safeParse(crudo);
  if (!resultado.success) {
    return {
      ok: false,
      error:
        resultado.error.issues.some((aviso) => aviso.code === "too_big")
          ? `Como mucho ${MAX_FOTOS_PRODUCTO} fotos por producto.`
          : "No se han podido leer las fotos. Vuelve a elegirlas.",
    };
  }

  const claves = resultado.data.map((item) =>
    "ruta" in item ? `ruta:${item.ruta}` : `nueva:${item.nueva}`,
  );
  if (new Set(claves).size !== claves.length) {
    return { ok: false, error: "Hay una foto repetida. Vuelve a elegirlas." };
  }

  return { ok: true, items: resultado.data };
}

/**
 * Junta el orden pedido con lo que hay: las fotos que el producto ya tiene
 * (`actuales`) y las nuevas ya subidas (`subidas`: número → ruta). Da la
 * lista final y las fotos que se quitan. Una ruta que el producto no tiene
 * se rechaza: nadie puede colar la foto de otro producto.
 */
export function resolverFotos(
  actuales: string[],
  items: ItemFoto[],
  subidas: Map<number, string>,
):
  | { ok: true; fotos: string[]; quitadas: string[] }
  | { ok: false; error: string } {
  const fotos: string[] = [];

  for (const item of items) {
    if ("ruta" in item) {
      if (!actuales.includes(item.ruta)) {
        return { ok: false, error: "Una de las fotos ya no está en el producto. Recarga la página." };
      }
      fotos.push(item.ruta);
    } else {
      const ruta = subidas.get(item.nueva);
      if (!ruta) {
        return { ok: false, error: "Falta una de las fotos nuevas. Vuelve a elegirla." };
      }
      fotos.push(ruta);
    }
  }

  return {
    ok: true,
    fotos,
    quitadas: actuales.filter((ruta) => !fotos.includes(ruta)),
  };
}
