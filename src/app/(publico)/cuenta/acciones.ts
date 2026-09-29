"use server";

import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { obtenerUsuarioActual } from "@/lib/auth";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Borra la cuenta con la sesión iniciada (borrar_mi_cuenta() en la base de
 * datos) y cierra la sesión en este navegador.
 */
export async function borrarMiCuenta(): Promise<EstadoBorrado> {
  if (!(await obtenerUsuarioActual())) {
    redirect("/acceso");
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("borrar_mi_cuenta");

  if (error) {
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "No se ha podido borrar la cuenta. Inténtalo de nuevo.",
    };
  }

  // La cuenta ya no existe: solo queda quitar la sesión de este navegador.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/?cuenta=borrada");
}
