import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerUsuarioActual } from "@/lib/auth";
import { rutaDeVuelta } from "@/lib/rutas";
import { googleActivado } from "@/lib/supabase/proveedores";
import { BotonGoogle, SeparadorEmail } from "../boton-google";
import { FormularioAcceso } from "./formulario-acceso";

export const metadata: Metadata = {
  title: "Entrar",
};

/** Avisos al volver de un enlace de email o de Google que no ha funcionado. */
const AVISOS: Record<string, string> = {
  "enlace-no-valido":
    "El enlace no es válido o ha caducado. Si ya confirmaste tu cuenta, entra con tu email y contraseña.",
  google: "No se ha podido entrar con Google. Inténtalo de nuevo.",
};

export default async function PaginaAcceso({
  searchParams,
}: PageProps<"/acceso">) {
  const { error, siguiente: siguienteParametro } = await searchParams;
  // Adónde volver después de entrar (por ejemplo, al partido que se iba a
  // votar).
  const siguiente = rutaDeVuelta(siguienteParametro);

  if (await obtenerUsuarioActual()) {
    redirect(siguiente);
  }

  const aviso = typeof error === "string" ? AVISOS[error] : undefined;
  const conGoogle = await googleActivado();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Atlético Trelle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entra con tu cuenta de aficionado.
          </p>
        </div>

        {aviso && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 px-4 py-3 text-sm text-destructive"
          >
            {aviso}
          </p>
        )}

        <Card>
          <CardContent className="flex flex-col gap-5">
            {conGoogle && (
              <>
                <BotonGoogle siguiente={siguiente} />
                <SeparadorEmail />
              </>
            )}
            <FormularioAcceso siguiente={siguiente} />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link
            href={
              siguiente === "/"
                ? "/registro"
                : `/registro?siguiente=${encodeURIComponent(siguiente)}`
            }
            className="font-medium text-foreground underline underline-offset-4"
          >
            Crear cuenta
          </Link>
        </p>

        <Link
          href="/"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
