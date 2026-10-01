import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/boton-borrar";
import { EtiquetaPartido } from "@/components/partidos/etiqueta-partido";
import { Marcador } from "@/components/partidos/marcador";
import { Dorsal } from "@/components/plantilla/dorsal";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/fechas";
import { NOMBRE_CONDICION, titulo } from "@/lib/partidos";
import { NOMBRE_POSICION, nombreVisible } from "@/lib/plantilla";
import { cn } from "@/lib/utils";
import { borrarPartido } from "../acciones";
import { cargarAlineacion, cargarPartido, type Participacion } from "../datos";
import { SeccionVotaciones } from "./seccion-votaciones";

export async function generateMetadata({
  params,
}: PageProps<"/partidos/[id]">): Promise<Metadata> {
  const partido = await cargarPartido((await params).id);
  return { title: partido ? titulo(partido) : "Partido" };
}

export default async function PaginaPartido({
  params,
}: PageProps<"/partidos/[id]">) {
  const { id } = await params;
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const partido = await cargarPartido(id);

  if (!partido) {
    notFound();
  }

  const alineacion =
    partido.estado === "jugado" ? await cargarAlineacion(partido.id) : [];
  const titulares = alineacion.filter((jugador) => jugador.titular);
  const suplentes = alineacion.filter((jugador) => !jugador.titular);
  const goleadores = alineacion
    .filter((jugador) => jugador.goles > 0)
    .sort((a, b) => b.goles - a.goles);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/partidos"
        className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Partidos
      </Link>

      <header className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-5">
        <div className="flex min-h-5 items-center justify-center gap-2 text-sm text-muted-foreground">
          {partido.competicion && <span>{partido.competicion}</span>}
          <EtiquetaPartido partido={partido} />
        </div>

        <h1 className="sr-only">{titulo(partido)}</h1>
        <Marcador partido={partido} grande />

        {goleadores.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            <span className="sr-only">Goles: </span>
            {goleadores
              .map((jugador) =>
                jugador.goles > 1
                  ? `${nombreVisible(jugador)} (${jugador.goles})`
                  : nombreVisible(jugador),
              )
              .join(", ")}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-2 text-sm">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          {formatearFechaHora(partido.fecha_hora)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {partido.campo
            ? `${partido.campo} (${NOMBRE_CONDICION[partido.condicion].toLowerCase()})`
            : NOMBRE_CONDICION[partido.condicion]}
        </p>
      </div>

      {administrador && (
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" className="h-11">
            <Link href={`/partidos/${partido.id}/editar`}>
              <Pencil aria-hidden />
              Editar partido
            </Link>
          </Button>
          {partido.estado === "jugado" && (
            <Button asChild variant="outline" className="h-11">
              <Link href={`/partidos/${partido.id}/alineacion`}>
                <Users aria-hidden />
                Alineación y estadísticas
              </Link>
            </Button>
          )}
          <BotonBorrar
            accion={borrarPartido.bind(null, partido.id)}
            texto="Borrar partido"
            pregunta={`¿Borrar el partido contra ${partido.rival}?`}
            consecuencias="Se borrará del calendario junto con su alineación y sus estadísticas. No se puede deshacer."
          />
        </div>
      )}

      <SeccionVotaciones partido={partido} alineacion={alineacion} />

      {partido.estado === "jugado" && alineacion.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no se ha registrado la alineación.
        </p>
      )}

      <GrupoAlineacion titulo="Titulares" jugadores={titulares} />
      <GrupoAlineacion titulo="Suplentes" jugadores={suplentes} />
    </div>
  );
}

function GrupoAlineacion({
  titulo,
  jugadores,
}: {
  titulo: string;
  jugadores: Participacion[];
}) {
  if (jugadores.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 titulo-apartado">{titulo}</h2>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {jugadores.map((jugador) => (
          <li key={jugador.jugador_id}>
            <Link
              href={`/plantilla/${jugador.jugador_id}`}
              className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
            >
              <Dorsal numero={jugador.dorsal} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {nombreVisible(jugador)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {resumen(jugador)}
                </span>
              </div>
              <Tarjetas jugador={jugador} />
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Delantero · 90 min · 2 goles · 1 asistencia" */
function resumen(jugador: Participacion) {
  const partes = [NOMBRE_POSICION[jugador.posicion]];

  partes.push(jugador.minutos > 0 ? `${jugador.minutos} min` : "No jugó");
  if (jugador.goles > 0) {
    partes.push(jugador.goles === 1 ? "1 gol" : `${jugador.goles} goles`);
  }
  if (jugador.asistencias > 0) {
    partes.push(
      jugador.asistencias === 1
        ? "1 asistencia"
        : `${jugador.asistencias} asistencias`,
    );
  }

  return partes.join(" · ");
}

function Tarjetas({ jugador }: { jugador: Participacion }) {
  const tarjetas = [
    ...Array.from({ length: jugador.tarjetas_amarillas }, () => "amarilla"),
    ...(jugador.tarjeta_roja ? ["roja"] : []),
  ];

  if (tarjetas.length === 0) {
    return null;
  }

  return (
    <span className="flex gap-1">
      {tarjetas.map((color, indice) => (
        <span
          key={indice}
          className={cn(
            "h-4 w-3 rounded-[2px]",
            color === "amarilla" ? "bg-yellow-400" : "bg-red-600",
          )}
        >
          <span className="sr-only">Tarjeta {color}</span>
        </span>
      ))}
    </span>
  );
}
