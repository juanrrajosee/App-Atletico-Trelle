import { CircleCheck, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FormularioVoto } from "@/components/votaciones/formulario-voto";
import { Button } from "@/components/ui/button";
import { obtenerUsuarioActual } from "@/lib/auth";
import { formatearHasta } from "@/lib/fechas";
import type { Partido } from "@/lib/partidos";
import {
  CANDIDATOS_CATEGORIA,
  CATEGORIAS_VOTACION,
  NOMBRE_CATEGORIA,
  esCandidato,
  type CategoriaVotacion,
} from "@/lib/votaciones";
import { cn } from "@/lib/utils";
import { votar } from "../../votaciones/acciones";
import { cargarNombres } from "../../plantilla/datos";
import {
  cargarMisVotos,
  cargarResultados,
  cargarVotacion,
  type ResultadoVotacion,
} from "../../votaciones/datos";
import type { Participacion } from "../datos";

/**
 * Las votaciones de la afición en la ficha de un partido: antes del partido,
 * un aviso; con la votación abierta, votar (o a quién se ha votado); ya
 * cerrada, los resultados.
 */
export async function SeccionVotaciones({
  partido,
  alineacion,
}: {
  partido: Partido;
  alineacion: Participacion[];
}) {
  if (partido.estado === "aplazado") {
    return null;
  }

  if (partido.estado === "programado") {
    return (
      <Seccion>
        <p className="text-sm text-muted-foreground">
          Cuando acabe el partido podrás votar al MVP, al mejor suplente y al
          jugador con más compromiso.
        </p>
      </Seccion>
    );
  }

  const votacion = await cargarVotacion(partido.id);

  if (votacion.estado === "pendiente") {
    return (
      <Seccion>
        <p className="text-sm text-muted-foreground">
          La votación se abrirá en cuanto se registre la alineación del
          partido.
        </p>
      </Seccion>
    );
  }

  if (votacion.estado === "cerrada") {
    const resultados = await cargarResultados(partido.id);
    // Sin votos (por ejemplo, un partido que se registró otro día), no hay
    // nada que enseñar.
    if (resultados.length === 0) {
      return null;
    }
    const nombres = await cargarNombres([
      ...new Set(resultados.map(({ jugador_id }) => jugador_id)),
    ]);
    return (
      <Seccion>
        {CATEGORIAS_VOTACION.map((categoria) => (
          <ResultadosCategoria
            key={categoria}
            categoria={categoria}
            resultados={resultados.filter((fila) => fila.categoria === categoria)}
            nombres={nombres}
          />
        ))}
      </Seccion>
    );
  }

  // Abierta.
  const usuario = await obtenerUsuarioActual();
  const misVotos = await cargarMisVotos(usuario, partido.id);
  const nombreDe = (jugadorId: string) => {
    const jugador = alineacion.find((fila) => fila.jugador_id === jugadorId);
    return jugador ? `${jugador.nombre} ${jugador.apellidos}` : "un jugador";
  };

  return (
    <Seccion>
      <p className="text-sm text-muted-foreground">
        Votación abierta
        {votacion.cierre && ` hasta ${formatearHasta(votacion.cierre)}`}. Los
        resultados se publican al cerrarse.
      </p>

      {!usuario && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4">
          <p className="text-sm">
            Entra con tu cuenta de aficionado para votar al MVP, al mejor
            suplente y al jugador con más compromiso.
          </p>
          <Button asChild className="h-11">
            <Link
              href={`/acceso?siguiente=${encodeURIComponent(`/partidos/${partido.id}`)}`}
            >
              Entrar para votar
            </Link>
          </Button>
        </div>
      )}

      {usuario &&
        CATEGORIAS_VOTACION.map((categoria) => {
          const candidatos = alineacion
            .filter((jugador) => esCandidato(categoria, jugador))
            .map(({ jugador_id, nombre, apellidos }) => ({
              id: jugador_id,
              nombre: `${nombre} ${apellidos}`,
            }));
          // Por ejemplo, si no salió ningún suplente.
          if (candidatos.length === 0) {
            return null;
          }
          const votado = misVotos[categoria];
          return (
            <Categoria key={categoria} categoria={categoria}>
              {votado ? (
                <p className="flex items-center gap-2 text-sm">
                  <CircleCheck
                    className="size-4 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  Has votado a {nombreDe(votado)}.
                </p>
              ) : (
                <FormularioVoto
                  accion={votar.bind(null, partido.id, categoria)}
                  candidatos={candidatos}
                  categoria={NOMBRE_CATEGORIA[categoria]}
                />
              )}
            </Categoria>
          );
        })}
    </Seccion>
  );
}

function Seccion({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="titulo-votaciones" className="flex flex-col gap-3">
      <h2
        id="titulo-votaciones"
        className="titulo-apartado"
      >
        Votaciones de la afición
      </h2>
      {children}
    </section>
  );
}

function Categoria({
  categoria,
  children,
}: {
  categoria: CategoriaVotacion;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4">
      <div>
        <h3 className="font-medium">{NOMBRE_CATEGORIA[categoria]}</h3>
        <p className="text-xs text-muted-foreground">
          {CANDIDATOS_CATEGORIA[categoria]}
        </p>
      </div>
      {children}
    </div>
  );
}

function ResultadosCategoria({
  categoria,
  resultados,
  nombres,
}: {
  categoria: CategoriaVotacion;
  resultados: ResultadoVotacion[];
  nombres: Map<string, string>;
}) {
  if (resultados.length === 0) {
    return null;
  }

  // Ya vienen de más a menos votos; con empate, ganan todos los empatados.
  const maximo = resultados[0].votos;

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-4">
      <h3 className="font-medium">{NOMBRE_CATEGORIA[categoria]}</h3>
      <ol className="flex flex-col gap-1.5">
        {resultados.map(({ jugador_id, votos }) => {
          const gana = votos === maximo;
          return (
            <li
              key={jugador_id}
              className={cn(
                "flex items-center gap-2 text-sm",
                gana ? "font-medium" : "text-muted-foreground",
              )}
            >
              {gana ? (
                <Trophy className="size-4 shrink-0 text-amber-500" aria-hidden />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate">
                {nombres.get(jugador_id) ?? "Jugador"}
                {gana && <span className="sr-only"> (ganador)</span>}
              </span>
              <span className="tabular-nums">
                {votos === 1 ? "1 voto" : `${votos} votos`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
