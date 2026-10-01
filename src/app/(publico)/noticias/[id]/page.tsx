import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/boton-borrar";
import { FotoNoticia } from "@/components/noticias/foto-noticia";
import { FechaNoticia } from "@/components/noticias/lista-noticias";
import { Texto } from "@/components/texto";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { estadoNoticia, resumenDe, urlFotoNoticia } from "@/lib/noticias";
import { borrarNoticia } from "../acciones";
import { cargarNoticia } from "../datos";

export async function generateMetadata({
  params,
}: PageProps<"/noticias/[id]">): Promise<Metadata> {
  const noticia = await cargarNoticia((await params).id);
  if (!noticia) {
    return { title: "Noticia" };
  }
  // Lo que se ve al compartir el enlace (en WhatsApp, por ejemplo).
  const descripcion = resumenDe(noticia);
  return {
    title: noticia.titulo,
    description: descripcion,
    openGraph: {
      title: noticia.titulo,
      description: descripcion,
      type: "article",
      siteName: "Atlético Trelle",
      locale: "es_ES",
      publishedTime: noticia.publicada_en ?? undefined,
      modifiedTime: noticia.actualizado_en,
      images: noticia.foto ? [urlFotoNoticia(noticia.foto)] : undefined,
    },
  };
}

export default async function PaginaNoticia({
  params,
}: PageProps<"/noticias/[id]">) {
  const { id } = await params;
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const noticia = await cargarNoticia(id);

  if (!noticia) {
    notFound();
  }

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <Link
        href="/noticias"
        className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Noticias
      </Link>

      <article className="flex flex-col gap-4">
        {noticia.foto && (
          <FotoNoticia
            ruta={noticia.foto}
            tamanos="(min-width: 672px) 640px, 100vw"
            className="aspect-video rounded-xl"
            inmediata
          />
        )}
        <header className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FechaNoticia noticia={noticia} />
          </p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-balance">
            {noticia.titulo}
          </h1>
          {noticia.resumen && (
            <p className="text-lg text-muted-foreground">{noticia.resumen}</p>
          )}
        </header>

        <Texto texto={noticia.cuerpo} />
      </article>

      {administrador && (
        <div className="flex flex-col gap-3">
          {estadoNoticia(noticia) !== "publicada" && (
            <p className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
              Esta noticia todavía no está publicada: solo la ves tú.
            </p>
          )}
          <Button asChild variant="outline" className="h-11">
            <Link href={`/noticias/${noticia.id}/editar`}>
              <Pencil aria-hidden />
              Editar noticia
            </Link>
          </Button>
          <BotonBorrar
            accion={borrarNoticia.bind(null, noticia.id)}
            texto="Borrar noticia"
            pregunta="¿Borrar esta noticia?"
            consecuencias="Desaparecerá de la aplicación y no se puede deshacer."
          />
        </div>
      )}
    </div>
  );
}
