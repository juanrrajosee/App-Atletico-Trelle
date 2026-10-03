import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PestanasClub } from "@/components/pestanas";
import { FotoProducto } from "@/components/tienda/foto-producto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { formatearPrecio } from "@/lib/tienda";
import { cargarProductos } from "./datos";

export const metadata: Metadata = {
  title: "Tienda",
};

export default async function PaginaTienda() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const productos = await cargarProductos(administrador);

  return (
    <div className="flex flex-col gap-6">
      <PestanasClub activa="/tienda" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tienda</h1>
          <p className="text-sm text-muted-foreground">
            No se compra en la aplicación: pide presupuesto al club por
            teléfono o por WhatsApp.
          </p>
        </div>
        {administrador && (
          <Button asChild className="h-11">
            <Link href="/tienda/nuevo">
              <Plus aria-hidden />
              Añadir
            </Link>
          </Button>
        )}
      </div>

      {productos.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay productos en la tienda.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {productos.map((producto) => (
            <li key={producto.id}>
              <Link
                href={`/tienda/${producto.id}`}
                className="flex h-full flex-col gap-2 rounded-xl border bg-card p-2 active:bg-accent"
              >
                <FotoProducto
                  producto={producto}
                  tamanos="(min-width: 64rem) 15rem, (min-width: 42rem) 20rem, 50vw"
                />
                <span className="flex flex-col gap-1 px-1 pb-1">
                  {!producto.visible && (
                    <Badge className="border-transparent bg-muted text-muted-foreground">
                      Oculto
                    </Badge>
                  )}
                  <span className="text-sm font-medium leading-snug">
                    {producto.nombre}
                  </span>
                  {producto.precio_orientativo !== null && (
                    <span className="text-sm text-muted-foreground">
                      {formatearPrecio(producto.precio_orientativo)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
