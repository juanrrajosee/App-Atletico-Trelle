import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { crearNoticia } from "../acciones";
import { FormularioNoticia } from "../formulario-noticia";

export const metadata: Metadata = {
  title: "Nueva noticia",
};

export default async function PaginaNuevaNoticia() {
  await exigirAdministrador();

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva noticia</h1>
      <FormularioNoticia
        accion={crearNoticia}
        valoresIniciales={{ estado: "borrador" }}
        textoBoton="Guardar noticia"
        hrefCancelar="/noticias"
      />
    </div>
  );
}
