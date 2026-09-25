"use client";

import { House, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Seccion = { href: string; etiqueta: string; icono: LucideIcon };

// Cada fase añade aquí su sección cuando existe su pantalla.
const SECCIONES: Seccion[] = [{ href: "/", etiqueta: "Inicio", icono: House }];

function estaActiva(href: string, rutaActual: string) {
  return href === "/" ? rutaActual === "/" : rutaActual.startsWith(href);
}

/** Barra de navegación fija abajo, pensada para usarse con el pulgar. */
export function NavegacionInferior() {
  const rutaActual = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-2xl">
        {SECCIONES.map(({ href, etiqueta, icono: Icono }) => {
          const activa = estaActiva(href, rutaActual);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  activa
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icono className="size-5" aria-hidden />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
