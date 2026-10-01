import Link from "next/link";
import { cn } from "@/lib/utils";

type Pestana = { href: string; etiqueta: string };

/**
 * Pestañas arriba de una sección que agrupa varias páginas (la barra de
 * abajo tiene sitio para cinco secciones, no para todas las páginas).
 */
function Pestanas({
  etiqueta,
  pestanas,
  activa,
}: {
  /** Nombre de la sección, para los lectores de pantalla. */
  etiqueta: string;
  pestanas: Pestana[];
  /** href de la pestaña de la página actual. */
  activa: string;
}) {
  return (
    <nav
      aria-label={etiqueta}
      className="grid gap-1 rounded-lg bg-muted p-1 lg:max-w-md"
      style={{ gridTemplateColumns: `repeat(${pestanas.length}, 1fr)` }}
    >
      {pestanas.map(({ href, etiqueta: texto }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === activa ? "page" : undefined}
          className={cn(
            "flex h-10 items-center justify-center rounded-md text-sm",
            href === activa
              ? "bg-card font-medium text-primary shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {texto}
        </Link>
      ))}
    </nav>
  );
}

const PESTANAS_EQUIPO = [
  { href: "/plantilla", etiqueta: "Plantilla" },
  { href: "/estadisticas", etiqueta: "Estadísticas" },
  { href: "/votaciones", etiqueta: "Votaciones" },
];

/** Equipo: la plantilla, las estadísticas y las votaciones. */
export function PestanasEquipo({
  activa,
}: {
  activa: "/plantilla" | "/estadisticas" | "/votaciones";
}) {
  return <Pestanas etiqueta="Equipo" pestanas={PESTANAS_EQUIPO} activa={activa} />;
}

const PESTANAS_CLUB = [
  { href: "/club", etiqueta: "El club" },
  { href: "/tienda", etiqueta: "Tienda" },
];

/** Club: la historia, la directiva y el contacto, y la tienda. */
export function PestanasClub({ activa }: { activa: "/club" | "/tienda" }) {
  return <Pestanas etiqueta="Club" pestanas={PESTANAS_CLUB} activa={activa} />;
}
