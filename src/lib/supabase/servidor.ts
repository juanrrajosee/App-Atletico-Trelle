import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { obtenerEntornoSupabase } from "./entorno";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Usa la sesión del usuario (cookies), así que todas las consultas
 * pasan por Row Level Security.
 *
 * Hay que crear uno nuevo en cada petición: no se debe compartir entre
 * peticiones.
 */
export async function crearClienteServidor() {
  const almacenCookies = await cookies();
  const { url, clave } = obtenerEntornoSupabase();

  return createServerClient<Database>(url, clave, {
    cookies: {
      getAll() {
        return almacenCookies.getAll();
      },
      setAll(cookiesAEscribir) {
        try {
          cookiesAEscribir.forEach(({ name, value, options }) =>
            almacenCookies.set(name, value, options),
          );
        } catch {
          // Los Server Components no pueden escribir cookies. No pasa nada:
          // el proxy (src/proxy.ts) ya refresca la sesión en cada petición.
        }
      },
    },
  });
}
