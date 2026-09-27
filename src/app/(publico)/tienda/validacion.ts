import { z } from "zod";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";

export type CampoProducto =
  | "nombre"
  | "descripcion"
  | "precio"
  | "orden"
  | "visible"
  | "foto";

export type EstadoFormularioProducto = EstadoFormulario<CampoProducto>;
export type RespuestaFormularioProducto = RespuestaFormulario<CampoProducto>;

/** Tipos de foto que se aceptan (los mismos que el bucket). */
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

/** Tamaño máximo de una foto (el mismo que el bucket). */
export const TAMANO_MAXIMO_FOTO = 3 * 1024 * 1024;

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

/**
 * Valida los campos del producto y, si viene, la foto. Devuelve la foto
 * aparte (null si no se ha elegido ninguna).
 */
export function validarProducto(formData: FormData):
  | {
      ok: true;
      datos: DatosProducto;
      foto: File | null;
      valores: EstadoFormularioProducto["valores"];
    }
  | { ok: false; respuesta: RespuestaFormularioProducto } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoProducto, string>;
  // El checkbox solo llega si está marcado.
  valores.visible = formData.get("visible") === "si" ? "si" : "no";

  const errores: EstadoFormularioProducto["errores"] = {};

  const archivo = formData.get("foto");
  const foto = archivo instanceof File && archivo.size > 0 ? archivo : null;
  if (foto && !TIPOS_FOTO.includes(foto.type)) {
    errores.foto = "La foto tiene que ser JPG, PNG o WebP.";
  } else if (foto && foto.size > TAMANO_MAXIMO_FOTO) {
    errores.foto = "La foto pesa demasiado (más de 3 MB).";
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
    // La foto no se puede devolver al formulario: habrá que elegirla otra vez.
    return {
      ok: false,
      respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
    };
  }

  return { ok: true, datos: resultado.data, foto, valores };
}
