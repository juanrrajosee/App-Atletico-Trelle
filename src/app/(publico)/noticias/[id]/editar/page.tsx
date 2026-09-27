import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdministrador } from "@/lib/auth";
import { actualizarNoticia } from "../../acciones";
import { cargarNoticia } from "../../datos";
import { FormularioNoticia } from "../../formulario-noticia";

export const metadata: Metadata = {
  title: "Editar noticia",
};

export default async function PaginaEditarNoticia({
  params,
}: PageProps<"/noticias/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const noticia = await cargarNoticia(id);

  if (!noticia) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar noticia</h1>
      <FormularioNoticia
        accion={actualizarNoticia.bind(null, noticia.id)}
        valoresIniciales={{
          titulo: noticia.titulo,
          resumen: noticia.resumen ?? "",
          cuerpo: noticia.cuerpo,
          estado: noticia.publicada_en ? "publicada" : "borrador",
        }}
        textoBoton="Guardar cambios"
        hrefCancelar={`/noticias/${noticia.id}`}
      />
    </div>
  );
}
