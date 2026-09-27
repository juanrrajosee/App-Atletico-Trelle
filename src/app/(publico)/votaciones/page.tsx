import type { Metadata } from "next";
import { Clasificacion } from "@/components/clasificacion";
import { PestanasEquipo } from "@/components/pestanas-equipo";
import { SelectorTemporada } from "@/components/selector-temporada";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { nombreTemporada, temporadaPedida } from "@/lib/temporadas";
import {
  CATEGORIAS_VOTACION,
  NOMBRE_CATEGORIA,
  NOMBRE_CORTO_CATEGORIA,
  type CategoriaVotacion,
} from "@/lib/votaciones";
import { cargarNombres } from "../plantilla/datos";
import {
  cargarRanking,
  cargarVotacionesAbiertas,
  type PuestoRanking,
} from "./datos";

export const metadata: Metadata = {
  title: "Votaciones",
};

export default async function PaginaVotaciones({
  searchParams,
}: PageProps<"/votaciones">) {
  const temporada = temporadaPedida((await searchParams).temporada);

  const [abiertas, ranking] = await Promise.all([
    cargarVotacionesAbiertas(),
    cargarRanking(temporada),
  ]);
  const nombres = await cargarNombres([
    ...new Set(ranking.map(({ jugador_id }) => jugador_id)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PestanasEquipo activa="votaciones" />

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
          <SelectorTemporada temporada={temporada} ruta="/votaciones" />
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
              <Clasificacion
                key={categoria}
                titulo={NOMBRE_CATEGORIA[categoria]}
                filas={ranking
                  .filter((fila) => fila.categoria === categoria)
                  .map((fila) => ({
                    jugadorId: fila.jugador_id,
                    nombre: nombres.get(fila.jugador_id) ?? "Jugador",
                    detalle: victorias(fila, categoria),
                    valor: fila.votos === 1 ? "1 voto" : `${fila.votos} votos`,
                    clave: `${fila.victorias}-${fila.votos}`,
                  }))}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

/** "Aún no ha ganado", "1 vez MVP", "3 veces mejor suplente". */
function victorias(fila: PuestoRanking, categoria: CategoriaVotacion) {
  if (fila.victorias === 0) {
    return "Aún no ha ganado";
  }
  const veces = fila.victorias === 1 ? "1 vez" : `${fila.victorias} veces`;
  return `${veces} ${NOMBRE_CORTO_CATEGORIA[categoria]}`;
}
