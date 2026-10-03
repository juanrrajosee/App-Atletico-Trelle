import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatearFecha, formatearFechaHora } from "@/lib/fechas";
import { estadoNoticia, resumenDe, type Noticia } from "@/lib/noticias";
import { FotoNoticia } from "./foto-noticia";

/**
 * Lista de noticias: fecha, título, resumen y, si tiene, una miniatura de
 * la foto. Cada una lleva a la suya.
 */
export function ListaNoticias({ noticias }: { noticias: Noticia[] }) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {noticias.map((noticia) => (
        <li key={noticia.id}>
          <Link
            href={`/noticias/${noticia.id}`}
            className="flex items-center gap-3 px-4 py-3 active:bg-accent"
          >
            {noticia.foto && (
              <FotoNoticia
                ruta={noticia.foto}
                tamanos="80px"
                className="size-20 shrink-0 rounded-lg"
              />
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <FechaNoticia noticia={noticia} />
              </span>
              <span className="font-medium leading-snug">{noticia.titulo}</span>
              <span className="line-clamp-2 text-sm text-muted-foreground">
                {resumenDe(noticia)}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * La noticia más reciente, en grande y con los colores del club, encima de
 * la lista. Si tiene foto, va arriba.
 */
export function NoticiaDestacada({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticias/${noticia.id}`}
      className="flex flex-col overflow-hidden rounded-2xl fondo-camiseta text-white shadow-sm active:opacity-90"
    >
      {noticia.foto && (
        <FotoNoticia
          ruta={noticia.foto}
          tamanos="(min-width: 672px) 640px, 100vw"
          className="aspect-video"
          inmediata
        />
      )}
      <span className="flex flex-col gap-2 px-5 py-5">
        <span className="text-xs tracking-[0.2em] text-white/80 uppercase">
          Lo último · <FechaNoticia noticia={noticia} />
        </span>
        <span className="font-display text-2xl leading-tight font-semibold">
          {noticia.titulo}
        </span>
        <span className="line-clamp-3 text-sm text-white/90">
          {resumenDe(noticia)}
        </span>
        <span className="mt-1 flex items-center gap-1 text-sm font-medium">
          Leer la noticia
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

/**
 * La fecha de publicación o, para el administrador, si es un borrador o
 * está programada.
 */
export function FechaNoticia({ noticia }: { noticia: Noticia }) {
  const estado = estadoNoticia(noticia);

  if (estado === "borrador") {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        Borrador
      </Badge>
    );
  }
  if (estado === "programada" && noticia.publicada_en) {
    return (
      <>
        <Badge className="border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          Programada
        </Badge>
        {formatearFechaHora(noticia.publicada_en)}
      </>
    );
  }
  return noticia.publicada_en ? <>{formatearFecha(noticia.publicada_en)}</> : null;
}
