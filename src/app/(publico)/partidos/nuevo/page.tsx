import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { crearPartido } from "../acciones";
import { FormularioPartido } from "../formulario-partido";

export const metadata: Metadata = {
  title: "Nuevo partido",
};

export default async function PaginaNuevoPartido() {
  await exigirAdministrador();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo partido</h1>
      <FormularioPartido
        accion={crearPartido}
        valoresIniciales={{ estado: "programado" }}
        textoBoton="Añadir al calendario"
        hrefCancelar="/partidos"
      />
    </div>
  );
}
