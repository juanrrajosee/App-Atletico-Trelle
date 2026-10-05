import type { NextRequest } from "next/server";
import { crearNonce, politicaDeSeguridad } from "@/lib/seguridad";
import { obtenerEntornoSupabase } from "@/lib/supabase/entorno";
import { actualizarSesion } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const politica = politicaDeSeguridad({
    nonce: crearNonce(),
    urlSupabase: obtenerEntornoSupabase().url,
    desarrollo: process.env.NODE_ENV === "development",
    https: request.nextUrl.protocol === "https:",
  });

  // En la petición, para que Next.js lea el nonce y se lo ponga a sus
  // scripts al renderizar; en la respuesta, para que el navegador la cumpla.
  request.headers.set("Content-Security-Policy", politica);
  const respuesta = await actualizarSesion(request);
  respuesta.headers.set("Content-Security-Policy", politica);

  return respuesta;
}

export const config = {
  matcher: [
    // Todas las rutas salvo los recursos estáticos y las imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
