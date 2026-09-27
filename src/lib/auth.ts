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
};

/**
 * Cuenta con la sesión iniciada y su rol, o null si no hay sesión (la
 * aplicación es pública: no tener sesión es lo normal). Se memoriza durante
 * cada petición: el layout y la página pueden llamarla a la vez sin repetir
 * consultas.
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
      .select("rol")
      .eq("id", claims.sub)
      .single();

    if (error) {
      throw new Error(`No se ha podido cargar el perfil: ${error.message}`);
    }

    return { id: claims.sub, email: claims.email ?? null, rol: perfil.rol };
  },
);

export function esAdministrador(usuario: UsuarioActual | null) {
  return usuario?.rol === "administrador";
}

/**
 * Para las pantallas y acciones de gestión: devuelve el usuario si es
 * administrador; si no, lo manda a entrar o al inicio. Es para no enseñar
 * formularios que no se pueden usar; aunque se saltara esta comprobación,
 * RLS no deja escribir a nadie más.
 */
export async function exigirAdministrador(): Promise<UsuarioActual> {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/acceso");
  }

  if (!esAdministrador(usuario)) {
    redirect("/");
  }

  return usuario;
}
