import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { SelectorTemporada } from "@/components/selector-temporada";
import { formatearFechaCorta } from "@/lib/fechas";
import { equipos, titulo } from "@/lib/partidos";
import { nombreTemporada, temporadaDe } from "@/lib/temporadas";
import { contar } from "@/lib/textos";
import {
  CATEGORIAS_VOTACION,
  NOMBRE_CORTO_CATEGORIA,
} from "@/lib/votaciones";
import { cargarEstadisticas } from "../../estadisticas/datos";
import { cargarRanking } from "../../votaciones/datos";
import { cargarPartidosDelJugador, type PartidoDelJugador } from "../datos";

/**
 * Lo que ha hecho un jugador en una temporada: sus números, lo que ha
 * ganado en las votaciones de la afición y sus partidos.
 */
export async function SeccionEstadisticas({
  jugadorId,
  temporada,
}: {
  jugadorId: string;
  temporada: number;
}) {
  const [estadisticas, ranking, partidos] = await Promise.all([
    cargarEstadisticas(temporada),
    cargarRanking(temporada),
    cargarPartidosDelJugador(jugadorId),
  ]);

  const suyas = estadisticas.find((fila) => fila.jugador_id === jugadorId);
  const premios = CATEGORIAS_VOTACION.flatMap((categoria) => {
    const victorias =
      ranking.find(
        (fila) => fila.categoria === categoria && fila.jugador_id === jugadorId,
      )?.victorias ?? 0;
    return victorias > 0
      ? [
          `${contar(victorias, "vez", "veces")} ${NOMBRE_CORTO_CATEGORIA[categoria]}`,
        ]
      : [];
  });
  const partidosTemporada = partidos.filter(
    ({ partido }) => temporadaDe(partido.fecha_hora) === temporada,
  );

  return (
    <section aria-labelledby="titulo-estadisticas" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="titulo-estadisticas"
          className="text-xl font-semibold tracking-tight"
        >
          Temporada {nombreTemporada(temporada)}
        </h2>
        <SelectorTemporada temporada={temporada} ruta={`/plantilla/${jugadorId}`} />
      </div>

      {!suyas ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No ha estado en ninguna alineación esta temporada.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border bg-border">
            {[
              { etiqueta: "Convocado", valor: suyas.convocatorias },
              { etiqueta: "Jugados", valor: suyas.partidos_jugados },
              { etiqueta: "Titular", valor: suyas.titularidades },
              { etiqueta: "Minutos", valor: suyas.minutos },
              { etiqueta: "Goles", valor: suyas.goles },
              { etiqueta: "Asistencias", valor: suyas.asistencias },
              { etiqueta: "Amarillas", valor: suyas.tarjetas_amarillas },
              { etiqueta: "Rojas", valor: suyas.tarjetas_rojas },
            ].map(({ etiqueta, valor }) => (
              <div
                key={etiqueta}
                className="flex flex-col items-center gap-1 bg-card px-1 py-3 text-center"
              >
                <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
                <dd className="text-xl font-semibold tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>

          {premios.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Votaciones de la afición
              </h3>
              <ul className="flex flex-col gap-1.5">
                {premios.map((premio) => (
                  <li key={premio} className="flex items-center gap-2 text-sm">
                    <Trophy className="size-4 shrink-0 text-amber-500" aria-hidden />
                    {premio}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {partidosTemporada.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Partidos
              </h3>
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {partidosTemporada.map((fila) => (
                  <li key={fila.partido.id}>
                    <FilaPartido fila={fila} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function FilaPartido({ fila }: { fila: PartidoDelJugador }) {
  const { partido } = fila;
  const [local, visitante] = equipos(partido);
  const detalle = [
    fila.titular ? "Titular" : "Suplente",
    fila.minutos > 0 ? `${fila.minutos} min` : "No jugó",
    fila.goles > 0 && contar(fila.goles, "gol", "goles"),
    fila.asistencias > 0 &&
      contar(fila.asistencias, "asistencia", "asistencias"),
    fila.tarjetas_amarillas > 0 &&
      contar(fila.tarjetas_amarillas, "amarilla", "amarillas"),
    fila.tarjeta_roja && "roja",
  ].filter(Boolean);

  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs text-muted-foreground">
          {formatearFechaCorta(partido.fecha_hora)}
        </span>
        <span className="truncate text-sm font-medium">{titulo(partido)}</span>
        <span className="text-xs text-muted-foreground">
          {detalle.join(" · ")}
        </span>
      </span>
      <span className="font-semibold tabular-nums">
        {local.goles}–{visitante.goles}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}
