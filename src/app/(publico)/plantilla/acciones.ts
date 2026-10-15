"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { BUCKET_FOTOS_JUGADORES } from "@/lib/plantilla";
import { borrarFotos, subirFoto } from "@/lib/supabase/fotos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  validarJugador,
  type EstadoFormularioJugador,
  type RespuestaFormularioJugador,
} from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado el jugador. Puede que se haya borrado.";
const FOTO_NO_SUBIDA = "No se ha podido subir la foto. Inténtalo de nuevo.";

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
  await exigirAdministrador();

  const validacion = await validarJugador(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, foto, valores } = validacion;

  const supabase = await crearClienteServidor();
  // El id se elige aquí para subir la foto a su carpeta antes de crear al
  // jugador: así nunca queda un jugador a medias.
  const id = randomUUID();
  const rutaFoto = foto
    ? await subirFoto(supabase, BUCKET_FOTOS_JUGADORES, id, foto)
    : null;
  if (foto && !rutaFoto) {
    return responder(anterior, {
      errores: { foto: FOTO_NO_SUBIDA },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  const { error } = await supabase
    .from("jugadores")
    .insert({ id, ...datos, foto: rutaFoto });

  if (error) {
    await borrarFotos(supabase, BUCKET_FOTOS_JUGADORES, [rutaFoto]);
    return responder(anterior, respuestaConError(error, valores));
  }

  revalidatePath("/plantilla");
  redirect(`/plantilla/${id}`);
}

export async function actualizarJugador(
  id: string,
  anterior: EstadoFormularioJugador,
  formData: FormData,
): Promise<EstadoFormularioJugador> {
  await exigirAdministrador();

  const validacion = await validarJugador(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, foto, valores } = validacion;
  const quitarFoto = formData.get("quitar_foto") === "si";

  if (!esIdValido(id)) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  const supabase = await crearClienteServidor();
  const { data: actual, error: errorActual } = await supabase
    .from("jugadores")
    .select("foto")
    .eq("id", id)
    .maybeSingle();

  if (errorActual) {
    return responder(anterior, respuestaConError(errorActual, valores));
  }
  if (!actual) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  // Foto nueva, quitar la que hay, o dejarla como está.
  let rutaFoto = actual.foto;
  if (foto) {
    rutaFoto = await subirFoto(supabase, BUCKET_FOTOS_JUGADORES, id, foto);
    if (!rutaFoto) {
      return responder(anterior, {
        errores: { foto: FOTO_NO_SUBIDA },
        mensaje: "Revisa los campos marcados.",
        valores,
      });
    }
  } else if (quitarFoto) {
    rutaFoto = null;
  }

  const { error } = await supabase
    .from("jugadores")
    .update({ ...datos, foto: rutaFoto })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    // La foto recién subida ya no se usa.
    if (rutaFoto !== actual.foto) {
      await borrarFotos(supabase, BUCKET_FOTOS_JUGADORES, [rutaFoto]);
    }
    return responder(anterior, respuestaConError(error, valores));
  }

  // La foto anterior ya no se usa.
  if (actual.foto !== rutaFoto) {
    await borrarFotos(supabase, BUCKET_FOTOS_JUGADORES, [actual.foto]);
  }

  revalidatePath("/plantilla");
  revalidatePath(`/plantilla/${id}`);
  redirect(`/plantilla/${id}`);
}

export async function borrarJugador(
  jugadorId: string,
): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(jugadorId)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("jugadores")
    .delete()
    .eq("id", jugadorId)
    .select("foto");

  if (error) {
    // 23503: otras tablas (estadísticas de partidos) lo referencian.
    if (error.code === "23503") {
      return {
        error:
          "Tiene estadísticas registradas en algún partido, así que no se puede borrar. Dale de baja.",
      };
    }
    return { error: "No se ha podido borrar el jugador. Inténtalo de nuevo." };
  }
  if (data.length === 0) {
    return { error: NO_ENCONTRADO };
  }

  // Su foto ya no se usa.
  await borrarFotos(
    supabase,
    BUCKET_FOTOS_JUGADORES,
    data.map(({ foto }) => foto),
  );

  revalidatePath("/plantilla");
  redirect("/plantilla");
}

export async function darDeBaja(jugadorId: string) {
  await exigirAdministrador();

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
