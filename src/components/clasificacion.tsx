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
 * comparte puesto, y el primero (o los primeros) llevan una copa y van
 * destacados en granate (en claro y en oscuro: es el color del club). Cada
 * fila lleva a la ficha del jugador.
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
      <h3 className="titulo-apartado">{titulo}</h3>
      <ol className="divide-y overflow-hidden rounded-xl border bg-card">
        {filas.slice(0, maximo).map((fila) => {
          const puesto =
            filas.findIndex((otra) => otra.clave === fila.clave) + 1;
          const lider = copa && puesto === 1;
          return (
            <li key={fila.jugadorId}>
              <Link
                href={`/plantilla/${fila.jugadorId}`}
                className={cn(
                  "flex min-h-14 items-center gap-3 px-4 py-2",
                  lider
                    ? "bg-granate text-white active:bg-granate/90"
                    : "active:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    lider ? "bg-white text-granate" : "bg-muted",
                  )}
                >
                  {lider ? (
                    <>
                      <Trophy className="size-4" aria-hidden />
                      <span className="sr-only">1</span>
                    </>
                  ) : (
                    puesto
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "truncate",
                      lider
                        ? "font-display text-lg font-semibold tracking-wide uppercase"
                        : "font-medium",
                    )}
                  >
                    {fila.nombre}
                  </span>
                  {fila.detalle && (
                    <span
                      className={cn(
                        "text-xs",
                        lider ? "text-white/80" : "text-muted-foreground",
                      )}
                    >
                      {fila.detalle}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    lider ? "font-medium text-white" : "text-muted-foreground",
                  )}
                >
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
