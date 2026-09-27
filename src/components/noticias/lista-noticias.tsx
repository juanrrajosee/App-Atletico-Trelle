import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatearFecha, formatearFechaHora } from "@/lib/fechas";
import { estadoNoticia, resumenDe, type Noticia } from "@/lib/noticias";

/** Lista de noticias: fecha, título y resumen, y cada una lleva a la suya. */
export function ListaNoticias({ noticias }: { noticias: Noticia[] }) {
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {noticias.map((noticia) => (
        <li key={noticia.id}>
          <Link
            href={`/noticias/${noticia.id}`}
            className="flex items-center gap-3 px-4 py-3 active:bg-accent"
          >
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
