import { NextResponse, type NextRequest } from "next/server";
import { rutaDeVuelta } from "@/lib/rutas";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Vuelta de Google tras "Entrar con Google": cambia el código que manda
 * Supabase por la sesión y lleva a la página de la que se venía. Si algo
 * falla (o el usuario cancela en Google), vuelve a la pantalla de entrar con
 * un aviso.
 */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("code");

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);

    if (!error) {
      const siguiente = rutaDeVuelta(
        request.nextUrl.searchParams.get("siguiente"),
      );
      return NextResponse.redirect(new URL(siguiente, request.url));
    }
  }

  return NextResponse.redirect(new URL("/acceso?error=google", request.url));
}
