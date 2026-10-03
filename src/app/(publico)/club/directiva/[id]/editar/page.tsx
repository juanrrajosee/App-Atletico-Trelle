import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { cargarDirectiva } from "../../../datos";
import { actualizarMiembro, borrarMiembro } from "../../acciones";
import { FormularioMiembro } from "../../formulario-miembro";

export const metadata: Metadata = {
  title: "Editar la directiva",
};

export default async function PaginaEditarMiembro({
  params,
}: PageProps<"/club/directiva/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const miembro = (await cargarDirectiva()).find((fila) => fila.id === id);

  if (!miembro) {
    notFound();
  }

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar a {miembro.nombre}
      </h1>
      <FormularioMiembro
        accion={actualizarMiembro.bind(null, miembro.id)}
        valoresIniciales={{
          nombre: miembro.nombre,
          cargo: miembro.cargo,
          orden: String(miembro.orden),
        }}
        textoBoton="Guardar cambios"
      />
      <BotonBorrar
        accion={borrarMiembro.bind(null, miembro.id)}
        texto="Quitar de la directiva"
        pregunta={`¿Quitar a ${miembro.nombre} de la directiva?`}
        consecuencias="Dejará de salir en la página del club. No se puede deshacer."
      />
    </div>
  );
}
