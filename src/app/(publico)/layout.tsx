import { CircleUser } from "lucide-react";
import Link from "next/link";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";

export default async function LayoutPublico({ children }: LayoutProps<"/">) {
  // La aplicación es pública: sin sesión se ve todo menos votar y gestionar.
  const usuario = await obtenerUsuarioActual();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
            Atlético Trelle
          </Link>
          {usuario ? (
            <div className="flex items-center gap-1">
              {esAdministrador(usuario) && (
                <Button asChild variant="ghost" className="h-10 px-2 text-muted-foreground">
                  <Link href="/administracion">Gestión</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="h-10 px-2">
                <Link href="/cuenta">
                  <CircleUser aria-hidden />
                  Mi cuenta
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" className="h-10">
              <Link href="/acceso">Entrar</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        {children}
      </main>

      {/* pb-24: por encima de la barra de navegación, que va fija abajo. */}
      <footer className="mx-auto w-full max-w-2xl px-4 pt-12 pb-24">
        <div className="flex justify-center gap-4 border-t pt-4 text-xs text-muted-foreground">
          <Link href="/privacidad" className="underline-offset-4 hover:underline">
            Privacidad
          </Link>
          <Link href="/aviso-legal" className="underline-offset-4 hover:underline">
            Aviso legal
          </Link>
        </div>
      </footer>

      <NavegacionInferior />
    </div>
  );
}
