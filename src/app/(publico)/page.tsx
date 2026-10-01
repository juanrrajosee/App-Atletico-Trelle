import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Escudo } from "@/components/escudo";
import { ListaNoticias } from "@/components/noticias/lista-noticias";
import { TarjetaPartido } from "@/components/partidos/tarjeta-partido";
import { Badge } from "@/components/ui/badge";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { formatearCuantoFalta } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import { cargarNoticias } from "./noticias/datos";
import { cargarProximoPartido, cargarUltimoResultado } from "./partidos/datos";
import { cargarVotacionesAbiertas } from "./votaciones/datos";

const TITULO_SECCION =
  "font-display text-xl font-semibold tracking-wide uppercase";

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

  const cuantoFalta =
    proximoPartido && formatearCuantoFalta(proximoPartido.fecha_hora);

  return (
    <div className="flex flex-col gap-8">
      <Portada />

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="titulo-proximo-partido" className={TITULO_SECCION}>
            Próximo partido
          </h2>
          {cuantoFalta && (
            <Badge className="border-transparent bg-primary text-primary-foreground">
              {cuantoFalta}
            </Badge>
          )}
        </div>

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
          <h2 id="titulo-ultimo-resultado" className={cn(TITULO_SECCION, "mb-4")}>
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
          <h2 id="titulo-noticias" className={cn(TITULO_SECCION, "mb-4")}>
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

/**
 * La cabecera del inicio: el escudo sobre los dos granates de la camiseta,
 * pegada a la barra de arriba.
 */
function Portada() {
  return (
    <section className="-mx-4 -mt-6 flex flex-col items-center gap-3 bg-[linear-gradient(110deg,var(--club-granate)_55%,#801b29_55%)] px-4 pt-6 pb-8 text-center text-white sm:rounded-b-2xl">
      <Escudo tamano={104} decorativo inmediato className="drop-shadow-lg" />
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-wide uppercase">
          Atlético Trelle
        </h1>
        <p className="mt-1 text-sm text-white/80">#FamiliaRoxibranca</p>
      </div>
    </section>
  );
}
