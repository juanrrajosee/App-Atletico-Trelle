import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { formatearFechaHora } from "@/lib/fechas";
import { NOMBRE_CONDICION, type Partido } from "@/lib/partidos";
import { EtiquetaPartido } from "./etiqueta-partido";
import { Marcador } from "./marcador";

/** Un partido destacado (el próximo, el último resultado) que lleva a su ficha. */
export function TarjetaPartido({ partido }: { partido: Partido }) {
  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-5 shadow-sm active:bg-accent"
    >
      {(partido.competicion || partido.estado !== "programado") && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {partido.competicion && <span>{partido.competicion}</span>}
          <EtiquetaPartido partido={partido} />
        </div>
      )}

      <Marcador partido={partido} />

      <div className="flex flex-col gap-2 text-sm">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          {formatearFechaHora(partido.fecha_hora)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {partido.campo ?? NOMBRE_CONDICION[partido.condicion]}
        </p>
      </div>
    </Link>
  );
}
