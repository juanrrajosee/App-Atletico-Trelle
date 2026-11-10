import type { Metadata } from "next";
import { TablaLiga } from "@/components/partidos/tabla-liga";
import { PestanasPartidos } from "@/components/pestanas";
import { SelectorTemporada } from "@/components/selector-temporada";
import { formatearFecha } from "@/lib/fechas";
import { nombreTemporada, temporadaPedida } from "@/lib/temporadas";
import { cargarClasificacionLiga } from "../datos";

export const metadata: Metadata = {
  title: "Clasificación",
  description: "La clasificación de la liga del Atlético Trelle.",
};

export default async function PaginaClasificacion({
  searchParams,
}: PageProps<"/partidos/clasificacion">) {
  const temporada = temporadaPedida((await searchParams).temporada);
  const filas = await cargarClasificacionLiga(temporada);

  // Se copia entera de una vez: la fecha de la fila más reciente es la de
  // la última actualización.
  const actualizada = filas.reduce<string | null>(
    (ultima, fila) =>
      ultima === null || fila.actualizada_en > ultima ? fila.actualizada_en : ultima,
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      <PestanasPartidos activa="/partidos/clasificacion" />

      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clasificación</h1>
          <p className="text-sm text-muted-foreground">
            Temporada {nombreTemporada(temporada)}
          </p>
        </div>
        <SelectorTemporada temporada={temporada} ruta="/partidos/clasificacion" />
      </div>

      {filas.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay clasificación de esta temporada.
        </p>
      ) : (
        <div className="flex flex-col gap-3 lg:max-w-3xl">
          <TablaLiga filas={filas} />
          {actualizada && (
            <p className="text-xs text-muted-foreground">
              Fuente: Federación Galega de Fútbol. Actualizada el{" "}
              {formatearFecha(actualizada)}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
