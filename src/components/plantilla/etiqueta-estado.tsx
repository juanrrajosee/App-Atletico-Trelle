import { Badge } from "@/components/ui/badge";
import { COLOR_ESTADO, NOMBRE_ESTADO, type EstadoJugador } from "@/lib/plantilla";
import { cn } from "@/lib/utils";

export function EtiquetaEstado({ estado }: { estado: EstadoJugador }) {
  return (
    <Badge className={cn("border-transparent", COLOR_ESTADO[estado])}>
      {NOMBRE_ESTADO[estado]}
    </Badge>
  );
}
