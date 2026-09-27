import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListaPartidos } from "@/components/partidos/lista-partidos";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { cargarPartidos } from "./datos";

export const metadata: Metadata = {
  title: "Partidos",
};

export default async function PaginaPartidos() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const partidos = await cargarPartidos();
  const ahora = new Date();

  // Por jugar: los programados que aún no han llegado y los aplazados (a la
  // espera de nueva fecha). El resto, lo más reciente primero: los jugados y
  // los que ya pasaron sin resultado.
  const proximos = partidos.filter(
    (partido) =>
      partido.estado === "aplazado" ||
      (partido.estado === "programado" && new Date(partido.fecha_hora) >= ahora),
  );
  const pasados = partidos
    .filter((partido) => !proximos.includes(partido))
    .reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Partidos</h1>
        {administrador && (
          <Button asChild className="h-11">
            <Link href="/partidos/nuevo">
              <Plus aria-hidden />
              Añadir
            </Link>
          </Button>
        )}
      </div>

      {partidos.length === 0 && (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay partidos en el calendario.
        </p>
      )}

      <ListaPartidos titulo="Próximos" partidos={proximos} />
      <ListaPartidos titulo="Resultados" partidos={pasados} />
    </div>
  );
}
