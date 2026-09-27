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
          "text-center font-semibold whitespace-nowrap tabular-nums",
          grande ? "text-4xl" : "text-2xl",
          partido.estado !== "jugado" && "text-base text-muted-foreground",
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

function NombreEquipo({ equipo, grande }: { equipo: Equipo; grande: boolean }) {
  return (
    <p
      className={cn(
        "text-center leading-tight text-balance",
        grande ? "text-lg" : "text-base",
        equipo.esTrelle ? "font-semibold" : "text-muted-foreground",
      )}
    >
      {equipo.nombre}
    </p>
  );
}
