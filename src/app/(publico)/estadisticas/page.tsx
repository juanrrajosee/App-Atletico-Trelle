import type { Metadata } from "next";
import { Clasificacion, type FilaClasificacion } from "@/components/clasificacion";
import { PestanasEquipo } from "@/components/pestanas";
import { SelectorTemporada } from "@/components/selector-temporada";
import { nombreTemporada, temporadaPedida } from "@/lib/temporadas";
import { contar } from "@/lib/textos";
import { cargarPartidos } from "../partidos/datos";
import { cargarNombres } from "../plantilla/datos";
import {
  calcularBalance,
  cargarEstadisticas,
  type Balance,
  type EstadisticasJugador,
} from "./datos";

export const metadata: Metadata = {
  title: "Estadísticas",
};

export default async function PaginaEstadisticas({
  searchParams,
}: PageProps<"/estadisticas">) {
  const temporada = temporadaPedida((await searchParams).temporada);

  const [partidos, estadisticas] = await Promise.all([
    cargarPartidos(),
    cargarEstadisticas(temporada),
  ]);
  const nombres = await cargarNombres(
    estadisticas.map(({ jugador_id }) => jugador_id),
  );
  const balance = calcularBalance(partidos, temporada);

  /**
   * Una clasificación: los jugadores con algo que contar, de más a menos (y
   * por nombre si empatan, que comparten puesto).
   */
  const clasificar = (
    valor: (fila: EstadisticasJugador) => number,
    textos: (fila: EstadisticasJugador) => Pick<FilaClasificacion, "valor" | "detalle">,
    clave: (fila: EstadisticasJugador) => string = (fila) => String(valor(fila)),
  ): FilaClasificacion[] =>
    estadisticas
      .filter((fila) => valor(fila) > 0)
      .map((fila) => ({
        jugadorId: fila.jugador_id,
        nombre: nombres.get(fila.jugador_id) ?? "Jugador",
        clave: clave(fila),
        orden: valor(fila),
        ...textos(fila),
      }))
      .sort(
        (a, b) =>
          b.orden - a.orden ||
          b.clave.localeCompare(a.clave, "es", { numeric: true }) ||
          a.nombre.localeCompare(b.nombre, "es"),
      );

  return (
    <div className="flex flex-col gap-6">
      <PestanasEquipo activa="/estadisticas" />

      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">
            Temporada {nombreTemporada(temporada)}
          </p>
        </div>
        <SelectorTemporada temporada={temporada} ruta="/estadisticas" />
      </div>

      {balance.jugados === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay partidos jugados en esta temporada.
        </p>
      ) : (
        <TarjetaBalance balance={balance} />
      )}

      {estadisticas.length > 0 && (
        <section
          aria-labelledby="titulo-clasificaciones"
          className="flex flex-col gap-4"
        >
          <h2
            id="titulo-clasificaciones"
            className="text-xl font-semibold tracking-tight"
          >
            Jugadores
          </h2>

          <Clasificacion
            titulo="Goleadores"
            filas={clasificar(
              (fila) => fila.goles,
              (fila) => ({
                valor: contar(fila.goles, "gol", "goles"),
                detalle: contar(fila.partidos_jugados, "partido jugado", "partidos jugados"),
              }),
            )}
          />
          <Clasificacion
            titulo="Asistencias"
            filas={clasificar(
              (fila) => fila.asistencias,
              (fila) => ({
                valor: contar(fila.asistencias, "asistencia", "asistencias"),
              }),
            )}
          />
          <Clasificacion
            titulo="Minutos jugados"
            filas={clasificar(
              (fila) => fila.minutos,
              (fila) => ({
                valor: `${fila.minutos} min`,
                detalle: contar(fila.partidos_jugados, "partido jugado", "partidos jugados"),
              }),
            )}
          />
          <Clasificacion
            titulo="Partidos jugados"
            filas={clasificar(
              (fila) => fila.partidos_jugados,
              (fila) => ({
                valor: contar(fila.partidos_jugados, "partido", "partidos"),
                detalle: `${
                  fila.titularidades === 0
                    ? "Siempre desde el banquillo"
                    : `${contar(fila.titularidades, "vez", "veces")} de titular`
                } · ${contar(fila.convocatorias, "convocatoria", "convocatorias")}`,
              }),
            )}
          />
          <Clasificacion
            titulo="Tarjetas"
            copa={false}
            filas={clasificar(
              (fila) => fila.tarjetas_amarillas + fila.tarjetas_rojas,
              (fila) => ({
                valor: [
                  fila.tarjetas_amarillas > 0 &&
                    contar(fila.tarjetas_amarillas, "amarilla", "amarillas"),
                  fila.tarjetas_rojas > 0 &&
                    contar(fila.tarjetas_rojas, "roja", "rojas"),
                ]
                  .filter(Boolean)
                  .join(" · "),
              }),
              // Con las mismas tarjetas, va delante quien tiene más rojas.
              (fila) =>
                `${fila.tarjetas_amarillas + fila.tarjetas_rojas}-${fila.tarjetas_rojas}`,
            )}
          />
        </section>
      )}
    </div>
  );
}

function TarjetaBalance({ balance }: { balance: Balance }) {
  const datos = [
    { etiqueta: "Jugados", valor: balance.jugados },
    { etiqueta: "Victorias", valor: balance.victorias },
    { etiqueta: "Empates", valor: balance.empates },
    { etiqueta: "Derrotas", valor: balance.derrotas },
    { etiqueta: "Goles a favor", valor: balance.golesFavor },
    { etiqueta: "Goles en contra", valor: balance.golesContra },
  ];

  return (
    <section aria-labelledby="titulo-balance" className="flex flex-col gap-2">
      <h2 id="titulo-balance" className="titulo-apartado">
        Atlético Trelle
      </h2>
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border">
        {datos.map(({ etiqueta, valor }) => (
          <div
            key={etiqueta}
            className="flex flex-col items-center gap-1 bg-card px-2 py-3 text-center"
          >
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
