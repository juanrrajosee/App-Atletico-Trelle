import Image from "next/image";
import { urlFotoNoticia } from "@/lib/noticias";
import { cn } from "@/lib/utils";

/**
 * La foto de portada de una noticia, recortada para llenar su hueco. Las
 * fotos ya se reducen al subirlas, así que se sirven tal cual.
 */
export function FotoNoticia({
  ruta,
  tamanos,
  className,
  inmediata = false,
}: {
  ruta: string;
  /** El atributo sizes: qué ancho ocupa la foto en la pantalla. */
  tamanos: string;
  className?: string;
  /** Para la que se ve nada más abrir la página. */
  inmediata?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={urlFotoNoticia(ruta)}
        // Acompaña al título, que ya dice de qué va: no hace falta leerla.
        alt=""
        fill
        sizes={tamanos}
        loading={inmediata ? "eager" : undefined}
        unoptimized
        className="object-cover"
      />
    </div>
  );
}
