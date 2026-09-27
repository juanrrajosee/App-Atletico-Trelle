import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { urlFoto } from "@/lib/tienda";
import { actualizarProducto, borrarProducto } from "../../acciones";
import { cargarProducto } from "../../datos";
import { FormularioProducto } from "../../formulario-producto";

export const metadata: Metadata = {
  title: "Editar producto",
};

export default async function PaginaEditarProducto({
  params,
}: PageProps<"/tienda/[id]/editar">) {
  const { id } = await params;
  await exigirAdministrador();
  const producto = await cargarProducto(id);

  if (!producto) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar {producto.nombre}
      </h1>
      <FormularioProducto
        accion={actualizarProducto.bind(null, producto.id)}
        valoresIniciales={{
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          precio:
            producto.precio_orientativo === null
              ? ""
              : String(producto.precio_orientativo).replace(".", ","),
          orden: String(producto.orden),
          visible: producto.visible ? "si" : "no",
        }}
        fotoActual={producto.foto ? urlFoto(producto.foto) : null}
        textoBoton="Guardar cambios"
        hrefCancelar={`/tienda/${producto.id}`}
      />
      <BotonBorrar
        accion={borrarProducto.bind(null, producto.id)}
        texto="Borrar producto"
        pregunta={`¿Borrar ${producto.nombre}?`}
        consecuencias="Desaparecerá de la tienda junto con su foto. No se puede deshacer. Si solo está agotado, puedes ocultarlo."
      />
    </div>
  );
}
