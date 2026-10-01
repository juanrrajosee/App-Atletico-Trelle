import { Shield } from "lucide-react";
import { Escudo } from "@/components/escudo";
import { formatearHora } from "@/lib/fechas";
import { equipos, type Equipo, type Partido } from "@/lib/partidos";
import { cn } from "@/lib/utils";

/**
 * Los dos equipos, con el de casa a la izquierda, y en medio el resultado
 * (si se ha jugado), la hora (si está programado) o una raya (aplazado).
 */
export function Marcador({
  partido,
  grande = false,
}: {
  partido: Partido;
  grande?: boolean;
}) {
  const [local, visitante] = equipos(partido);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <NombreEquipo equipo={local} grande={grande} />
      <p
        className={cn(
          "text-center font-display font-semibold whitespace-nowrap tabular-nums",
          grande ? "text-5xl" : "text-4xl",
          partido.estado !== "jugado" && "text-2xl text-muted-foreground",
        )}
      >
        {partido.estado === "jugado" ? (
          <>
            {local.goles}
            <span className="px-1.5 text-muted-foreground" aria-hidden>
              –
            </span>
            <span className="sr-only"> a </span>
            {visitante.goles}
          </>
        ) : partido.estado === "programado" ? (
          formatearHora(partido.fecha_hora)
        ) : (
          "–"
        )}
      </p>
      <NombreEquipo equipo={visitante} grande={grande} />
    </div>
  );
}

/**
 * El escudo y el nombre de un equipo. Del rival no hay escudo: se pone uno
 * genérico del mismo tamaño para que los dos lados queden iguales.
 */
function NombreEquipo({ equipo, grande }: { equipo: Equipo; grande: boolean }) {
  const tamano = grande ? 64 : 48;
  return (
    <div className="flex flex-col items-center gap-2">
      {equipo.esTrelle ? (
        <Escudo tamano={tamano} decorativo />
      ) : (
        <span
          className="flex items-center justify-center rounded-full bg-muted text-muted-foreground"
          style={{ width: tamano, height: tamano }}
          aria-hidden
        >
          <Shield className="size-1/2" />
        </span>
      )}
      <p
        className={cn(
          "text-center leading-tight text-balance",
          grande ? "text-lg" : "text-base",
          equipo.esTrelle ? "font-semibold" : "text-muted-foreground",
        )}
      >
        {equipo.nombre}
      </p>
    </div>
  );
}
