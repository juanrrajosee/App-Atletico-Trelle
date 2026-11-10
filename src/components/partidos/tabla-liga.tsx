import {
  COLOR_ZONA,
  NOMBRE_RESULTADO,
  NOMBRE_ZONA,
  esEquipoTrelle,
  esZona,
  resultadosRecientes,
  type FilaLiga,
  type ResultadoReciente,
  type Zona,
} from "@/lib/clasificacion";
import { cn } from "@/lib/utils";

/** Mismos colores que la racha del equipo: ganado, empatado, perdido. */
const COLOR_RESULTADO: Record<ResultadoReciente, string> = {
  G: "bg-acento text-acento-foreground",
  E: "bg-muted text-muted-foreground",
  P: "border-primary bg-transparent text-primary",
};

/** Los últimos resultados de un equipo, del más antiguo al más reciente. */
function Ultimos({ ultimos }: { ultimos: string }) {
  const resultados = resultadosRecientes(ultimos);
  if (resultados.length === 0) {
    return null;
  }
  return (
    <span className="flex gap-1">
      {resultados.map((resultado, i) => (
        <span
          key={i}
          title={NOMBRE_RESULTADO[resultado]}
          className={cn(
            "flex size-5 items-center justify-center rounded-full border border-transparent text-[0.625rem] font-bold",
            COLOR_RESULTADO[resultado],
          )}
        >
          <span aria-hidden>{resultado}</span>
          <span className="sr-only">{NOMBRE_RESULTADO[resultado]}</span>
        </span>
      ))}
    </span>
  );
}

const CELDA_NUMERO = "px-1.5 py-2.5 text-center tabular-nums sm:px-2";

/**
 * La clasificación de la liga: posición, equipo, puntos y partidos jugados,
 * ganados, empatados y perdidos, más los últimos resultados. El Atlético
 * Trelle va destacado. En el móvil, los últimos resultados van debajo del
 * nombre del equipo; en el ordenador, en su columna.
 */
export function TablaLiga({ filas }: { filas: FilaLiga[] }) {
  const conSancion = filas.some((fila) => fila.sancion > 0);
  const zonas = (["ascenso", "promocion", "descenso"] as const).filter(
    (zona) => filas.some((fila) => fila.zona === zona),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">Clasificación de la liga</caption>
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="py-2 pl-3 pr-1 text-left font-medium">
                <abbr title="Posición" className="no-underline">
                  #
                </abbr>
              </th>
              <th scope="col" className="px-1.5 py-2 text-left font-medium">
                Equipo
              </th>
              <th scope="col" className={cn(CELDA_NUMERO, "font-semibold text-foreground")}>
                <abbr title="Puntos" className="no-underline">
                  Pts
                </abbr>
              </th>
              <th scope="col" className={cn(CELDA_NUMERO, "font-medium")}>
                <abbr title="Jugados" className="no-underline">
                  J
                </abbr>
              </th>
              <th scope="col" className={cn(CELDA_NUMERO, "font-medium")}>
                <abbr title="Ganados" className="no-underline">
                  G
                </abbr>
              </th>
              <th scope="col" className={cn(CELDA_NUMERO, "font-medium")}>
                <abbr title="Empatados" className="no-underline">
                  E
                </abbr>
              </th>
              <th scope="col" className={cn(CELDA_NUMERO, "font-medium")}>
                <abbr title="Perdidos" className="no-underline">
                  P
                </abbr>
              </th>
              {conSancion && (
                <th scope="col" className={cn(CELDA_NUMERO, "font-medium")}>
                  <abbr title="Puntos de sanción" className="no-underline">
                    Sanc.
                  </abbr>
                </th>
              )}
              <th
                scope="col"
                className="hidden py-2 pl-2 pr-3 text-left font-medium lg:table-cell"
              >
                Últimos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filas.map((fila) => {
              const trelle = esEquipoTrelle(fila.equipo);
              const zona: Zona | null = esZona(fila.zona) ? fila.zona : null;
              return (
                <tr
                  key={fila.id}
                  aria-current={trelle ? "true" : undefined}
                  className={cn(trelle && "bg-acento/8 font-semibold")}
                >
                  <td className="relative py-2.5 pl-3 pr-1 tabular-nums">
                    {zona && (
                      <span
                        aria-hidden
                        className={cn("absolute inset-y-0 left-0 w-1", COLOR_ZONA[zona])}
                      />
                    )}
                    {fila.posicion}
                    {zona && <span className="sr-only">, {NOMBRE_ZONA[zona]}</span>}
                  </td>
                  <th scope="row" className="px-1.5 py-2.5 text-left font-[inherit]">
                    <span className="flex flex-col gap-1.5">
                      <span
                        className={cn(
                          "break-words leading-snug",
                          trelle && "text-acento",
                        )}
                      >
                        {fila.equipo}
                      </span>
                      <span className="lg:hidden">
                        <Ultimos ultimos={fila.ultimos} />
                      </span>
                    </span>
                  </th>
                  <td className={cn(CELDA_NUMERO, "font-bold")}>{fila.puntos}</td>
                  <td className={CELDA_NUMERO}>{fila.jugados}</td>
                  <td className={CELDA_NUMERO}>{fila.ganados}</td>
                  <td className={CELDA_NUMERO}>{fila.empatados}</td>
                  <td className={CELDA_NUMERO}>{fila.perdidos}</td>
                  {conSancion && (
                    <td className={CELDA_NUMERO}>
                      {fila.sancion > 0 ? `−${fila.sancion}` : ""}
                    </td>
                  )}
                  <td className="hidden py-2.5 pl-2 pr-3 lg:table-cell">
                    <Ultimos ultimos={fila.ultimos} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {zonas.map((zona) => (
          <li key={zona} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("h-3 w-1 rounded-full", COLOR_ZONA[zona])} />
            {NOMBRE_ZONA[zona]}
          </li>
        ))}
        <li>Últimos resultados: del más antiguo al más reciente</li>
      </ul>
    </div>
  );
}
