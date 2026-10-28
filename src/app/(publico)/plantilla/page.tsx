import { ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PestanasEquipo } from "@/components/pestanas";
import { Dorsal } from "@/components/plantilla/dorsal";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { FotoJugador } from "@/components/plantilla/foto-jugador";
import { Pizarra } from "@/components/plantilla/pizarra";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import {
  NOMBRE_POSICION,
  NOMBRE_POSICION_PLURAL,
  POSICIONES,
  nombreVisible,
} from "@/lib/plantilla";
import { cn } from "@/lib/utils";
import { cargarPlantilla, type Jugador } from "./datos";

export const metadata: Metadata = {
  title: "Plantilla",
};

export default async function PaginaPlantilla() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const plantilla = await cargarPlantilla(administrador);

  const activos = plantilla.filter((jugador) => jugador.activo);
  const deBaja = plantilla.filter((jugador) => !jugador.activo);

  return (
    <div className="flex flex-col gap-6">
      <PestanasEquipo activa="/plantilla" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantilla</h1>
          <p className="text-sm text-muted-foreground">
            {activos.length === 1
              ? "1 jugador en activo"
              : `${activos.length} jugadores en activo`}
          </p>
        </div>
        {administrador && (
          <Button asChild className="h-11">
            <Link href="/plantilla/nuevo">
              <Plus aria-hidden />
              Añadir
            </Link>
          </Button>
        )}
      </div>

      {plantilla.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay jugadores en la plantilla.
        </p>
      )}

      {activos.length > 0 && (
        <Pizarra
          grupos={POSICIONES.map((posicion) => {
            const jugadores = activos.filter(
              (jugador) => jugador.posicion === posicion,
            );
            return {
              posicion,
              titulo: NOMBRE_POSICION_PLURAL[posicion],
              cantidad: jugadores.length,
              contenido: <ListaJugadores jugadores={jugadores} />,
            };
          })}
        />
      )}

      {/* Los que ya no están en la plantilla solo le interesan a quien la gestiona. */}
      {administrador && <GrupoJugadores titulo="De baja" jugadores={deBaja} />}
    </div>
  );
}

function GrupoJugadores({
  titulo,
  jugadores,
}: {
  titulo: string;
  jugadores: Jugador[];
}) {
  if (jugadores.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 titulo-apartado">
        {titulo}
      </h2>
      <ListaJugadores jugadores={jugadores} />
    </section>
  );
}

/** Las tarjetas de unos jugadores; en el ordenador, en dos columnas. */
function ListaJugadores({ jugadores }: { jugadores: Jugador[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {jugadores.map((jugador) => (
        <li key={jugador.id}>
          <TarjetaJugador jugador={jugador} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Un jugador. Con foto, la foto es grande (con su dorsal en la esquina) y al
 * lado van el nombre, la posición y el estado; en el ordenador, un poco más
 * grande todavía. Sin foto, la fila compacta con el dorsal.
 */
function TarjetaJugador({ jugador }: { jugador: Jugador }) {
  const conFoto = jugador.foto !== null;
  // Lesionado o sancionado (solo lo ve el administrador).
  const estado =
    jugador.estado === "lesionado" || jugador.estado === "sancionado"
      ? jugador.estado
      : null;

  return (
    <Link
      href={`/plantilla/${jugador.id}`}
      className={cn(
        "tarjeta-elevable flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-2 shadow-xs",
        conFoto && "gap-4 py-3 lg:gap-5",
      )}
    >
      {jugador.foto ? (
        // Con foto, ocupa el hueco del dorsal y este pasa a chapa en la
        // esquina: todas las filas siguen alineadas.
        <span className="relative shrink-0">
          <FotoJugador
            ruta={jugador.foto}
            tamanos="(min-width: 64rem) 112px, 96px"
            className="aspect-4/5 w-24 rounded-lg lg:w-28"
          />
          <span className="absolute -right-2 -bottom-2 min-w-7 rounded-full bg-primary px-1.5 text-center text-base leading-7 font-bold text-primary-foreground tabular-nums ring-2 ring-card">
            <span className="sr-only">Dorsal </span>
            {jugador.dorsal}
          </span>
        </span>
      ) : (
        <Dorsal numero={jugador.dorsal} />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "font-medium",
            conFoto
              ? "line-clamp-2 text-lg leading-tight font-semibold lg:text-xl"
              : "truncate",
          )}
        >
          {nombreVisible(jugador)}
        </span>
        {jugador.apodo && (
          <span className="truncate text-xs text-muted-foreground">
            {jugador.nombre} {jugador.apellidos}
          </span>
        )}
        {conFoto && (
          <span className="mt-0.5 truncate text-sm text-muted-foreground">
            {NOMBRE_POSICION[jugador.posicion]}
          </span>
        )}
        {/* Con foto, la etiqueta va debajo y no le quita sitio al nombre. */}
        {estado && conFoto && (
          <span className="mt-1.5 flex">
            <EtiquetaEstado estado={estado} />
          </span>
        )}
      </span>
      {estado && !conFoto && <EtiquetaEstado estado={estado} />}
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}
