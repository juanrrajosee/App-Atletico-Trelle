"use client";

import {
  CalendarDays,
  House,
  Newspaper,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Seccion = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Rutas que cuentan como esta sección (si no, solo la de href). */
  rutas?: string[];
};

// Cada fase añade aquí su sección cuando existe su pantalla. Caben cinco
// con comodidad en un móvil: lo demás se agrupa (como en Equipo).
const SECCIONES: Seccion[] = [
  { href: "/", etiqueta: "Inicio", icono: House },
  { href: "/partidos", etiqueta: "Partidos", icono: CalendarDays },
  { href: "/noticias", etiqueta: "Noticias", icono: Newspaper },
  {
    href: "/plantilla",
    etiqueta: "Equipo",
    icono: Users,
    rutas: ["/plantilla", "/estadisticas", "/votaciones"],
  },
  { href: "/club", etiqueta: "Club", icono: Shield, rutas: ["/club", "/tienda"] },
];

function estaActiva({ href, rutas = [href] }: Seccion, rutaActual: string) {
  return href === "/"
    ? rutaActual === "/"
    : rutas.some((ruta) => rutaActual.startsWith(ruta));
}

/**
 * En el móvil, barra de navegación fija abajo, pensada para usarse con el
 * pulgar. En el ordenador no se ve: las secciones van en la cabecera.
 */
export function NavegacionInferior() {
  const rutaActual = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl">
        {SECCIONES.map((seccion) => {
          const { href, etiqueta, icono: Icono } = seccion;
          const activa = estaActiva(seccion, rutaActual);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  // El icono de la sección en la que se está, en una píldora lima.
                  "group flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  activa
                    ? "font-semibold text-primary"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full",
                    activa && "bg-lima text-lima-foreground",
                  )}
                >
                  <Icono className="size-5" aria-hidden />
                </span>
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * En el ordenador, las secciones en la cabecera, como píldoras (en el móvil
 * van en la barra de abajo). La sección en la que se está, en lima.
 */
export function NavegacionCabecera() {
  const rutaActual = usePathname();

  return (
    <nav aria-label="Secciones" className="hidden lg:block">
      <ul className="flex items-center gap-1 rounded-full bg-muted p-1">
        {SECCIONES.map((seccion) => {
          const { href, etiqueta } = seccion;
          const activa = estaActiva(seccion, rutaActual);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center rounded-full px-4 text-sm font-semibold",
                  activa
                    ? "bg-lima text-lima-foreground"
                    : "text-primary hover:bg-accent",
                )}
              >
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
