import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirEntrenador } from "@/lib/auth";
import { actualizarJugador } from "../../acciones";
import { cargarFicha } from "../../datos";
import { FormularioJugador } from "../../formulario-jugador";

export const metadata: Metadata = {
  title: "Editar jugador",
};

export default async function PaginaEditarJugador({
  params,
}: PageProps<"/plantilla/[id]/editar">) {
  const { id } = await params;
  const usuario = await exigirEntrenador();
  const jugador = await cargarFicha(usuario, id);

  if (!jugador) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar a {jugador.nombre}
      </h1>
      <FormularioJugador
        accion={actualizarJugador.bind(null, jugador.id)}
        valoresIniciales={{
          nombre: jugador.nombre,
          apellidos: jugador.apellidos,
          dorsal: String(jugador.dorsal),
          posicion: jugador.posicion,
          estado: jugador.estado,
          fecha_nacimiento: jugador.datosPersonales?.fechaNacimiento ?? "",
          telefono: jugador.datosPersonales?.telefono ?? "",
        }}
        textoBoton="Guardar cambios"
        hrefCancelar={`/plantilla/${jugador.id}`}
      />
    </div>
  );
}
