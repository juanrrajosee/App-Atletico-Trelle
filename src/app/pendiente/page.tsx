import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/(auth)/acciones";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { obtenerUsuarioActual, tieneAcceso } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cuenta pendiente",
};

export default async function PaginaPendiente() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/acceso");
  }

  if (tieneAcceso(usuario)) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tu cuenta está pendiente</CardTitle>
          <CardDescription>
            Has entrado como {usuario.email ?? "esta cuenta"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            Falta que el entrenador vincule esta cuenta con tu ficha de
            jugador. Cuando lo haga, vuelve a abrir la aplicación y ya podrás
            ver el equipo.
          </p>
        </CardContent>
        <CardFooter>
          <form action={cerrarSesion} className="w-full">
            <Button type="submit" variant="outline" className="h-11 w-full">
              Cerrar sesión
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
