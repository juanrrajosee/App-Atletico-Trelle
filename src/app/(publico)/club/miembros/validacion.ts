import { z } from "zod";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";

export type CampoMiembro = "nombre" | "cargo" | "orden";

export type EstadoFormularioMiembro = EstadoFormulario<CampoMiembro>;
export type RespuestaFormularioMiembro = RespuestaFormulario<CampoMiembro>;

const esquemaMiembro = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre.")
    .max(120, "Como mucho 120 caracteres."),
  cargo: z
    .string()
    .trim()
    .min(1, "Escribe el cargo.")
    .max(60, "Como mucho 60 caracteres."),
  orden: z
    .string()
    .trim()
    .min(1, "Pon su posición en la lista.")
    .transform(Number)
    .pipe(
      z
        .number({ error: "Tiene que ser un número." })
        .int("Sin decimales.")
        .min(1, "Va del 1 al 99.")
        .max(99, "Va del 1 al 99."),
    ),
});

export type DatosMiembro = z.infer<typeof esquemaMiembro>;

const CAMPOS = Object.keys(esquemaMiembro.shape) as CampoMiembro[];

export function validarMiembro(
  formData: FormData,
):
  | { ok: true; datos: DatosMiembro; valores: EstadoFormularioMiembro["valores"] }
  | { ok: false; respuesta: RespuestaFormularioMiembro } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoMiembro, string>;

  const resultado = esquemaMiembro.safeParse(valores);

  if (resultado.success) {
    return { ok: true, datos: resultado.data, valores };
  }

  const porCampo = z.flattenError(resultado.error).fieldErrors;
  const errores: EstadoFormularioMiembro["errores"] = {};
  for (const campo of CAMPOS) {
    const mensaje = porCampo[campo]?.[0];
    if (mensaje) errores[campo] = mensaje;
  }

  return {
    ok: false,
    respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
  };
}
