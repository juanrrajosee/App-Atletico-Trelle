import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerUsuarioActual } from "@/lib/auth";
import { FormularioRecuperar } from "./formulario-recuperar";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default async function PaginaRecuperar() {
  if (await obtenerUsuarioActual()) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ¿Has olvidado tu contraseña?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Te mandamos un enlace para elegir una nueva.
          </p>
        </div>

        <Card>
          <CardContent>
            <FormularioRecuperar />
          </CardContent>
        </Card>

        <Link
          href="/acceso"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Volver a Entrar
        </Link>
      </div>
    </main>
  );
}
