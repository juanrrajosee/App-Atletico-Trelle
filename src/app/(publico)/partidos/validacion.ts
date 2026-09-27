import { z } from "zod";
import { desdeHoraDeEspana } from "@/lib/fechas";
import type { EstadoFormulario, RespuestaFormulario } from "@/lib/formularios";
import { CONDICIONES, ESTADOS_PARTIDO } from "@/lib/partidos";
import type { TablesInsert } from "@/types/database";

export type CampoPartido =
  | "rival"
  | "fecha"
  | "hora"
  | "condicion"
  | "campo"
  | "competicion"
  | "estado"
  | "goles_favor"
  | "goles_contra";

export type EstadoFormularioPartido = EstadoFormulario<CampoPartido>;
export type RespuestaFormularioPartido = RespuestaFormulario<CampoPartido>;

/** Texto opcional: vacío se guarda como null. */
function opcional(maximo: number) {
  return z
    .string()
    .trim()
    .max(maximo, `Como mucho ${maximo} caracteres.`)
    .transform((texto) => texto || null);
}

const esquemaPartido = z.object({
  rival: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del rival.")
    .max(80, "Como mucho 80 caracteres."),
  fecha: z.iso.date({ error: "Elige la fecha." }),
  // Solo horas y minutos, como los da el campo de hora.
  hora: z.iso.time({ precision: -1, error: "Elige la hora." }),
  condicion: z.enum(CONDICIONES, { error: "Elige si se juega en casa o fuera." }),
  campo: opcional(120),
  competicion: opcional(80),
  estado: z.enum(ESTADOS_PARTIDO, { error: "Elige el estado." }),
});

const esquemaGoles = z
  .string()
  .trim()
  .min(1, "Pon los goles.")
  .transform(Number)
  .pipe(
    z
      .number({ error: "Tiene que ser un número." })
      .int("Sin decimales.")
      .min(0, "No puede ser negativo.")
      .max(99, "Como mucho 99."),
  );

export type DatosPartido = Omit<TablesInsert<"partidos">, "id" | "creado_en">;

const CAMPOS: CampoPartido[] = [
  ...(Object.keys(esquemaPartido.shape) as CampoPartido[]),
  "goles_favor",
  "goles_contra",
];

export function validarPartido(
  formData: FormData,
):
  | { ok: true; datos: DatosPartido; valores: EstadoFormularioPartido["valores"] }
  | { ok: false; respuesta: RespuestaFormularioPartido } {
  const valores = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")]),
  ) as Record<CampoPartido, string>;

  const errores: EstadoFormularioPartido["errores"] = {};

  const resultado = esquemaPartido.safeParse(valores);
  if (!resultado.success) {
    const porCampo = z.flattenError(resultado.error).fieldErrors;
    for (const campo of CAMPOS) {
      const mensaje = porCampo[campo as keyof typeof porCampo]?.[0];
      if (mensaje) errores[campo] = mensaje;
    }
  }

  // Los goles solo cuentan en un partido jugado; en el resto se ignoran y se
  // guardan vacíos (la base de datos no admite otra cosa).
  const jugado = valores.estado === "jugado";
  const golesFavor = jugado ? esquemaGoles.safeParse(valores.goles_favor) : null;
  const golesContra = jugado
    ? esquemaGoles.safeParse(valores.goles_contra)
    : null;
  if (golesFavor && !golesFavor.success) {
    errores.goles_favor = golesFavor.error.issues[0].message;
  }
  if (golesContra && !golesContra.success) {
    errores.goles_contra = golesContra.error.issues[0].message;
  }

  if (!resultado.success || Object.keys(errores).length > 0) {
    return {
      ok: false,
      respuesta: { errores, mensaje: "Revisa los campos marcados.", valores },
    };
  }

  const { fecha, hora, ...resto } = resultado.data;
  const fechaHora = desdeHoraDeEspana(fecha, hora);

  if (jugado && new Date(fechaHora) > new Date()) {
    return {
      ok: false,
      respuesta: {
        errores: {
          estado: "Un partido que todavía no ha empezado no puede estar jugado.",
        },
        mensaje: "Revisa los campos marcados.",
        valores,
      },
    };
  }

  return {
    ok: true,
    datos: {
      ...resto,
      fecha_hora: fechaHora,
      goles_favor: golesFavor?.success ? golesFavor.data : null,
      goles_contra: golesContra?.success ? golesContra.data : null,
    },
    valores,
  };
}
