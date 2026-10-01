import Link from "next/link";
import {
  COLOR_DESENLACE,
  NOMBRE_DESENLACE,
  desenlace,
  equipos,
  titulo,
  type Partido,
} from "@/lib/partidos";
import { cn } from "@/lib/utils";

/**
 * Los últimos resultados, del más antiguo al más reciente: una V, una E o
 * una D por partido, que llevan a cada uno.
 */
export function Racha({ partidos }: { partidos: Partido[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Últimos partidos, del más antiguo al más reciente
      </p>
      <ol className="flex gap-2">
        {partidos.map((partido) => {
          // Solo llegan partidos jugados con resultado.
          const resultado = desenlace(partido) ?? "empate";
          const nombre = NOMBRE_DESENLACE[resultado];
          // Los goles en el orden del título: primero los del que juega en casa.
          const [local, visitante] = equipos(partido);
          const marcador = `${local.goles}–${visitante.goles}`;
          return (
            <li key={partido.id}>
              <Link
                href={`/partidos/${partido.id}`}
                title={`${titulo(partido)}: ${marcador}`}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full font-display text-lg font-semibold",
                  COLOR_DESENLACE[resultado],
                )}
              >
                <span aria-hidden>{nombre.charAt(0)}</span>
                <span className="sr-only">
                  {nombre}: {titulo(partido)}, {local.goles} a {visitante.goles}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
