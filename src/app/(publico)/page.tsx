import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Escudo } from "@/components/escudo";
import { ListaNoticias } from "@/components/noticias/lista-noticias";
import { Racha } from "@/components/partidos/racha";
import { TarjetaPartido } from "@/components/partidos/tarjeta-partido";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { formatearCuantoFalta } from "@/lib/fechas";
import { temporadaActual } from "@/lib/temporadas";
import { cn } from "@/lib/utils";
import { ultimosResultados } from "./estadisticas/datos";
import { cargarNoticias } from "./noticias/datos";
import {
  cargarPartidos,
  cargarProximoPartido,
  cargarUltimoResultado,
} from "./partidos/datos";
import { cargarVotacionesAbiertas } from "./votaciones/datos";

const TITULO_SECCION = "text-2xl font-bold tracking-tight";

export default async function PaginaInicio({ searchParams }: PageProps<"/">) {
  // Al borrar la cuenta se vuelve aquí con ?cuenta=borrada.
  const cuentaBorrada = (await searchParams).cuenta === "borrada";

  const [proximoPartido, ultimoResultado, votacionesAbiertas, noticias, partidos] =
    await Promise.all([
      cargarProximoPartido(),
      cargarUltimoResultado(),
      cargarVotacionesAbiertas(),
      // Solo las publicadas, también para el administrador.
      cargarNoticias(false, 3),
      cargarPartidos(),
    ]);
  const racha = ultimosResultados(partidos, temporadaActual());

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

      {/* En el ordenador, los partidos a un lado y las noticias al otro. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-8">
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
              {/* Con un solo partido, la racha repetiría el último resultado. */}
              {racha.length > 1 && (
                <div className="mt-3">
                  <Racha partidos={racha} />
                </div>
              )}
            </section>
          )}

          <Link
            href="/partidos"
            className="-mt-4 flex h-11 items-center justify-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Todos los partidos
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

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
    </div>
  );
}

/**
 * La portada del inicio: un bloque verde bosque con el nombre del club como
 * titular, muy grueso y en lima, el escudo y el botón para ver los partidos.
 * En el móvil va de lado a lado, pegada a la barra de arriba.
 */
function Portada() {
  return (
    <section className="fondo-portada -mx-4 -mt-6 flex flex-col gap-8 px-5 pt-10 pb-10 lg:mx-0 lg:mt-0 lg:flex-row lg:items-end lg:justify-between lg:rounded-2xl lg:px-12 lg:py-16">
      <div className="flex flex-col gap-5">
        <h1 className="titular text-[clamp(3.5rem,17vw,6.5rem)] text-titulo">
          Atlético
          <br />
          Trelle
        </h1>
        <p className="text-lg text-white/80">#FamiliaRoxibranca</p>
        <Button asChild className="h-11 w-fit px-6 text-base">
          <Link href="/partidos">Ver partidos</Link>
        </Button>
      </div>
      <Escudo tamano={120} decorativo inmediato className="self-start lg:self-end" />
    </section>
  );
}
