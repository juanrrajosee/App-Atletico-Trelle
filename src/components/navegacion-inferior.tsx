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

/** Barra de navegación fija abajo, pensada para usarse con el pulgar. */
export function NavegacionInferior() {
  const rutaActual = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)]"
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
