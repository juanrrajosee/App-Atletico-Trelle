"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { validarClub, type EstadoFormularioClub } from "./validacion";

export async function actualizarClub(
  anterior: EstadoFormularioClub,
  formData: FormData,
): Promise<EstadoFormularioClub> {
  await exigirAdministrador();

  const validacion = validarClub(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  // La tabla club tiene una sola fila (id = true).
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("club")
    .update(validacion.datos)
    .eq("id", true)
    .select("id")
    .single();

  if (error) {
    return responder(anterior, {
      errores: {},
      mensaje: "No se han podido guardar los cambios. Inténtalo de nuevo.",
      valores: validacion.valores,
    });
  }

  revalidatePath("/club");
  redirect("/club");
}
