import { ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { exigirAcceso } from "@/lib/auth";
import { NOMBRE_POSICION_PLURAL, POSICIONES } from "@/lib/plantilla";
import { cargarPlantilla, type JugadorListado } from "./datos";

export const metadata: Metadata = {
  title: "Plantilla",
};

export default async function PaginaPlantilla() {
  const usuario = await exigirAcceso();
  const plantilla = await cargarPlantilla(usuario);
  const esEntrenador = usuario.rol === "entrenador";

  const activos = plantilla.filter((jugador) => jugador.estado !== "baja");
  const deBaja = plantilla.filter((jugador) => jugador.estado === "baja");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantilla</h1>
          <p className="text-sm text-muted-foreground">
            {activos.length === 1
              ? "1 jugador en activo"
              : `${activos.length} jugadores en activo`}
          </p>
        </div>
        {esEntrenador && (
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

      <GrupoJugadores titulo="De baja" jugadores={deBaja} />
    </div>
  );
}

function GrupoJugadores({
  titulo,
  jugadores,
}: {
  titulo: string;
  jugadores: JugadorListado[];
}) {
  if (jugadores.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">
        {titulo}
      </h2>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {jugadores.map((jugador) => (
          <li key={jugador.id}>
            <Link
              href={`/plantilla/${jugador.id}`}
              className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
            >
              <span className="w-8 text-center text-lg font-semibold tabular-nums">
                {jugador.dorsal}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {jugador.nombre} {jugador.apellidos}
              </span>
              {jugador.estado !== "disponible" && jugador.estado !== "baja" && (
                <EtiquetaEstado estado={jugador.estado} />
              )}
              {jugador.tieneCuenta === false && (
                <span className="text-xs text-muted-foreground">Sin cuenta</span>
              )}
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
