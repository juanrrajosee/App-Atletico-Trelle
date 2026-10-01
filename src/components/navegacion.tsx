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
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                  // La raya de arriba marca la sección en la que se está.
                  "flex h-16 flex-col items-center justify-center gap-1 border-t-2 text-xs",
                  activa
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-muted-foreground",
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

/**
 * En el ordenador, las secciones en la cabecera granate (en el móvil van en
 * la barra de abajo).
 */
export function NavegacionCabecera() {
  const rutaActual = usePathname();

  return (
    <nav aria-label="Secciones" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {SECCIONES.map((seccion) => {
          const { href, etiqueta, icono: Icono } = seccion;
          const activa = estaActiva(seccion, rutaActual);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
                  activa
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icono className="size-4" aria-hidden />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
