import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** A dónde se va tras validar cada tipo de enlace. */
const DESTINOS = {
  // Confirmación de una cuenta nueva.
  email: "/bienvenida",
  // Recuperación de contraseña: se entra con sesión para elegir otra.
  recovery: "/nueva-contrasena",
} as const;

function esTipoConocido(tipo: string | null): tipo is keyof typeof DESTINOS {
  return tipo !== null && Object.hasOwn(DESTINOS, tipo);
}

/**
 * Destino de los enlaces de los emails (confirmar la cuenta y recuperar la
 * contraseña). Valida el token en el servidor, así que funciona aunque el
 * email se abra en otro dispositivo. Si sale bien, deja la sesión iniciada.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tipo = request.nextUrl.searchParams.get("type");

  if (tokenHash && esTipoConocido(tipo)) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.verifyOtp({
      type: tipo,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(DESTINOS[tipo], request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/acceso?error=enlace-no-valido", request.url),
  );
}
