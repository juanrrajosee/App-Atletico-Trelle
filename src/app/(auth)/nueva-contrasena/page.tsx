import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerUsuarioActual } from "@/lib/auth";
import { FormularioNuevaContrasena } from "./formulario-nueva-contrasena";

export const metadata: Metadata = {
  title: "Contraseña nueva",
};

/**
 * Se llega desde el enlace del email de recuperación, que deja la sesión
 * iniciada; sin sesión no hay cuenta a la que cambiarle la contraseña.
 */
export default async function PaginaNuevaContrasena() {
  if (!(await obtenerUsuarioActual())) {
    redirect("/recuperar");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Elige una contraseña nueva
          </h1>
        </div>

        <Card>
          <CardContent>
            <FormularioNuevaContrasena />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
