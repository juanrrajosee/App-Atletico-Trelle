"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { validarMiembro, type EstadoFormularioMiembro } from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado a esta persona. Puede que se haya borrado.";
const NO_GUARDADO = "No se han podido guardar los cambios. Inténtalo de nuevo.";

export async function crearMiembro(
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  await exigirAdministrador();

  const validacion = validarMiembro(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("directiva").insert(validacion.datos);

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

export async function actualizarMiembro(
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
    .from("directiva")
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

export async function borrarMiembro(id: string): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(id)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { error, count } = await supabase
    .from("directiva")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    return { error: "No se ha podido quitar de la directiva. Inténtalo de nuevo." };
  }
  if (count === 0) {
    return { error: NO_ENCONTRADO };
  }

  revalidatePath("/club");
  redirect("/club");
}
