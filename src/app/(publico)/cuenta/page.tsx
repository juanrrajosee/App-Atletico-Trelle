import { KeyRound, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesion } from "@/app/(auth)/acciones";
import { BotonBorrar } from "@/components/boton-borrar";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { borrarMiCuenta } from "./acciones";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function PaginaCuenta() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/acceso?siguiente=%2Fcuenta");
  }

  const administrador = esAdministrador(usuario);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="text-sm text-muted-foreground">
          {usuario.email}
          {administrador ? " · Administrador" : " · Aficionado"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" className="h-11">
          <Link href="/nueva-contrasena">
            <KeyRound aria-hidden />
            Cambiar la contraseña
          </Link>
        </Button>
        <form action={cerrarSesion}>
          <Button type="submit" variant="outline" className="h-11 w-full">
            <LogOut aria-hidden />
            Salir
          </Button>
        </form>
      </div>

      <section aria-labelledby="titulo-borrar" className="flex flex-col gap-3 border-t pt-6">
        <h2 id="titulo-borrar" className="font-medium">
          Borrar la cuenta
        </h2>
        {administrador ? (
          <p className="text-sm text-muted-foreground">
            Una cuenta de administrador no se puede borrar desde la
            aplicación, para que el club no se quede sin nadie que la
            gestione.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Se borran tu cuenta y tu email. Tus votos seguirán contando en
              los resultados, pero ya sin ninguna relación contigo.
            </p>
            <BotonBorrar
              accion={borrarMiCuenta}
              texto="Borrar mi cuenta"
              pregunta="¿Borrar tu cuenta?"
              consecuencias="No se puede deshacer. Si quieres volver a votar, tendrás que crear otra."
            />
          </>
        )}
        <p className="text-sm text-muted-foreground">
          Más información en la{" "}
          <Link href="/privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
