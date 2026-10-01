import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { cargarDirectiva } from "../../datos";
import { crearMiembro } from "../acciones";
import { FormularioMiembro } from "../formulario-miembro";

export const metadata: Metadata = {
  title: "Añadir a la directiva",
};

export default async function PaginaNuevoMiembro() {
  await exigirAdministrador();
  const directiva = await cargarDirectiva();
  // Por defecto, al final de la lista.
  const siguiente = Math.min(
    99,
    Math.max(0, ...directiva.map(({ orden }) => orden)) + 1,
  );

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Añadir a la directiva
      </h1>
      <FormularioMiembro
        accion={crearMiembro}
        valoresIniciales={{ orden: String(siguiente) }}
        textoBoton="Añadir"
      />
    </div>
  );
}
