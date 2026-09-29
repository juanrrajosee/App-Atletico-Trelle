import { z } from "zod";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";

export type CampoClub =
  | "historia_club"
  | "historia_trelle"
  | "telefono"
  | "email"
  | "campo"
  | "titular_nombre"
  | "titular_cif"
  | "titular_domicilio"
  | "email_privacidad";

export type EstadoFormularioClub = EstadoFormulario<CampoClub>;
export type RespuestaFormularioClub = RespuestaFormulario<CampoClub>;

/** Un texto corto opcional: vacío se guarda como null. */
const textoCorto = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .transform((texto) => texto || null);

/** Un email opcional: vacío se guarda como null. */
const emailOpcional = z
  .string()
  .trim()
  .pipe(z.union([z.literal(""), z.email("Escribe un email válido.")]))
  .transform((texto) => texto || null);

/** Un texto largo opcional: vacío se guarda como null. */
const textoLargo = z
  .string()
  .transform((texto) => texto.replace(/\r\n?/g, "\n").trim())
  .pipe(z.string().max(20000, "Como mucho 20 000 caracteres."))
  .transform((texto) => texto || null);

const esquemaClub = z.object({
  historia_club: textoLargo,
  historia_trelle: textoLargo,
  telefono: z
    .string()
    .transform((texto) => texto.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .regex(/^(\+?[0-9 ]{9,20})?$/, "Escribe solo números (y el +34 si quieres)."),
    )
    .transform((texto) => texto || null),
  email: emailOpcional,
  campo: textoCorto(200),
  titular_nombre: textoCorto(120),
  titular_cif: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^([A-Z0-9]{9})?$/, "El CIF tiene 9 letras o cifras, sin guiones.")
    .transform((texto) => texto || null),
  titular_domicilio: textoCorto(200),
  email_privacidad: emailOpcional,
});

export type DatosClub = z.infer<typeof esquemaClub>;

const CAMPOS = Object.keys(esquemaClub.shape) as CampoClub[];

export function validarClub(
  formData: FormData,
):
  | { ok: true; datos: DatosClub; valores: EstadoFormularioClub["valores"] }
  | { ok: false; respuesta: RespuestaFormularioClub } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoClub, string>;

  const resultado = esquemaClub.safeParse(valores);

  if (resultado.success) {
    return { ok: true, datos: resultado.data, valores };
  }

  const porCampo = z.flattenError(resultado.error).fieldErrors;
  const errores: EstadoFormularioClub["errores"] = {};
  for (const campo of CAMPOS) {
    const mensaje = porCampo[campo]?.[0];
    if (mensaje) errores[campo] = mensaje;
  }

  return {
    ok: false,
    respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
  };
}
