import { ChevronLeft, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Texto } from "@/components/texto";
import { FotoProducto } from "@/components/tienda/foto-producto";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import {
  enlaceTelefono,
  enlaceWhatsApp,
  formatearPrecio,
  mensajePresupuesto,
  urlFoto,
} from "@/lib/tienda";
import { cargarClub } from "../../club/datos";
import { cargarProducto } from "../datos";

export async function generateMetadata({
  params,
}: PageProps<"/tienda/[id]">): Promise<Metadata> {
  const producto = await cargarProducto((await params).id);
  if (!producto) {
    return { title: "Tienda" };
  }
  // Lo que se ve al compartir el enlace (en WhatsApp, por ejemplo).
  return {
    title: producto.nombre,
    description: producto.descripcion ?? undefined,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion ?? undefined,
      siteName: "Atlético Trelle",
      locale: "es_ES",
      images: producto.foto ? [urlFoto(producto.foto)] : undefined,
    },
  };
}

export default async function PaginaProducto({
  params,
}: PageProps<"/tienda/[id]">) {
  const { id } = await params;
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const [producto, club] = await Promise.all([cargarProducto(id), cargarClub()]);

  if (!producto) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/tienda"
        className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Tienda
      </Link>

      <FotoProducto
        producto={producto}
        tamanos="(min-width: 42rem) 40rem, 100vw"
        className="rounded-xl"
        prioridad
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {producto.nombre}
        </h1>
        {producto.precio_orientativo !== null && (
          <p className="text-muted-foreground">
            Precio orientativo:{" "}
            <span className="font-medium text-foreground">
              {formatearPrecio(producto.precio_orientativo)}
            </span>
          </p>
        )}
      </div>

      {producto.descripcion && <Texto texto={producto.descripcion} />}

      <section
        aria-labelledby="titulo-presupuesto"
        className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-4"
      >
        <h2 id="titulo-presupuesto" className="font-medium">
          Pedir presupuesto
        </h2>
        {club.telefono ? (
          <>
            <Button asChild className="h-11">
              <a href={enlaceWhatsApp(club.telefono, mensajePresupuesto(producto))} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                Por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <a href={enlaceTelefono(club.telefono)}>
                <Phone aria-hidden />
                Llamar al {club.telefono}
              </a>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {administrador
              ? "Para que aquí salgan los botones de llamar y de WhatsApp, pon el teléfono del club en Club → Editar historia y contacto."
              : "Pregunta por este producto al club."}
          </p>
        )}
      </section>
    </div>
  );
}
