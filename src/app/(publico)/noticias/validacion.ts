import { z } from "zod";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";

export type CampoNoticia = "titulo" | "resumen" | "cuerpo" | "estado";

export type EstadoFormularioNoticia = EstadoFormulario<CampoNoticia>;
export type RespuestaFormularioNoticia = RespuestaFormulario<CampoNoticia>;

/** En el formulario, una noticia está en borrador o publicada. */
export const ESTADOS_FORMULARIO = ["borrador", "publicada"] as const;

const esquemaNoticia = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Escribe el título.")
    .max(120, "Como mucho 120 caracteres."),
  resumen: z
    .string()
    .trim()
    .max(300, "Como mucho 300 caracteres.")
    .transform((texto) => texto || null),
  // Se normalizan los saltos de línea de Windows para separar bien los
  // párrafos.
  cuerpo: z
    .string()
    .transform((texto) => texto.replace(/\r\n?/g, "\n").trim())
    .pipe(
      z
        .string()
        .min(1, "Escribe el texto de la noticia.")
        .max(20000, "Como mucho 20 000 caracteres."),
    ),
  estado: z.enum(ESTADOS_FORMULARIO, { error: "Elige si se publica o no." }),
});

export type DatosNoticia = z.infer<typeof esquemaNoticia>;

const CAMPOS = Object.keys(esquemaNoticia.shape) as CampoNoticia[];

export function validarNoticia(
  formData: FormData,
):
  | { ok: true; datos: DatosNoticia; valores: EstadoFormularioNoticia["valores"] }
  | { ok: false; respuesta: RespuestaFormularioNoticia } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoNoticia, string>;

  const resultado = esquemaNoticia.safeParse(valores);

  if (resultado.success) {
    return { ok: true, datos: resultado.data, valores };
  }

  const porCampo = z.flattenError(resultado.error).fieldErrors;
  const errores: EstadoFormularioNoticia["errores"] = {};
  for (const campo of CAMPOS) {
    const mensaje = porCampo[campo]?.[0];
    if (mensaje) errores[campo] = mensaje;
  }

  return {
    ok: false,
    respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
  };
}
