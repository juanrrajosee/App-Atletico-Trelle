import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { crearProducto } from "../acciones";
import { cargarProductos } from "../datos";
import { FormularioProducto } from "../formulario-producto";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default async function PaginaNuevoProducto() {
  await exigirAdministrador();
  const productos = await cargarProductos(true);
  // Por defecto, al final de la tienda.
  const siguiente = Math.min(
    999,
    Math.max(0, ...productos.map(({ orden }) => orden)) + 1,
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <FormularioProducto
        accion={crearProducto}
        valoresIniciales={{ orden: String(siguiente), visible: "si" }}
        textoBoton="Añadir a la tienda"
        hrefCancelar="/tienda"
      />
    </div>
  );
}
