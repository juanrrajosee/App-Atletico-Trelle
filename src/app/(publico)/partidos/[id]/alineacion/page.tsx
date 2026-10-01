import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { exigirAdministrador } from "@/lib/auth";
import { equipos, titulo } from "@/lib/partidos";
import { cargarEditorAlineacion, cargarPartido } from "../../datos";
import { guardarAlineacion } from "./acciones";
import { EditorAlineacion } from "./editor-alineacion";

export const metadata: Metadata = {
  title: "Alineación",
};

export default async function PaginaAlineacion({
  params,
}: PageProps<"/partidos/[id]/alineacion">) {
  const { id } = await params;
  await exigirAdministrador();
  const partido = await cargarPartido(id);

  if (!partido) {
    notFound();
  }

  const volver = (
    <Link
      href={`/partidos/${partido.id}`}
      className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
    >
      <ChevronLeft className="size-4" aria-hidden />
      Partido
    </Link>
  );

  // La base de datos solo guarda alineaciones de partidos jugados.
  if (partido.estado !== "jugado" || partido.goles_favor === null) {
    return (
      <div className="flex flex-col gap-6">
        {volver}
        <h1 className="text-2xl font-semibold tracking-tight">Alineación</h1>
        <p className="text-sm text-muted-foreground">
          La alineación se registra cuando el partido ya se ha jugado. Pon
          antes el resultado.
        </p>
        <Button asChild className="h-11">
          <Link href={`/partidos/${partido.id}/editar`}>Poner el resultado</Link>
        </Button>
      </div>
    );
  }

  const { jugadores, filas } = await cargarEditorAlineacion(partido.id);
  const [local, visitante] = equipos(partido);

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      {volver}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alineación</h1>
        <p className="text-sm text-muted-foreground">
          {titulo(partido)}: {local.goles}–{visitante.goles}
        </p>
      </div>
      <EditorAlineacion
        accion={guardarAlineacion.bind(null, partido.id)}
        jugadores={jugadores}
        filasGuardadas={filas}
        golesEquipo={partido.goles_favor}
        hrefCancelar={`/partidos/${partido.id}`}
      />
    </div>
  );
}
