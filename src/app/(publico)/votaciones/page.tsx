import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { cn } from "@/lib/utils";
import {
  CATEGORIAS_VOTACION,
  NOMBRE_CATEGORIA,
  NOMBRE_CORTO_CATEGORIA,
  nombreTemporada,
  temporadaDe,
  type CategoriaVotacion,
} from "@/lib/votaciones";
import {
  cargarNombres,
  cargarRanking,
  cargarVotacionesAbiertas,
  type PuestoRanking,
} from "./datos";

export const metadata: Metadata = {
  title: "Votaciones",
};

/** El club se fundó en 2023: su primera temporada fue la 2023/24. */
const PRIMERA_TEMPORADA = 2023;

/** Cuántos jugadores se enseñan en el ranking de cada categoría. */
const PUESTOS = 10;

export default async function PaginaVotaciones({
  searchParams,
}: PageProps<"/votaciones">) {
  const actual = temporadaDe(new Date().toISOString());
  const pedida = Number((await searchParams).temporada);
  const temporada =
    Number.isInteger(pedida) && pedida >= PRIMERA_TEMPORADA && pedida <= actual
      ? pedida
      : actual;

  const [abiertas, ranking] = await Promise.all([
    cargarVotacionesAbiertas(),
    cargarRanking(temporada),
  ]);
  const nombres = await cargarNombres([
    ...new Set(ranking.map(({ jugador_id }) => jugador_id)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Votaciones</h1>
        <p className="text-sm text-muted-foreground">
          Después de cada partido, la afición vota al MVP, al mejor suplente
          y al jugador con más compromiso.
        </p>
      </div>

      {abiertas.map((partido) => (
        <AvisoVotacion key={partido.id} partido={partido} />
      ))}

      <section aria-labelledby="titulo-ranking" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="titulo-ranking" className="text-xl font-semibold tracking-tight">
            Ranking {nombreTemporada(temporada)}
          </h2>
          <nav aria-label="Temporadas" className="flex gap-1">
            <EnlaceTemporada
              temporada={temporada - 1}
              visible={temporada > PRIMERA_TEMPORADA}
              anterior
            />
            <EnlaceTemporada
              temporada={temporada + 1}
              visible={temporada < actual}
            />
          </nav>
        </div>

        {ranking.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Todavía no hay ninguna votación cerrada en esta temporada.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Cuenta las veces que cada jugador ha ganado la votación de un
              partido (con empate, ganan todos los empatados). Si hay empate en
              el ranking, decide el total de votos.
            </p>
            {CATEGORIAS_VOTACION.map((categoria) => (
              <RankingCategoria
                key={categoria}
                categoria={categoria}
                puestos={ranking.filter((fila) => fila.categoria === categoria)}
                nombres={nombres}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

function EnlaceTemporada({
  temporada,
  visible,
  anterior = false,
}: {
  temporada: number;
  visible: boolean;
  anterior?: boolean;
}) {
  if (!visible) {
    return <span className="size-10" aria-hidden />;
  }
  const Icono = anterior ? ChevronLeft : ChevronRight;
  return (
    <Link
      href={`/votaciones?temporada=${temporada}`}
      aria-label={`Temporada ${nombreTemporada(temporada)}`}
      className="flex size-10 items-center justify-center rounded-md border active:bg-accent"
    >
      <Icono className="size-4" aria-hidden />
    </Link>
  );
}

function RankingCategoria({
  categoria,
  puestos,
  nombres,
}: {
  categoria: CategoriaVotacion;
  puestos: PuestoRanking[];
  nombres: Map<string, string>;
}) {
  if (puestos.length === 0) {
    return null;
  }

  // Ya vienen ordenados. Quien empata en victorias y en votos comparte puesto.
  const conPuesto = puestos.map((fila) => ({
    ...fila,
    puesto:
      puestos.findIndex(
        (otra) => otra.victorias === fila.victorias && otra.votos === fila.votos,
      ) + 1,
  }));

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {NOMBRE_CATEGORIA[categoria]}
      </h3>
      <ol className="divide-y overflow-hidden rounded-xl border bg-card">
        {conPuesto.slice(0, PUESTOS).map((fila) => (
          <li key={fila.jugador_id}>
            <Link
              href={`/plantilla/${fila.jugador_id}`}
              className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                  fila.puesto === 1
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-muted",
                )}
              >
                {fila.puesto === 1 ? (
                  <>
                    <Trophy className="size-4" aria-hidden />
                    <span className="sr-only">1</span>
                  </>
                ) : (
                  fila.puesto
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {nombres.get(fila.jugador_id) ?? "Jugador"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fila.victorias === 0
                    ? "Aún no ha ganado"
                    : fila.victorias === 1
                      ? `1 vez ${NOMBRE_CORTO_CATEGORIA[categoria]}`
                      : `${fila.victorias} veces ${NOMBRE_CORTO_CATEGORIA[categoria]}`}
                </span>
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {fila.votos === 1 ? "1 voto" : `${fila.votos} votos`}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
