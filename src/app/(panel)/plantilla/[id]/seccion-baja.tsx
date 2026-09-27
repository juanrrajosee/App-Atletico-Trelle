import { Button } from "@/components/ui/button";
import type { EstadoJugador } from "@/lib/plantilla";
import { borrarJugador, darDeBaja } from "../acciones";
import { tieneHistorial } from "../datos";
import { BotonBorrar } from "./boton-borrar";

/**
 * Solo para el entrenador. Un jugador sin historial se puede borrar; con
 * historial (convocatorias, asistencia o estadísticas) se le da de baja, para
 * no perder esos datos.
 */
export async function SeccionBaja({
  jugadorId,
  nombre,
  estado,
}: {
  jugadorId: string;
  nombre: string;
  estado: EstadoJugador;
}) {
  if (!(await tieneHistorial(jugadorId))) {
    return (
      <BotonBorrar accion={borrarJugador.bind(null, jugadorId)} nombre={nombre} />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Tiene historial en el equipo (convocatorias, asistencia o
        estadísticas), así que no se puede borrar
        {estado === "baja" ? ". Ya está de baja." : ": puedes darle de baja."}
      </p>
      {estado !== "baja" && (
        <form action={darDeBaja.bind(null, jugadorId)}>
          <Button type="submit" variant="outline" className="h-11 w-full">
            Dar de baja
          </Button>
        </form>
      )}
    </div>
  );
}
