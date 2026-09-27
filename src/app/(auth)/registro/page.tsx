import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerUsuarioActual } from "@/lib/auth";
import { FormularioRegistro } from "./formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function PaginaRegistro() {
  if (await obtenerUsuarioActual()) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Para participar como aficionado del Atlético Trelle.
          </p>
        </div>

        <Card>
          <CardContent>
            <FormularioRegistro />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Al crear una cuenta confirmas que tienes 14 años o más.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/acceso" className="font-medium text-foreground underline underline-offset-4">
            Entrar
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
