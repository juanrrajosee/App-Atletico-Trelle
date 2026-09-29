"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  validarPartido,
  type EstadoFormularioPartido,
  type RespuestaFormularioPartido,
} from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado el partido. Puede que se haya borrado.";

/** Traduce los errores de la base de datos a mensajes para el formulario. */
function respuestaConError(
  error: PostgrestError,
  valores: EstadoFormularioPartido["valores"],
): RespuestaFormularioPartido {
  // P0001: lo lanzan las reglas de la base de datos (por ejemplo, quitarle
  // el resultado a un partido con alineación) con un texto para el usuario.
  if (error.code === "P0001") {
    return { errores: {}, mensaje: error.message, valores };
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

/** Lo que enseña un partido, en todas las páginas donde aparece. */
function revalidarPartido(id: string) {
  revalidatePath("/");
  revalidatePath("/partidos");
  revalidatePath(`/partidos/${id}`);
}

export async function crearPartido(
  anterior: EstadoFormularioPartido,
  formData: FormData,
): Promise<EstadoFormularioPartido> {
  await exigirAdministrador();

  const validacion = validarPartido(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("partidos")
    .insert(validacion.datos)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, respuestaConError(error, validacion.valores));
  }

  revalidarPartido(data.id);
  redirect(`/partidos/${data.id}`);
}

export async function actualizarPartido(
  id: string,
  anterior: EstadoFormularioPartido,
  formData: FormData,
): Promise<EstadoFormularioPartido> {
  await exigirAdministrador();

  const validacion = validarPartido(formData);
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
    .from("partidos")
    .update(validacion.datos)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, respuestaConError(error, validacion.valores));
  }

  revalidarPartido(id);
  redirect(`/partidos/${id}`);
}

export async function borrarPartido(partidoId: string): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(partidoId)) {
    return { error: NO_ENCONTRADO };
  }

  // Su alineación y sus estadísticas se borran con él (on delete cascade).
  const supabase = await crearClienteServidor();
  const { error, count } = await supabase
    .from("partidos")
    .delete({ count: "exact" })
    .eq("id", partidoId);

  if (error) {
    return { error: "No se ha podido borrar el partido. Inténtalo de nuevo." };
  }
  if (count === 0) {
    return { error: NO_ENCONTRADO };
  }

  revalidarPartido(partidoId);
  redirect("/partidos");
}
