import type { Metadata } from "next";
import { exigirEntrenador } from "@/lib/auth";
import { crearJugador } from "../acciones";
import { FormularioJugador } from "../formulario-jugador";

export const metadata: Metadata = {
  title: "Nuevo jugador",
};

export default async function PaginaNuevoJugador() {
  await exigirEntrenador();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo jugador</h1>
      <FormularioJugador
        accion={crearJugador}
        valoresIniciales={{ estado: "disponible" }}
        textoBoton="Añadir a la plantilla"
        hrefCancelar="/plantilla"
      />
    </div>
  );
}
