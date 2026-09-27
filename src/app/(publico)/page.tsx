import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { TarjetaPartido } from "@/components/partidos/tarjeta-partido";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { cargarProximoPartido, cargarUltimoResultado } from "./partidos/datos";
import { cargarVotacionesAbiertas } from "./votaciones/datos";

export default async function PaginaInicio() {
  const [proximoPartido, ultimoResultado, votacionesAbiertas] =
    await Promise.all([
      cargarProximoPartido(),
      cargarUltimoResultado(),
      cargarVotacionesAbiertas(),
    ]);

  return (
    <div className="flex flex-col gap-8">
      {votacionesAbiertas.map((partido) => (
        <AvisoVotacion key={partido.id} partido={partido} />
      ))}

      <section aria-labelledby="titulo-proximo-partido">
        <h1
          id="titulo-proximo-partido"
          className="mb-4 text-2xl font-semibold tracking-tight"
        >
          Próximo partido
        </h1>

        {proximoPartido ? (
          <TarjetaPartido partido={proximoPartido} />
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No hay ningún partido programado.
          </p>
        )}
      </section>

      {ultimoResultado && (
        <section aria-labelledby="titulo-ultimo-resultado">
          <h2
            id="titulo-ultimo-resultado"
            className="mb-4 text-xl font-semibold tracking-tight"
          >
            Último resultado
          </h2>
          <TarjetaPartido partido={ultimoResultado} />
        </section>
      )}

      <Link
        href="/partidos"
        className="flex h-11 items-center justify-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        Todos los partidos
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
