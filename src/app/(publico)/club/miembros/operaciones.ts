import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { validarMiembro, type EstadoFormularioMiembro } from "./validacion";

/**
 * Lo que comparten la directiva y el cuerpo técnico: dos listas de personas
 * con nombre, cargo y posición, que cambia solo el administrador. Las Server
 * Actions de cada una (directiva/acciones.ts, cuerpo-tecnico/acciones.ts) son
 * una llamada a estas funciones con su tabla.
 */
export type TablaMiembros = "directiva" | "cuerpo_tecnico";

/** Cómo se llama la lista, para los mensajes ("de la directiva"). */
const DE_LA_LISTA: Record<TablaMiembros, string> = {
  directiva: "de la directiva",
  cuerpo_tecnico: "del cuerpo técnico",
};

const NO_ENCONTRADO = "No se ha encontrado a esta persona. Puede que se haya borrado.";
const NO_GUARDADO = "No se han podido guardar los cambios. Inténtalo de nuevo.";

export async function crearMiembroEn(
  tabla: TablaMiembros,
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  await exigirAdministrador();

  const validacion = validarMiembro(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from(tabla).insert(validacion.datos);

  if (error) {
    return responder(anterior, {
      errores: {},
      mensaje: NO_GUARDADO,
      valores: validacion.valores,
    });
  }

  revalidatePath("/club");
  redirect("/club");
}

export async function actualizarMiembroEn(
  tabla: TablaMiembros,
  id: string,
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  await exigirAdministrador();

  const validacion = validarMiembro(formData);
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
    .from(tabla)
    .update(validacion.datos)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, {
      errores: {},
      // PGRST116: el update no ha encontrado ninguna fila.
      mensaje: error.code === "PGRST116" ? NO_ENCONTRADO : NO_GUARDADO,
      valores: validacion.valores,
    });
  }

  revalidatePath("/club");
  redirect("/club");
}

export async function borrarMiembroDe(
  tabla: TablaMiembros,
  id: string,
): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(id)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { error, count } = await supabase
    .from(tabla)
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    return {
      error: `No se ha podido quitar ${DE_LA_LISTA[tabla]}. Inténtalo de nuevo.`,
    };
  }
  if (count === 0) {
    return { error: NO_ENCONTRADO };
  }

  revalidatePath("/club");
  redirect("/club");
}
