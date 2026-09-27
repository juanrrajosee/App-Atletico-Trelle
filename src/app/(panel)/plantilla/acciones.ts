"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirEntrenador } from "@/lib/auth";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esIdValido } from "./datos";
import {
  validarJugador,
  type EstadoFormularioJugador,
  type RespuestaFormularioJugador,
} from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado el jugador. Puede que se haya borrado.";

/** Nuevo estado del formulario, contando esta respuesta. */
function responder(
  anterior: EstadoFormularioJugador,
  respuesta: RespuestaFormularioJugador,
): EstadoFormularioJugador {
  return { ...respuesta, intento: anterior.intento + 1 };
}

/** Traduce los errores de la base de datos a mensajes para el formulario. */
function respuestaConError(
  error: PostgrestError,
  valores: EstadoFormularioJugador["valores"],
): RespuestaFormularioJugador {
  if (
    error.code === "23505" &&
    error.message.includes("jugadores_dorsal_activo_idx")
  ) {
    return {
      errores: { dorsal: "Ese dorsal ya lo lleva otro jugador en activo." },
      mensaje: "Revisa los campos marcados.",
      valores,
    };
  }

  // PGRST116: el update no ha encontrado ninguna fila.
  if (error.code === "PGRST116") {
    return { errores: {}, mensaje: NO_ENCONTRADO, valores };
  }

  return {
    errores: {},
    mensaje: "No se han podido guardar los cambios. Inténtalo de nuevo.",
    valores,
  };
}

export async function crearJugador(
  anterior: EstadoFormularioJugador,
  formData: FormData,
): Promise<EstadoFormularioJugador> {
  await exigirEntrenador();

  const validacion = validarJugador(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("jugadores")
    .insert(validacion.datos)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, respuestaConError(error, validacion.valores));
  }

  revalidatePath("/plantilla");
  redirect(`/plantilla/${data.id}`);
}

export async function actualizarJugador(
  id: string,
  anterior: EstadoFormularioJugador,
  formData: FormData,
): Promise<EstadoFormularioJugador> {
  await exigirEntrenador();

  const validacion = validarJugador(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  if (!esIdValido(id)) {
    return responder(anterior, {
      errores: {},
      mensaje: NO_ENCONTRADO,
      valores: validacion.valores,
    });
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("jugadores")
    .update(validacion.datos)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, respuestaConError(error, validacion.valores));
  }

  revalidatePath("/plantilla");
  revalidatePath(`/plantilla/${id}`);
  redirect(`/plantilla/${id}`);
}

export type EstadoVinculacion = { error: string | null };

export async function vincularCuenta(
  jugadorId: string,
  _anterior: EstadoVinculacion,
  formData: FormData,
): Promise<EstadoVinculacion> {
  await exigirEntrenador();

  const perfilId = String(formData.get("perfil_id") ?? "");
  if (!esIdValido(perfilId)) {
    return { error: "Elige una cuenta." };
  }
  if (!esIdValido(jugadorId)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("jugadores")
    .update({ perfil_id: perfilId })
    .eq("id", jugadorId)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Esa cuenta ya está vinculada a otro jugador." };
    }
    if (error.code === "PGRST116") {
      return { error: NO_ENCONTRADO };
    }
    return { error: "No se ha podido vincular la cuenta. Inténtalo de nuevo." };
  }

  revalidatePath("/plantilla");
  refresh();
  return { error: null };
}

export async function desvincularCuenta(jugadorId: string) {
  await exigirEntrenador();

  if (!esIdValido(jugadorId)) {
    return;
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("jugadores")
    .update({ perfil_id: null })
    .eq("id", jugadorId);

  if (error) {
    throw new Error(`No se ha podido desvincular la cuenta: ${error.message}`);
  }

  revalidatePath("/plantilla");
  refresh();
}

export type EstadoBorrado = { error: string | null };

export async function borrarJugador(
  jugadorId: string,
): Promise<EstadoBorrado> {
  await exigirEntrenador();

  if (!esIdValido(jugadorId)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { error, count } = await supabase
    .from("jugadores")
    .delete({ count: "exact" })
    .eq("id", jugadorId);

  if (error) {
    // 23503: otras tablas (convocatorias, asistencias...) lo referencian.
    if (error.code === "23503") {
      return {
        error: "Tiene historial en el equipo, así que no se puede borrar. Dale de baja.",
      };
    }
    return { error: "No se ha podido borrar el jugador. Inténtalo de nuevo." };
  }
  if (count === 0) {
    return { error: NO_ENCONTRADO };
  }

  revalidatePath("/plantilla");
  redirect("/plantilla");
}

export async function darDeBaja(jugadorId: string) {
  await exigirEntrenador();

  if (!esIdValido(jugadorId)) {
    return;
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("jugadores")
    .update({ estado: "baja" })
    .eq("id", jugadorId);

  if (error) {
    throw new Error(`No se ha podido dar de baja al jugador: ${error.message}`);
  }

  revalidatePath("/plantilla");
  refresh();
}
