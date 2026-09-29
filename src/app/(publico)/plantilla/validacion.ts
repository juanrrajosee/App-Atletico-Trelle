import { z } from "zod";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";
import { ESTADOS_JUGADOR, POSICIONES } from "@/lib/plantilla";

export type CampoJugador =
  | "nombre"
  | "apellidos"
  | "dorsal"
  | "posicion"
  | "estado";

export type EstadoFormularioJugador = EstadoFormulario<CampoJugador>;
export type RespuestaFormularioJugador = RespuestaFormulario<CampoJugador>;

const esquemaJugador = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre.")
    .max(60, "Como mucho 60 caracteres."),
  apellidos: z
    .string()
    .trim()
    .min(1, "Escribe los apellidos.")
    .max(80, "Como mucho 80 caracteres."),
  dorsal: z
    .string()
    .trim()
    .min(1, "Escribe el dorsal.")
    .transform(Number)
    .pipe(
      z
        .number({ error: "El dorsal tiene que ser un número." })
        .int("El dorsal no puede llevar decimales.")
        .min(1, "El dorsal va del 1 al 99.")
        .max(99, "El dorsal va del 1 al 99."),
    ),
  posicion: z.enum(POSICIONES, { error: "Elige una posición." }),
  estado: z.enum(ESTADOS_JUGADOR, { error: "Elige un estado." }),
});

export type DatosJugador = z.infer<typeof esquemaJugador>;

const CAMPOS = Object.keys(esquemaJugador.shape) as CampoJugador[];

export function validarJugador(
  formData: FormData,
):
  | { ok: true; datos: DatosJugador; valores: EstadoFormularioJugador["valores"] }
  | { ok: false; respuesta: RespuestaFormularioJugador } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoJugador, string>;

  const resultado = esquemaJugador.safeParse(valores);

  if (resultado.success) {
    return { ok: true, datos: resultado.data, valores };
  }

  const porCampo = z.flattenError(resultado.error).fieldErrors;
  const errores: EstadoFormularioJugador["errores"] = {};
  for (const campo of CAMPOS) {
    const mensaje = porCampo[campo]?.[0];
    if (mensaje) errores[campo] = mensaje;
  }

  return {
    ok: false,
    respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
  };
}
