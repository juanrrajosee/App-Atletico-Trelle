import { z } from "zod";
import { hoyEnEspana } from "@/lib/fechas";
import { ESTADOS_JUGADOR, POSICIONES } from "@/lib/plantilla";

export type CampoJugador =
  | "nombre"
  | "apellidos"
  | "dorsal"
  | "posicion"
  | "estado"
  | "fecha_nacimiento"
  | "telefono";

export type EstadoFormularioJugador = {
  errores: Partial<Record<CampoJugador, string>>;
  mensaje: string | null;
  /** Lo que se había escrito, para no vaciar el formulario si hay errores. */
  valores: Partial<Record<CampoJugador, string>>;
  /**
   * Cuántas veces ha respondido el servidor. El formulario lo usa como key
   * para montarse de nuevo con los valores enviados: si no, React lo
   * restablece tras cada envío y los selectores vuelven a su opción inicial.
   */
  intento: number;
};

export type RespuestaFormularioJugador = Omit<EstadoFormularioJugador, "intento">;

/** Texto vacío → null; si no, se valida con el esquema dado. */
function opcional<T extends z.ZodType<string, string>>(esquema: T) {
  return z
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .pipe(esquema.nullable());
}

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
  fecha_nacimiento: opcional(
    z.iso
      .date({ error: "La fecha no es válida." })
      .refine((fecha) => fecha <= hoyEnEspana(), "La fecha no puede ser futura.")
      .refine((fecha) => fecha >= "1930-01-01", "Revisa el año."),
  ),
  telefono: opcional(
    z
      .string()
      .regex(
        /^\+?[\d ]{9,20}$/,
        "Solo números y espacios (y un + al principio si hace falta).",
      ),
  ),
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
