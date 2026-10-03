import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdministrador } from "@/lib/auth";
import { nombreVisible } from "@/lib/plantilla";
import { actualizarJugador } from "../../acciones";
import { cargarJugador } from "../../datos";
import { FormularioJugador } from "../../formulario-jugador";

export const metadata: Metadata = {
  title: "Editar jugador",
};

export default async function PaginaEditarJugador({
  params,
}: PageProps<"/plantilla/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const jugador = await cargarJugador(true, id);

  if (!jugador?.estado) {
    notFound();
  }

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar a {nombreVisible(jugador)}
      </h1>
      <FormularioJugador
        accion={actualizarJugador.bind(null, jugador.id)}
        valoresIniciales={{
          nombre: jugador.nombre,
          apellidos: jugador.apellidos,
          apodo: jugador.apodo ?? "",
          dorsal: String(jugador.dorsal),
          posicion: jugador.posicion,
          estado: jugador.estado,
        }}
        textoBoton="Guardar cambios"
        hrefCancelar={`/plantilla/${jugador.id}`}
      />
    </div>
  );
}
