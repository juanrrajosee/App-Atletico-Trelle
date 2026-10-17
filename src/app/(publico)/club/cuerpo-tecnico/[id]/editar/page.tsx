import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { cargarCuerpoTecnico } from "../../../datos";
import { CARGOS_CUERPO_TECNICO } from "../../../miembros/cargos";
import { FormularioMiembro } from "../../../miembros/formulario-miembro";
import { actualizarTecnico, borrarTecnico } from "../../acciones";

export const metadata: Metadata = {
  title: "Editar el cuerpo técnico",
};

export default async function PaginaEditarTecnico({
  params,
}: PageProps<"/club/cuerpo-tecnico/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const tecnico = (await cargarCuerpoTecnico()).find((fila) => fila.id === id);

  if (!tecnico) {
    notFound();
  }

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar a {tecnico.nombre}
      </h1>
      <FormularioMiembro
        accion={actualizarTecnico.bind(null, tecnico.id)}
        valoresIniciales={{
          nombre: tecnico.nombre,
          cargo: tecnico.cargo,
          orden: String(tecnico.orden),
        }}
        textoBoton="Guardar cambios"
        cargosHabituales={CARGOS_CUERPO_TECNICO}
      />
      <BotonBorrar
        accion={borrarTecnico.bind(null, tecnico.id)}
        texto="Quitar del cuerpo técnico"
        pregunta={`¿Quitar a ${tecnico.nombre} del cuerpo técnico?`}
        consecuencias="Dejará de salir en la página del club. No se puede deshacer."
      />
    </div>
  );
}
