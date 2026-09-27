import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { desvincularCuenta, vincularCuenta } from "../acciones";
import { cargarCuentas } from "../datos";
import { FormularioVincular } from "./formulario-vincular";

/**
 * Solo para el entrenador: qué cuenta de la aplicación usa este jugador.
 * Hasta que no se vincula, el jugador solo ve la pantalla de "cuenta
 * pendiente".
 */
export async function SeccionCuenta({
  jugadorId,
  perfilId,
}: {
  jugadorId: string;
  perfilId: string | null;
}) {
  const cuentas = await cargarCuentas();
  const vinculada = cuentas.find((cuenta) => cuenta.perfilId === perfilId);
  const libres = cuentas.filter((cuenta) => cuenta.jugadorId === null);

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle>Cuenta de la aplicación</CardTitle>
        <CardDescription>
          {vinculada
            ? "El jugador entra con esta cuenta."
            : "Sin cuenta, el jugador no puede entrar a ver el equipo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {vinculada ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium break-all">{vinculada.email}</p>
            <form action={desvincularCuenta.bind(null, jugadorId)}>
              <Button type="submit" variant="outline" className="h-11 w-full">
                Desvincular
              </Button>
            </form>
          </div>
        ) : libres.length > 0 ? (
          <FormularioVincular
            accion={vincularCuenta.bind(null, jugadorId)}
            cuentasLibres={libres}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay cuentas libres. Crea la cuenta en el panel de Supabase
            (Authentication → Add user) y vuelve aquí para vincularla.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
