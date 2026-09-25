import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Database } from "@/types/database";

export type Rol = Database["public"]["Enums"]["rol_usuario"];

export type UsuarioActual = {
  id: string;
  email: string | null;
  rol: Rol;
  /** Ficha de jugador vinculada a la cuenta, si la hay. */
  jugador: { id: string; nombre: string; apellidos: string } | null;
};

/**
 * Cuenta con la sesión iniciada, con su rol y su ficha de jugador, o null si
 * no hay sesión. Se memoriza durante cada petición: el layout y la página
 * pueden llamarla a la vez sin repetir consultas.
 */
export const obtenerUsuarioActual = cache(
  async (): Promise<UsuarioActual | null> => {
    const supabase = await crearClienteServidor();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (!claims) {
      return null;
    }

    const { data: perfil, error } = await supabase
      .from("perfiles")
      .select("rol, jugador:jugadores(id, nombre, apellidos)")
      .eq("id", claims.sub)
      .single();

    if (error) {
      throw new Error(`No se ha podido cargar el perfil: ${error.message}`);
    }

    return {
      id: claims.sub,
      email: claims.email ?? null,
      rol: perfil.rol,
      jugador: perfil.jugador,
    };
  },
);

/**
 * Misma regla que la función tiene_acceso() de la base de datos: el
 * entrenador, o un jugador ya vinculado a su ficha. La que manda es la de la
 * base de datos (RLS); esta solo decide a qué pantalla se envía al usuario.
 */
export function tieneAcceso(usuario: UsuarioActual) {
  return usuario.rol === "entrenador" || usuario.jugador !== null;
}

/**
 * Para las páginas del panel: devuelve el usuario si puede ver los datos del
 * equipo; si no, lo redirige a la pantalla que le corresponde.
 */
export async function exigirAcceso(): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/acceso");
  }

  if (!tieneAcceso(usuario)) {
    redirect("/pendiente");
  }

  return usuario;
}
