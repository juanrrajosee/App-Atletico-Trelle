import { CalendarDays, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exigirAcceso } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/fechas";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export default async function PaginaInicio() {
  const usuario = await exigirAcceso();
  const supabase = await crearClienteServidor();

  const { data: proximoPartido, error } = await supabase
    .from("partidos")
    .select("id, rival, fecha_hora, campo, condicion, competicion")
    .eq("estado", "programado")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el próximo partido: ${error.message}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {usuario.jugador ? `Hola, ${usuario.jugador.nombre}` : "Hola"}
      </h1>

      <section aria-labelledby="titulo-proximo-partido">
        <h2
          id="titulo-proximo-partido"
          className="mb-3 text-sm font-medium text-muted-foreground"
        >
          Próximo partido
        </h2>

        {proximoPartido ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {proximoPartido.condicion === "local"
                  ? `Atlético Trelle – ${proximoPartido.rival}`
                  : `${proximoPartido.rival} – Atlético Trelle`}
              </CardTitle>
              {proximoPartido.competicion && (
                <CardDescription>{proximoPartido.competicion}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                {formatearFechaHora(proximoPartido.fecha_hora)}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" aria-hidden />
                {proximoPartido.campo ??
                  (proximoPartido.condicion === "local" ? "En casa" : "Fuera")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No hay ningún partido programado.
          </p>
        )}
      </section>
    </div>
  );
}
