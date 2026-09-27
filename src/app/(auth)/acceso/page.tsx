import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerUsuarioActual } from "@/lib/auth";
import { FormularioAcceso } from "./formulario-acceso";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function PaginaAcceso() {
  if (await obtenerUsuarioActual()) {
    redirect("/");
  }

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

        <Card>
          <CardContent>
            <FormularioAcceso />
          </CardContent>
        </Card>

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
