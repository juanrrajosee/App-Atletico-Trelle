import { ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PestanasEquipo } from "@/components/pestanas";
import { Dorsal } from "@/components/plantilla/dorsal";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import {
  NOMBRE_POSICION_PLURAL,
  POSICIONES,
  nombreVisible,
} from "@/lib/plantilla";
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

      {POSICIONES.map((posicion) => (
        <GrupoJugadores
          key={posicion}
          titulo={NOMBRE_POSICION_PLURAL[posicion]}
          jugadores={activos.filter((jugador) => jugador.posicion === posicion)}
        />
      ))}

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
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {jugadores.map((jugador) => (
          <li key={jugador.id}>
            <Link
              href={`/plantilla/${jugador.id}`}
              className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
            >
              <Dorsal numero={jugador.dorsal} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {nombreVisible(jugador)}
                </span>
                {jugador.apodo && (
                  <span className="truncate text-xs text-muted-foreground">
                    {jugador.nombre} {jugador.apellidos}
                  </span>
                )}
              </span>
              {jugador.estado === "lesionado" ||
              jugador.estado === "sancionado" ? (
                <EtiquetaEstado estado={jugador.estado} />
              ) : null}
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
