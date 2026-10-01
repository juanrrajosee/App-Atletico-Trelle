import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatearFechaCorta, formatearHora } from "@/lib/fechas";
import { equipos, type Equipo, type Partido } from "@/lib/partidos";
import { cn } from "@/lib/utils";
import { EtiquetaPartido } from "./etiqueta-partido";

export function ListaPartidos({
  titulo,
  partidos,
}: {
  titulo: string;
  partidos: Partido[];
}) {
  if (partidos.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 titulo-apartado">
        {titulo}
      </h2>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {partidos.map((partido) => (
          <li key={partido.id}>
            <FilaPartido partido={partido} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilaPartido({ partido }: { partido: Partido }) {
  const [local, visitante] = equipos(partido);

  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="flex min-h-16 items-center gap-3 px-4 py-3 active:bg-accent"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-xs text-muted-foreground">
          {formatearFechaCorta(partido.fecha_hora)} ·{" "}
          {formatearHora(partido.fecha_hora)}
          {partido.competicion && ` · ${partido.competicion}`}
        </p>
        <LineaEquipo equipo={local} />
        <LineaEquipo equipo={visitante} />
      </div>
      <EtiquetaPartido partido={partido} corta />
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}

function LineaEquipo({ equipo }: { equipo: Equipo }) {
  return (
    <p className="flex items-baseline justify-between gap-3">
      <span className={cn("truncate", equipo.esTrelle && "font-semibold")}>
        {equipo.nombre}
      </span>
      {equipo.goles !== null && (
        <span className="font-semibold tabular-nums">{equipo.goles}</span>
      )}
    </p>
  );
}
