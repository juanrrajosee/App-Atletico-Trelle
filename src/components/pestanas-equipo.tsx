import Link from "next/link";
import { cn } from "@/lib/utils";

const PESTANAS = [
  { clave: "plantilla", href: "/plantilla", etiqueta: "Plantilla" },
  { clave: "estadisticas", href: "/estadisticas", etiqueta: "Estadísticas" },
  { clave: "votaciones", href: "/votaciones", etiqueta: "Votaciones" },
] as const;

/**
 * Las pestañas de la sección Equipo, que reúne la plantilla, las
 * estadísticas y las votaciones.
 */
export function PestanasEquipo({
  activa,
}: {
  activa: (typeof PESTANAS)[number]["clave"];
}) {
  return (
    <nav aria-label="Equipo" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
      {PESTANAS.map(({ clave, href, etiqueta }) => (
        <Link
          key={clave}
          href={href}
          aria-current={clave === activa ? "page" : undefined}
          className={cn(
            "flex h-10 items-center justify-center rounded-md text-sm",
            clave === activa
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {etiqueta}
        </Link>
      ))}
    </nav>
  );
}
