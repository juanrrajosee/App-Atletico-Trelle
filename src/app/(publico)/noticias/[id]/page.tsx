import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FechaNoticia } from "@/components/noticias/lista-noticias";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { estadoNoticia, parrafos, resumenDe } from "@/lib/noticias";
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
    <div className="flex flex-col gap-6">
      <Link
        href="/noticias"
        className="-ml-1 flex w-fit items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Noticias
      </Link>

      <article className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-4 leading-relaxed">
          {parrafos(noticia.cuerpo).map((parrafo, indice) => (
            // Dentro de un párrafo se respetan los saltos de línea.
            <p key={indice} className="whitespace-pre-line">
              {parrafo}
            </p>
          ))}
        </div>
      </article>

      {administrador && estadoNoticia(noticia) !== "publicada" && (
        <p className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Esta noticia todavía no está publicada: solo la ves tú.
        </p>
      )}
    </div>
  );
}
