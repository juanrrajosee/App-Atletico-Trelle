import { Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilaClasificacion = {
  jugadorId: string;
  nombre: string;
  /** Línea pequeña bajo el nombre (por ejemplo, "2 veces MVP"). */
  detalle?: string;
  /** Lo que se enseña a la derecha (por ejemplo, "5 votos"). */
  valor: string;
  /**
   * Lo que decide el puesto: dos filas con la misma clave empatan y lo
   * comparten.
   */
  clave: string;
};

/**
 * Una clasificación de jugadores, ya ordenada de mejor a peor. Quien empata
 * comparte puesto, y el primero (o los primeros) llevan una copa. Cada fila
 * lleva a la ficha del jugador.
 */
export function Clasificacion({
  titulo,
  filas,
  maximo = 10,
  copa = true,
}: {
  titulo: string;
  filas: FilaClasificacion[];
  /** Cuántas filas se enseñan como mucho. */
  maximo?: number;
  /** Si el primero lleva copa (no, por ejemplo, en las tarjetas). */
  copa?: boolean;
}) {
  if (filas.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">{titulo}</h3>
      <ol className="divide-y overflow-hidden rounded-xl border bg-card">
        {filas.slice(0, maximo).map((fila) => {
          const puesto =
            filas.findIndex((otra) => otra.clave === fila.clave) + 1;
          return (
            <li key={fila.jugadorId}>
              <Link
                href={`/plantilla/${fila.jugadorId}`}
                className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    copa && puesto === 1
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-muted",
                  )}
                >
                  {copa && puesto === 1 ? (
                    <>
                      <Trophy className="size-4" aria-hidden />
                      <span className="sr-only">1</span>
                    </>
                  ) : (
                    puesto
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{fila.nombre}</span>
                  {fila.detalle && (
                    <span className="text-xs text-muted-foreground">
                      {fila.detalle}
                    </span>
                  )}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {fila.valor}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
