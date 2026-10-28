import { CircleUser } from "lucide-react";
import Link from "next/link";
import { Escudo } from "@/components/escudo";
import {
  NavegacionCabecera,
  NavegacionInferior,
} from "@/components/navegacion";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";

export default async function LayoutPublico({ children }: LayoutProps<"/">) {
  // La aplicación es pública: sin sesión se ve todo menos votar y gestionar.
  const usuario = await obtenerUsuarioActual();

  return (
    <div className="flex flex-1 flex-col">
      {/* Blanca y fija arriba, con una línea fina debajo. */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-4 px-4 lg:max-w-5xl">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-lg font-black tracking-tight whitespace-nowrap text-primary"
          >
            <Escudo tamano={36} decorativo inmediato />
            <span className="truncate">Atlético Trelle</span>
          </Link>
          <NavegacionCabecera />
          {usuario ? (
            <div className="flex shrink-0 items-center gap-1">
              {esAdministrador(usuario) && (
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 px-3 text-primary"
                >
                  <Link href="/administracion">Gestión</Link>
                </Button>
              )}
              <Button
                asChild
                variant="ghost"
                className="h-10 px-3 text-primary"
              >
                <Link href="/cuenta">
                  <CircleUser aria-hidden />
                  {/* En el móvil solo el icono: con "Gestión" no cabe más. */}
                  <span className="max-sm:sr-only">Mi cuenta</span>
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-10 shrink-0 px-5"
            >
              <Link href="/acceso">Entrar</Link>
            </Button>
          )}
        </div>
      </header>

      {/* En el ordenador, más ancho: las páginas reparten el contenido en
          columnas, y las de leer o rellenar se quedan estrechas
          (pagina-estrecha). */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 lg:max-w-5xl lg:pt-8">
        {children}
      </main>

      {/* pb-24: por encima de la barra de navegación, que en el móvil va fija
          abajo. */}
      <footer className="mx-auto w-full max-w-2xl px-4 pt-12 pb-24 lg:max-w-5xl lg:pb-8">
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
