import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ListaNoticias } from "@/components/noticias/lista-noticias";
import { TarjetaPartido } from "@/components/partidos/tarjeta-partido";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { cargarNoticias } from "./noticias/datos";
import { cargarProximoPartido, cargarUltimoResultado } from "./partidos/datos";
import { cargarVotacionesAbiertas } from "./votaciones/datos";

export default async function PaginaInicio({ searchParams }: PageProps<"/">) {
  // Al borrar la cuenta se vuelve aquí con ?cuenta=borrada.
  const cuentaBorrada = (await searchParams).cuenta === "borrada";

  const [proximoPartido, ultimoResultado, votacionesAbiertas, noticias] =
    await Promise.all([
      cargarProximoPartido(),
      cargarUltimoResultado(),
      cargarVotacionesAbiertas(),
      // Solo las publicadas, también para el administrador.
      cargarNoticias(false, 3),
    ]);

  return (
    <div className="flex flex-col gap-8">
      {cuentaBorrada && (
        <p
          role="status"
          className="rounded-lg border px-4 py-3 text-sm text-muted-foreground"
        >
          Tu cuenta se ha borrado. Gracias por haber participado.
        </p>
      )}

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
        className="-mt-4 flex h-11 items-center justify-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        Todos los partidos
        <ChevronRight className="size-4" aria-hidden />
      </Link>

      {noticias.length > 0 && (
        <section aria-labelledby="titulo-noticias">
          <h2
            id="titulo-noticias"
            className="mb-4 text-xl font-semibold tracking-tight"
          >
            Últimas noticias
          </h2>
          <ListaNoticias noticias={noticias} />
          <Link
            href="/noticias"
            className="mt-2 flex h-11 items-center justify-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Todas las noticias
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </section>
      )}
    </div>
  );
}
