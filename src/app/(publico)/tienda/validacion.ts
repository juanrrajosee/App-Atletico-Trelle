import { z } from "zod";
import { errorDeFoto } from "@/lib/fotos";
import {
  CAMPO_FOTO_NUEVA,
  leerOrdenFotos,
  MAX_BYTES_FOTOS_NUEVAS,
  type ItemFoto,
} from "@/lib/fotos-producto";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";

export type CampoProducto =
  | "nombre"
  | "descripcion"
  | "precio"
  | "orden"
  | "visible"
  | "fotos";

export type EstadoFormularioProducto = EstadoFormulario<CampoProducto>;
export type RespuestaFormularioProducto = RespuestaFormulario<CampoProducto>;

const esquemaProducto = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre.")
    .max(80, "Como mucho 80 caracteres."),
  descripcion: z
    .string()
    .transform((texto) => texto.replace(/\r\n?/g, "\n").trim())
    .pipe(z.string().max(2000, "Como mucho 2000 caracteres."))
    .transform((texto) => texto || null),
  // Se acepta "12,50" y "12.50". Vacío: sin precio.
  precio: z
    .string()
    .trim()
    .transform((texto) => texto.replace(",", "."))
    .refine(
      (texto) => texto === "" || /^\d+(\.\d{1,2})?$/.test(texto),
      "Escribe un precio como 12 o 12,50.",
    )
    .transform((texto) => (texto === "" ? null : Number(texto)))
    .refine((precio) => precio === null || precio <= 99999, "Demasiado alto."),
  orden: z
    .string()
    .trim()
    .min(1, "Pon su posición en la tienda.")
    .transform(Number)
    .pipe(
      z
        .number({ error: "Tiene que ser un número." })
        .int("Sin decimales.")
        .min(1, "Va del 1 al 999.")
        .max(999, "Va del 1 al 999."),
    ),
  visible: z.enum(["si", "no"]).transform((valor) => valor === "si"),
});

export type DatosProducto = z.infer<typeof esquemaProducto>;

const CAMPOS = Object.keys(esquemaProducto.shape) as CampoProducto[];

/** Las fotos de un envío: su orden final, y los archivos de las nuevas. */
export type FotosEnviadas = {
  items: ItemFoto[];
  nuevas: Map<number, File>;
};

/**
 * Valida los campos del producto y sus fotos: el orden (las que ya tiene y
 * las nuevas) y cada foto nueva (tipo, tamaño y contenido).
 */
export async function validarProducto(formData: FormData): Promise<
  | {
      ok: true;
      datos: DatosProducto;
      fotos: FotosEnviadas;
      valores: EstadoFormularioProducto["valores"];
    }
  | { ok: false; respuesta: RespuestaFormularioProducto }
> {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoProducto, string>;
  // El checkbox solo llega si está marcado.
  valores.visible = formData.get("visible") === "si" ? "si" : "no";

  const errores: EstadoFormularioProducto["errores"] = {};

  const fotos: FotosEnviadas = { items: [], nuevas: new Map() };
  const orden = leerOrdenFotos(String(formData.get("fotos_orden") ?? ""));
  if (!orden.ok) {
    errores.fotos = orden.error;
  } else {
    fotos.items = orden.items;
    let bytes = 0;
    for (const item of orden.items) {
      if (!("nueva" in item)) continue;
      const archivo = formData.get(`${CAMPO_FOTO_NUEVA}${item.nueva}`);
      if (!(archivo instanceof File) || archivo.size === 0) {
        errores.fotos = "Falta una de las fotos nuevas. Vuelve a elegirla.";
        break;
      }
      const error = await errorDeFoto(archivo);
      if (error) {
        errores.fotos = error;
        break;
      }
      bytes += archivo.size;
      fotos.nuevas.set(item.nueva, archivo);
    }
    if (!errores.fotos && bytes > MAX_BYTES_FOTOS_NUEVAS) {
      errores.fotos =
        "Las fotos nuevas pesan demasiado juntas. Guarda estas y añade el resto después.";
    }
  }

  const resultado = esquemaProducto.safeParse(valores);
  if (!resultado.success) {
    const porCampo = z.flattenError(resultado.error).fieldErrors;
    for (const campo of CAMPOS) {
      const mensaje = porCampo[campo as keyof typeof porCampo]?.[0];
      if (mensaje) errores[campo] = mensaje;
    }
  }

  if (!resultado.success || Object.keys(errores).length > 0) {
    // Las fotos nuevas siguen elegidas en el formulario (no se recarga).
    return {
      ok: false,
      respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
    };
  }

  return { ok: true, datos: resultado.data, fotos, valores };
}
