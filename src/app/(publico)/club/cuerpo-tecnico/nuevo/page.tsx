import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { cargarCuerpoTecnico } from "../../datos";
import { CARGOS_CUERPO_TECNICO } from "../../miembros/cargos";
import { FormularioMiembro } from "../../miembros/formulario-miembro";
import { crearTecnico } from "../acciones";

export const metadata: Metadata = {
  title: "Añadir al cuerpo técnico",
};

export default async function PaginaNuevoTecnico() {
  await exigirAdministrador();
  const cuerpoTecnico = await cargarCuerpoTecnico();
  // Por defecto, al final de la lista.
  const siguiente = Math.min(
    99,
    Math.max(0, ...cuerpoTecnico.map(({ orden }) => orden)) + 1,
  );

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Añadir al cuerpo técnico
      </h1>
      <FormularioMiembro
        accion={crearTecnico}
        valoresIniciales={{ orden: String(siguiente) }}
        textoBoton="Añadir"
        cargosHabituales={CARGOS_CUERPO_TECNICO}
      />
    </div>
  );
}
