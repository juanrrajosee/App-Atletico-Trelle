import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { NOMBRE_POSICION, iniciales } from "@/lib/plantilla";
import { cargarJugador } from "../datos";
import { SeccionBaja } from "./seccion-baja";

export const metadata: Metadata = {
  title: "Jugador",
};

export default async function PaginaJugador({
  params,
}: PageProps<"/plantilla/[id]">) {
  const { id } = await params;
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

      <header className="flex items-center gap-4">
        <div
          aria-hidden
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-semibold"
        >
          {iniciales(jugador.nombre, jugador.apellidos)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {jugador.nombre} {jugador.apellidos}
          </h1>
          <p className="text-sm text-muted-foreground">
            Dorsal {jugador.dorsal} · {NOMBRE_POSICION[jugador.posicion]}
          </p>
          {/* El estado detallado solo lo ve el administrador; el público
              solo sabe si el jugador sigue en la plantilla. */}
          {jugador.estado ? (
            <EtiquetaEstado estado={jugador.estado} />
          ) : (
            !jugador.activo && <EtiquetaEstado estado="baja" />
          )}
        </div>
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
  );
}
