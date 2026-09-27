import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Vuelta de Google tras "Entrar con Google": cambia el código que manda
 * Supabase por la sesión. Si algo falla (o el usuario cancela en Google),
 * vuelve a la pantalla de entrar con un aviso.
 */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("code");

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);

    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.redirect(new URL("/acceso?error=google", request.url));
}
