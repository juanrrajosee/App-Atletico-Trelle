import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaEstado } from "@/components/plantilla/etiqueta-estado";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exigirAcceso } from "@/lib/auth";
import { calcularEdad, formatearFecha } from "@/lib/fechas";
import { NOMBRE_POSICION, iniciales } from "@/lib/plantilla";
import { cargarFicha } from "../datos";
import { SeccionBaja } from "./seccion-baja";
import { SeccionCuenta } from "./seccion-cuenta";

export const metadata: Metadata = {
  title: "Jugador",
};

export default async function PaginaFicha({
  params,
}: PageProps<"/plantilla/[id]">) {
  const { id } = await params;
  const usuario = await exigirAcceso();
  const jugador = await cargarFicha(usuario, id);

  if (!jugador) {
    notFound();
  }

  const { datosPersonales } = jugador;
  const esEntrenador = usuario.rol === "entrenador";

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
          <EtiquetaEstado estado={jugador.estado} />
        </div>
      </header>

      {datosPersonales && (
        <Card className="py-4">
          <CardContent className="px-4">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="mt-0.5">
                  {datosPersonales.fechaNacimiento
                    ? `${formatearFecha(datosPersonales.fechaNacimiento)} (${calcularEdad(datosPersonales.fechaNacimiento)} años)`
                    : "Sin indicar"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="mt-0.5">
                  {datosPersonales.telefono ? (
                    <a
                      href={`tel:${datosPersonales.telefono.replaceAll(" ", "")}`}
                      className="underline underline-offset-4"
                    >
                      {datosPersonales.telefono}
                    </a>
                  ) : (
                    "Sin indicar"
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {esEntrenador && (
        <>
          <Button asChild variant="outline" className="h-11">
            <Link href={`/plantilla/${jugador.id}/editar`}>
              <Pencil aria-hidden />
              Editar datos
            </Link>
          </Button>
          <SeccionCuenta jugadorId={jugador.id} perfilId={jugador.perfilId} />
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
