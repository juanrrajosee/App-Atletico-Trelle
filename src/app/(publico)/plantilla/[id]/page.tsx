import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Escudo } from "@/components/escudo";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { NOMBRE_POSICION, nombreVisible } from "@/lib/plantilla";
import { temporadaPedida } from "@/lib/temporadas";
import { cargarJugador } from "../datos";
import { SeccionBaja } from "./seccion-baja";
import { SeccionEstadisticas } from "./seccion-estadisticas";

export const metadata: Metadata = {
  title: "Jugador",
};

export default async function PaginaJugador({
  params,
  searchParams,
}: PageProps<"/plantilla/[id]">) {
  const { id } = await params;
  const temporada = temporadaPedida((await searchParams).temporada);
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const jugador = await cargarJugador(administrador, id);

  if (!jugador) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/plantilla"
        className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Plantilla
      </Link>

      {/* Como los carteles del club: los dos granates de la camiseta, el
          dorsal en grande y el escudo en la esquina. */}
      <header className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(110deg,var(--club-granate)_58%,#801b29_58%)] p-5 text-white shadow-sm">
        <Escudo tamano={44} decorativo className="absolute top-4 right-4" />
        <p className="font-display text-7xl leading-none font-semibold tabular-nums">
          <span className="sr-only">Dorsal </span>
          {jugador.dorsal}
        </p>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-3xl leading-tight font-semibold uppercase">
            {nombreVisible(jugador)}
          </h1>
          {jugador.apodo && (
            <p className="text-white/90">
              {jugador.nombre} {jugador.apellidos}
            </p>
          )}
          <p className="text-sm tracking-[0.2em] text-white/80 uppercase">
            {NOMBRE_POSICION[jugador.posicion]}
          </p>
        </div>
        {/* El estado detallado solo lo ve el administrador; el público
            solo sabe si el jugador sigue en la plantilla. */}
        {jugador.estado ? (
          <EtiquetaEstado estado={jugador.estado} />
        ) : (
          !jugador.activo && <EtiquetaEstado estado="baja" />
        )}
      </header>

      {administrador && jugador.estado && (
        <>
          <Button asChild variant="outline" className="h-11">
            <Link href={`/plantilla/${jugador.id}/editar`}>
              <Pencil aria-hidden />
              Editar datos
            </Link>
          </Button>
          <SeccionBaja
            jugadorId={jugador.id}
            nombre={jugador.nombre}
            estado={jugador.estado}
          />
        </>
      )}

      <SeccionEstadisticas jugadorId={jugador.id} temporada={temporada} />
    </div>
  );
}
