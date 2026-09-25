"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type EstadoAcceso = {
  error: string | null;
  /** Se devuelve para no vaciar el campo si el acceso falla. */
  email: string;
};

export async function iniciarSesion(
  _estadoAnterior: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  const email = String(formData.get("email") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!email || !contrasena) {
    return { error: "Escribe tu email y tu contraseña.", email };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasena,
  });

  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "El email o la contraseña no son correctos."
          : "No se ha podido entrar. Inténtalo de nuevo en un momento.",
      email,
    };
  }

  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/acceso");
}
