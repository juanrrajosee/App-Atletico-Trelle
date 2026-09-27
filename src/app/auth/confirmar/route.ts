import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Destino del enlace del email de confirmación de cuenta. Valida el token en
 * el servidor, así que funciona aunque el email se abra en otro dispositivo
 * distinto al del registro. Si sale bien, la cuenta queda activada y con la
 * sesión iniciada.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tipo = request.nextUrl.searchParams.get("type");

  if (tokenHash && tipo === "email") {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL("/bienvenida", request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/acceso?error=enlace-no-valido", request.url),
  );
}
