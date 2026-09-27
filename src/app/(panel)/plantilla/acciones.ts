"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
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
