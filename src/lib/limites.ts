import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { crearClienteServidor } from "@/lib/supabase/servidor";

type Supabase = Awaited<ReturnType<typeof crearClienteServidor>>;

/**
 * Lo que se limita. Cada acción se cuenta por la dirección (IP) de quien la
 * hace y, en entrar y recuperar la contraseña, también por el email: así se
 * frena tanto a quien prueba contraseñas desde un sitio como a quien las
 * prueba contra la cuenta de alguien. Los límites (cuántos intentos y en
 * cuánto tiempo) los fija la base de datos: migración 0025.
 */
type Accion = "entrar" | "registro" | "recuperar";

export const MENSAJE_LIMITE =
  "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.";

/**
 * La dirección (IP) de quien hace la petición. En Vercel la pone Vercel con
 * la de la conexión real y no se puede falsear.
 */
async function direccion() {
  const reenviada = (await headers()).get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || "sin-direccion";
}

/** Huella de una IP o de un email: es lo único que se guarda. */
function huella(valor: string) {
  return createHash("sha256")
    .update(`atletico-trelle:${valor.trim().toLowerCase()}`)
    .digest("hex");
}

async function claves(accion: Accion, email?: string) {
  const lista = [{ accion: `${accion}_ip`, clave: huella(await direccion()) }];
  if (email) {
    lista.push({ accion: `${accion}_email`, clave: huella(email) });
  }
  return lista;
}

/**
 * Si se han agotado los intentos de esa acción, desde esta dirección o para
 * ese email. Si no se puede comprobar (por ejemplo, porque la base de datos
 * aún no tiene la migración), no se bloquea a nadie.
 */
export async function intentosAgotados(
  supabase: Supabase,
  accion: Accion,
  email?: string,
) {
  for (const { accion: limite, clave } of await claves(accion, email)) {
    const { data, error } = await supabase.rpc("intentos_agotados", {
      p_accion: limite,
      p_clave: clave,
    });
    if (error) {
      console.error(`No se ha podido comprobar el límite de ${limite}: ${error.message}`);
      return false;
    }
    if (data) {
      return true;
    }
  }
  return false;
}

/** Apunta un intento de esa acción, desde esta dirección y para ese email. */
export async function apuntarIntento(
  supabase: Supabase,
  accion: Accion,
  email?: string,
) {
  for (const { accion: limite, clave } of await claves(accion, email)) {
    const { error } = await supabase.rpc("apuntar_intento", {
      p_accion: limite,
      p_clave: clave,
    });
    if (error) {
      console.error(`No se ha podido apuntar el intento de ${limite}: ${error.message}`);
    }
  }
}
