import Image from "next/image";
import escudo from "@/assets/escudo.png";
import { cn } from "@/lib/utils";

/**
 * El escudo del club. La imagen original es pequeña (150 px), así que no
 * conviene enseñarlo mucho más grande que eso.
 */
export function Escudo({
  tamano,
  className,
  inmediato = false,
  decorativo = false,
}: {
  /** Ancho y alto en píxeles. */
  tamano: number;
  className?: string;
  /** Para el que se ve nada más abrir la página (el de la cabecera). */
  inmediato?: boolean;
  /** Si va junto al nombre del club, no hace falta que lo lea un lector de pantalla. */
  decorativo?: boolean;
}) {
  return (
    <Image
      src={escudo}
      alt={decorativo ? "" : "Escudo del Atlético Trelle"}
      width={tamano}
      height={tamano}
      loading={inmediato ? "eager" : undefined}
      className={cn("shrink-0", className)}
    />
  );
}
