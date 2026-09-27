import { Badge } from "@/components/ui/badge";
import {
  COLOR_DESENLACE,
  NOMBRE_DESENLACE,
  desenlace,
  type Partido,
} from "@/lib/partidos";
import { cn } from "@/lib/utils";

/**
 * Cómo está el partido de un vistazo: victoria, empate o derrota si se ha
 * jugado; aplazado; o pendiente de resultado si ya ha pasado su hora. Los
 * que están por jugar no llevan etiqueta.
 */
export function EtiquetaPartido({
  partido,
  corta = false,
}: {
  partido: Partido;
  /** Solo la inicial (V, E, D), para las listas. */
  corta?: boolean;
}) {
  const resultado = desenlace(partido);

  if (partido.estado === "jugado" && resultado) {
    const nombre = NOMBRE_DESENLACE[resultado];
    return (
      <Badge
        className={cn(
          "border-transparent",
          corta && "size-7 rounded-full p-0 text-sm",
          COLOR_DESENLACE[resultado],
        )}
      >
        {corta ? (
          <>
            <span aria-hidden>{nombre.charAt(0)}</span>
            <span className="sr-only">{nombre}</span>
          </>
        ) : (
          nombre
        )}
      </Badge>
    );
  }

  if (partido.estado === "aplazado") {
    return (
      <Badge className="border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
        Aplazado
      </Badge>
    );
  }

  if (new Date(partido.fecha_hora) < new Date()) {
    return (
      <Badge className="border-transparent bg-muted text-muted-foreground">
        Sin resultado
      </Badge>
    );
  }

  return null;
}
