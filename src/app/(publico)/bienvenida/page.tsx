import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { obtenerUsuarioActual } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cuenta activada",
};

/** A donde llega un aficionado tras confirmar su email. */
export default async function PaginaBienvenida() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/acceso");
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        ¡Cuenta activada!
      </h1>
      <p className="text-sm text-muted-foreground">
        Ya formas parte de la afición del Atlético Trelle.
      </p>
      <Button asChild className="h-11">
        <Link href="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
