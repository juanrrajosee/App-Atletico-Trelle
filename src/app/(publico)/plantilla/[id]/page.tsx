import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Escudo } from "@/components/escudo";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { FotoJugador } from "@/components/plantilla/foto-jugador";
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

      {/* En el ordenador, el cartel a un lado y sus estadísticas al otro. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr] lg:items-start">
        <div className="flex flex-col gap-6">
          {/* Como un cartel: el bloque negro de las portadas, el
              dorsal en grande y el escudo en la esquina. */}
          <header className="relative flex gap-4 overflow-hidden rounded-2xl fondo-portada p-5 text-white shadow-sm">
            <Escudo tamano={44} decorativo className="absolute top-4 right-4" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="titular text-7xl text-titulo tabular-nums">
                <span className="sr-only">Dorsal </span>
                {jugador.dorsal}
              </p>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-3xl leading-tight font-bold text-white uppercase">
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
            </div>
            {/* La foto, debajo del escudo y al lado del nombre. */}
            {jugador.foto && (
              <FotoJugador
                ruta={jugador.foto}
                tamanos="(min-width: 1024px) 144px, 112px"
                inmediata
                className="mt-12 aspect-[3/4] w-28 shrink-0 self-start rounded-xl ring-2 ring-white/40 lg:w-36"
              />
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
        </div>

        <SeccionEstadisticas jugadorId={jugador.id} temporada={temporada} />
      </div>
    </div>
  );
}
