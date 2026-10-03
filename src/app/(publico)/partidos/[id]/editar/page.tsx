import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdministrador } from "@/lib/auth";
import { aHoraDeEspana } from "@/lib/fechas";
import { actualizarPartido } from "../../acciones";
import { cargarPartido } from "../../datos";
import { FormularioPartido } from "../../formulario-partido";

export const metadata: Metadata = {
  title: "Editar partido",
};

export default async function PaginaEditarPartido({
  params,
}: PageProps<"/partidos/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const partido = await cargarPartido(id);

  if (!partido) {
    notFound();
  }

  const { fecha, hora } = aHoraDeEspana(partido.fecha_hora);

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar el partido contra {partido.rival}
      </h1>
      <FormularioPartido
        accion={actualizarPartido.bind(null, partido.id)}
        valoresIniciales={{
          rival: partido.rival,
          fecha,
          hora,
          condicion: partido.condicion,
          campo: partido.campo ?? "",
          competicion: partido.competicion ?? "",
          estado: partido.estado,
          goles_favor: partido.goles_favor?.toString() ?? "",
          goles_contra: partido.goles_contra?.toString() ?? "",
        }}
        textoBoton="Guardar cambios"
        hrefCancelar={`/partidos/${partido.id}`}
      />
    </div>
  );
}
