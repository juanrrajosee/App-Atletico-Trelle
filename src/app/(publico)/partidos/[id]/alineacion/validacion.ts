import { z } from "zod";

/** Lo que hizo un jugador en el partido, tal como lo manda el editor. */
export type FilaAlineacion = {
  jugador_id: string;
  titular: boolean;
  /** null si no se han puesto (es obligatorio: el servidor lo rechaza). */
  minutos: number | null;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjeta_roja: boolean;
};

export type EstadoAlineacion = {
  mensaje: string | null;
  /** Error de cada jugador, por su id. */
  errores: Record<string, string>;
};

const contador = (maximo: number) =>
  z
    .number({ error: "Tiene que ser un número." })
    .int("Sin decimales.")
    .min(0, "No puede ser negativo.")
    .max(maximo, `Como mucho ${maximo}.`);

const esquemaFila = z.object({
  jugador_id: z.guid({ error: "Jugador no válido." }),
  titular: z.boolean(),
  minutos: z
    .number({ error: "Pon los minutos que jugó (0 si no salió al campo)." })
    .int("Los minutos no llevan decimales.")
    .min(0, "Los minutos no pueden ser negativos.")
    .max(130, "Como mucho 130 minutos."),
  goles: contador(20),
  asistencias: contador(20),
  tarjetas_amarillas: contador(2),
  tarjeta_roja: z.boolean(),
});

export type FilaValida = z.infer<typeof esquemaFila>;

/**
 * Comprueba lo que llega del editor. Viene del navegador, así que no se da
 * nada por supuesto: se valida entero.
 */
export function validarAlineacion(
  entrada: unknown,
): { ok: true; filas: FilaValida[] } | { ok: false; estado: EstadoAlineacion } {
  const resultado = z.array(esquemaFila).max(60).safeParse(entrada);

  if (!resultado.success) {
    const errores: EstadoAlineacion["errores"] = {};
    for (const problema of resultado.error.issues) {
      const [indice] = problema.path;
      const jugadorId =
        typeof indice === "number" && Array.isArray(entrada)
          ? (entrada[indice] as { jugador_id?: unknown } | undefined)?.jugador_id
          : undefined;
      if (typeof jugadorId === "string" && !errores[jugadorId]) {
        errores[jugadorId] = problema.message;
      }
    }
    return {
      ok: false,
      estado: {
        mensaje:
          Object.keys(errores).length > 0
            ? "Revisa los jugadores marcados."
            : "La alineación no es válida. Recarga la página e inténtalo de nuevo.",
        errores,
      },
    };
  }

  const ids = resultado.data.map((fila) => fila.jugador_id);
  if (new Set(ids).size !== ids.length) {
    return {
      ok: false,
      estado: {
        mensaje: "Un jugador aparece dos veces. Recarga la página.",
        errores: {},
      },
    };
  }

  return { ok: true, filas: resultado.data };
}
