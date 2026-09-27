"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
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
    return { error: mensajeErrorAcceso(error.code), email };
  }

  redirect("/");
}

function mensajeErrorAcceso(codigo: string | undefined) {
  switch (codigo) {
    case "invalid_credentials":
      return "El email o la contraseña no son correctos.";
    case "email_not_confirmed":
      return "Todavía no has confirmado tu email: abre el enlace que te enviamos al crear la cuenta (mira también en la carpeta de spam).";
    default:
      return "No se ha podido entrar. Inténtalo de nuevo en un momento.";
  }
}

export type EstadoRegistro = {
  errores: { email?: string; contrasena?: string };
  mensaje: string | null;
  email: string;
  /** Email al que se ha mandado la confirmación, si el registro ha ido bien. */
  enviadoA: string | null;
};

const esquemaRegistro = z.object({
  email: z.email("Escribe un email válido."),
  contrasena: z
    .string()
    .min(8, "La contraseña tiene que tener al menos 8 caracteres."),
});

export async function registrarse(
  _estadoAnterior: EstadoRegistro,
  formData: FormData,
): Promise<EstadoRegistro> {
  const email = String(formData.get("email") ?? "").trim();
  const resultado = esquemaRegistro.safeParse({
    email,
    contrasena: String(formData.get("contrasena") ?? ""),
  });

  if (!resultado.success) {
    const porCampo = z.flattenError(resultado.error).fieldErrors;
    return {
      errores: {
        email: porCampo.email?.[0],
        contrasena: porCampo.contrasena?.[0],
      },
      mensaje: null,
      email,
      enviadoA: null,
    };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signUp({
    email: resultado.data.email,
    password: resultado.data.contrasena,
  });

  if (error) {
    return { ...erroresRegistro(error.code), email, enviadoA: null };
  }

  // Si el email ya tenía cuenta, Supabase responde igual que si fuera nuevo
  // (para no desvelar qué emails están registrados): el mensaje cubre ambos
  // casos.
  return { errores: {}, mensaje: null, email, enviadoA: resultado.data.email };
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  // La aplicación es pública: tras salir se sigue en ella, sin sesión.
  redirect("/");
}

function erroresRegistro(
  codigo: string | undefined,
): Pick<EstadoRegistro, "errores" | "mensaje"> {
  switch (codigo) {
    case "weak_password":
      return {
        errores: { contrasena: "Esa contraseña es demasiado fácil. Prueba con otra." },
        mensaje: null,
      };
    case "over_email_send_rate_limit":
      return {
        errores: {},
        mensaje:
          "Se han enviado demasiados emails seguidos. Espera un poco y vuelve a intentarlo.",
      };
    default:
      return {
        errores: {},
        mensaje: "No se ha podido crear la cuenta. Inténtalo de nuevo en un momento.",
      };
  }
}
