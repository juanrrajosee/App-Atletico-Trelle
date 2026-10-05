"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  apuntarIntento,
  intentosAgotados,
  MENSAJE_LIMITE,
} from "@/lib/limites";
import { rutaDeVuelta } from "@/lib/rutas";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Cuando el límite que salta es el del propio Supabase. Supabase cuenta por
 * la dirección del servidor de la aplicación, que es la misma para todos:
 * puede saltar si entra mucha gente a la vez.
 */
const MENSAJE_SUPABASE_SATURADO =
  "Ahora mismo hay muchos intentos de entrar a la vez. Espera un minuto y vuelve a probar.";

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
  if (await intentosAgotados(supabase, "entrar", email)) {
    return { error: MENSAJE_LIMITE, email };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasena,
  });

  if (error) {
    // Solo cuentan las contraseñas equivocadas: son las que buscan adivinar.
    if (error.code === "invalid_credentials") {
      await apuntarIntento(supabase, "entrar", email);
    }
    return { error: mensajeErrorAcceso(error.code), email };
  }

  redirect(rutaDeVuelta(formData.get("siguiente")));
}

function mensajeErrorAcceso(codigo: string | undefined) {
  switch (codigo) {
    case "invalid_credentials":
      return "El email o la contraseña no son correctos.";
    case "email_not_confirmed":
      return "Todavía no has confirmado tu email: abre el enlace que te enviamos al crear la cuenta (mira también en la carpeta de spam).";
    case "over_request_rate_limit":
      return MENSAJE_SUPABASE_SATURADO;
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
  if (await intentosAgotados(supabase, "registro")) {
    return { errores: {}, mensaje: MENSAJE_LIMITE, email, enviadoA: null };
  }
  await apuntarIntento(supabase, "registro");

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
    case "over_request_rate_limit":
      return { errores: {}, mensaje: MENSAJE_SUPABASE_SATURADO };
    default:
      return {
        errores: {},
        mensaje: "No se ha podido crear la cuenta. Inténtalo de nuevo en un momento.",
      };
  }
}

export type EstadoRecuperacion = {
  error: string | null;
  email: string;
  /** Email al que se ha mandado el enlace, si ha ido bien. */
  enviadoA: string | null;
};

export async function pedirRecuperacion(
  _estadoAnterior: EstadoRecuperacion,
  formData: FormData,
): Promise<EstadoRecuperacion> {
  const email = String(formData.get("email") ?? "").trim();

  if (!z.email().safeParse(email).success) {
    return { error: "Escribe un email válido.", email, enviadoA: null };
  }

  const supabase = await crearClienteServidor();
  if (await intentosAgotados(supabase, "recuperar", email)) {
    return { error: MENSAJE_LIMITE, email, enviadoA: null };
  }
  await apuntarIntento(supabase, "recuperar", email);

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return {
      error:
        error.code === "over_email_send_rate_limit"
          ? "Se han enviado demasiados emails seguidos. Espera un poco y vuelve a intentarlo."
          : error.code === "over_request_rate_limit"
            ? MENSAJE_SUPABASE_SATURADO
            : "No se ha podido enviar el email. Inténtalo de nuevo en un momento.",
      email,
      enviadoA: null,
    };
  }

  // Supabase responde igual exista o no la cuenta (para no desvelar qué
  // emails están registrados), y el mensaje también.
  return { error: null, email, enviadoA: email };
}

export type EstadoNuevaContrasena = { error: string | null };

export async function cambiarContrasena(
  _estadoAnterior: EstadoNuevaContrasena,
  formData: FormData,
): Promise<EstadoNuevaContrasena> {
  const contrasena = String(formData.get("contrasena") ?? "");

  if (contrasena.length < 8) {
    return { error: "La contraseña tiene que tener al menos 8 caracteres." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: contrasena });

  if (error) {
    switch (error.code) {
      case "same_password":
        return { error: "Tiene que ser distinta de la que tenías." };
      case "weak_password":
        return { error: "Esa contraseña es demasiado fácil. Prueba con otra." };
      default:
        return {
          error: "No se ha podido cambiar la contraseña. Pide otro enlace e inténtalo de nuevo.",
        };
    }
  }

  redirect("/");
}

/**
 * Empieza el acceso con Google: Supabase devuelve la dirección de Google a la
 * que hay que ir, y Google vuelve después a /auth/callback (que lleva luego
 * a la página de la que se venía). La primera vez crea la cuenta (de
 * aficionado, como cualquier otra).
 */
export async function entrarConGoogle(formData: FormData) {
  const origen = (await headers()).get("origin");
  const siguiente = rutaDeVuelta(formData.get("siguiente"));
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origen}/auth/callback?siguiente=${encodeURIComponent(siguiente)}`,
    },
  });

  if (error || !data.url) {
    redirect("/acceso?error=google");
  }

  redirect(data.url);
}
