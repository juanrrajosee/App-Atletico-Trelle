import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { obtenerEntornoSupabase } from "./entorno";

/** Pantallas para entrar: con la sesión ya iniciada no tienen sentido. */
const RUTAS_DE_ACCESO = ["/acceso", "/registro"];

/**
 * Refresca la sesión de Supabase antes de renderizar la ruta. La aplicación
 * es pública, así que no manda a nadie a entrar: solo saca de las pantallas
 * de acceso a quien ya tiene la sesión iniciada. Las pantallas que la
 * necesitan lo comprueban por su cuenta, y los datos los protege RLS.
 */
export async function actualizarSesion(request: NextRequest) {
  const { url, clave } = obtenerEntornoSupabase();
  let cookiesSesion: { name: string; value: string; options: CookieOptions }[] =
    [];
  let cabecerasSesion: Record<string, string> = {};

  const supabase = createServerClient<Database>(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEscribir, cabeceras) {
        // Se pasan a la petición para que la página ya vea la sesión
        // refrescada, y se guardan para devolverlas en la respuesta.
        cookiesAEscribir.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesSesion = cookiesAEscribir;
        cabecerasSesion = cabeceras;
      },
    },
  });

  // No añadir código entre createServerClient y getClaims: getClaims es lo
  // que dispara la lectura y, si hace falta, el refresco de la sesión.
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);
  const enAcceso = RUTAS_DE_ACCESO.includes(request.nextUrl.pathname);

  const respuesta =
    haySesion && enAcceso
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next({ request });

  cookiesSesion.forEach(({ name, value, options }) =>
    respuesta.cookies.set(name, value, options),
  );
  // Cabeceras anti-caché: una respuesta con cookies de sesión no debe
  // guardarse en ninguna caché compartida.
  Object.entries(cabecerasSesion).forEach(([nombre, valor]) =>
    respuesta.headers.set(nombre, valor),
  );

  return respuesta;
}
