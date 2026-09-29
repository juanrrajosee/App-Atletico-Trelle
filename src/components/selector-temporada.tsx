import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  PRIMERA_TEMPORADA,
  nombreTemporada,
  temporadaActual,
} from "@/lib/temporadas";

/**
 * Flechas para pasar a la temporada anterior o a la siguiente, entre la
 * primera del club y la actual. ruta: la página, sin ?temporada.
 */
export function SelectorTemporada({
  temporada,
  ruta,
}: {
  temporada: number;
  ruta: string;
}) {
  return (
    <nav aria-label="Temporadas" className="flex shrink-0 gap-1">
      <EnlaceTemporada
        ruta={ruta}
        temporada={temporada - 1}
        visible={temporada > PRIMERA_TEMPORADA}
        anterior
      />
      <EnlaceTemporada
        ruta={ruta}
        temporada={temporada + 1}
        visible={temporada < temporadaActual()}
      />
    </nav>
  );
}

function EnlaceTemporada({
  ruta,
  temporada,
  visible,
  anterior = false,
}: {
  ruta: string;
  temporada: number;
  visible: boolean;
  anterior?: boolean;
}) {
  if (!visible) {
    return <span className="size-10" aria-hidden />;
  }
  const Icono = anterior ? ChevronLeft : ChevronRight;
  return (
    <Link
      href={`${ruta}?temporada=${temporada}`}
      aria-label={`Temporada ${nombreTemporada(temporada)}`}
      className="flex size-10 items-center justify-center rounded-md border active:bg-accent"
    >
      <Icono className="size-4" aria-hidden />
    </Link>
  );
}
