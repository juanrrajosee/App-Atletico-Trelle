import { ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import { Escudo } from "@/components/escudo";
import {
  formatearFechaCorta,
  formatearHora,
  formatearMes,
} from "@/lib/fechas";
import { equipos, type Equipo, type Partido } from "@/lib/partidos";
import { cn } from "@/lib/utils";
import { EtiquetaPartido } from "./etiqueta-partido";

/**
 * Una lista de partidos, ya ordenada, agrupada por meses para que el
 * calendario se lea de un vistazo.
 */
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

  // Los partidos ya vienen en orden: se agrupan los seguidos del mismo mes.
  const meses: { mes: string; partidos: Partido[] }[] = [];
  for (const partido of partidos) {
    const mes = formatearMes(partido.fecha_hora);
    const ultimo = meses.at(-1);
    if (ultimo?.mes === mes) {
      ultimo.partidos.push(partido);
    } else {
      meses.push({ mes, partidos: [partido] });
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="titulo-apartado">{titulo}</h2>
      {meses.map(({ mes, partidos: delMes }) => (
        <div key={mes} className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-muted-foreground">{mes}</h3>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {delMes.map((partido) => (
              <li key={partido.id}>
                <FilaPartido partido={partido} />
              </li>
            ))}
          </ul>
        </div>
      ))}
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

/** Un equipo con su escudo (del rival, uno genérico) y sus goles. */
function LineaEquipo({ equipo }: { equipo: Equipo }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        {equipo.esTrelle ? (
          <Escudo tamano={20} decorativo />
        ) : (
          <Shield
            className="size-5 shrink-0 p-0.5 text-muted-foreground"
            aria-hidden
          />
        )}
        <span className={cn("truncate", equipo.esTrelle && "font-semibold")}>
          {equipo.nombre}
        </span>
      </span>
      {equipo.goles !== null && (
        <span className="font-semibold tabular-nums">{equipo.goles}</span>
      )}
    </p>
  );
}
