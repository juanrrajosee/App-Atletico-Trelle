import Image from "next/image";
import { urlFotoJugador } from "@/lib/plantilla";
import { cn } from "@/lib/utils";

/**
 * La foto de un jugador, recortada para llenar su hueco y sin cortarle la
 * cara (se centra arriba). Las fotos ya se reducen al subirlas, así que se
 * sirven tal cual.
 */
export function FotoJugador({
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
        src={urlFotoJugador(ruta)}
        // Va junto a su nombre, que ya dice quién es: no hace falta leerla.
        alt=""
        fill
        sizes={tamanos}
        loading={inmediata ? "eager" : undefined}
        unoptimized
        className="object-cover object-top"
      />
    </div>
  );
}
