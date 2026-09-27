import { BotonBorrar } from "@/components/boton-borrar";
import { Button } from "@/components/ui/button";
import type { EstadoJugador } from "@/lib/plantilla";
import { borrarJugador, darDeBaja } from "../acciones";
import { tieneHistorial } from "../datos";

/**
 * Solo para el administrador. Un jugador sin historial se puede borrar; con
 * estadísticas en algún partido se le da de baja, para no perder esos datos.
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
      <BotonBorrar
        accion={borrarJugador.bind(null, jugadorId)}
        texto="Borrar jugador"
        pregunta={`¿Borrar a ${nombre}?`}
        consecuencias="Desaparecerá de la plantilla y no se puede deshacer."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Tiene estadísticas registradas en algún partido, así que no se
        puede borrar
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
