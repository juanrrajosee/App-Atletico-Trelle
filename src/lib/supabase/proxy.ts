import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { obtenerEntornoSupabase } from "./entorno";

/**
 * Refresca la sesión de Supabase antes de renderizar la ruta y devuelve la
 * respuesta con las cookies de sesión actualizadas.
 */
export async function actualizarSesion(request: NextRequest) {
  const { url, clave } = obtenerEntornoSupabase();
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEscribir, cabeceras) {
        cookiesAEscribir.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        respuesta = NextResponse.next({ request });
        cookiesAEscribir.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options),
        );
        // Cabeceras anti-caché: una respuesta con cookies de sesión no debe
        // guardarse en ninguna caché compartida.
        Object.entries(cabeceras).forEach(([nombre, valor]) =>
          respuesta.headers.set(nombre, valor),
        );
      },
    },
  });

  // No añadir código entre createServerClient y getClaims: getClaims es lo
  // que dispara la lectura y, si hace falta, el refresco de la sesión.
  await supabase.auth.getClaims();

  return respuesta;
}
