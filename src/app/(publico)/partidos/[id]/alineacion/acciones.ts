"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdministrador } from "@/lib/auth";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { validarAlineacion, type EstadoAlineacion } from "./validacion";

/**
 * Guarda la alineación entera de una vez con guardar_alineacion(), que
 * reemplaza la anterior en una sola transacción. Una lista vacía la borra.
 */
export async function guardarAlineacion(
  partidoId: string,
  _anterior: EstadoAlineacion,
  filas: unknown,
): Promise<EstadoAlineacion> {
  await exigirAdministrador();

  if (!esIdValido(partidoId)) {
    return { mensaje: "No se ha encontrado el partido.", errores: {} };
  }

  const validacion = validarAlineacion(filas);
  if (!validacion.ok) {
    return validacion.estado;
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("guardar_alineacion", {
    p_partido_id: partidoId,
    p_filas: validacion.filas,
  });

  if (error) {
    // P0001: las reglas de la función (goles de más, partido sin jugar)
    // lanzan un texto pensado para el usuario.
    if (error.code === "P0001") {
      return { mensaje: error.message, errores: {} };
    }
    if (error.code === "P0002") {
      return {
        mensaje: "No se ha encontrado el partido. Puede que se haya borrado.",
        errores: {},
      };
    }
    // 23503: algún jugador ya no existe (lo han borrado mientras tanto).
    if (error.code === "23503") {
      return {
        mensaje: "Algún jugador ya no está en la plantilla. Recarga la página.",
        errores: {},
      };
    }
    return {
      mensaje: "No se ha podido guardar la alineación. Inténtalo de nuevo.",
      errores: {},
    };
  }

  // Las estadísticas de los jugadores también cambian.
  revalidatePath(`/partidos/${partidoId}`);
  revalidatePath("/plantilla", "layout");
  redirect(`/partidos/${partidoId}`);
}
