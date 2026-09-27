import { ChevronRight, Vote } from "lucide-react";
import Link from "next/link";
import { titulo, type Partido } from "@/lib/partidos";

/** Aviso de una votación abierta, que lleva al partido para votar. */
export function AvisoVotacion({ partido }: { partido: Partido }) {
  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="flex items-center gap-3 rounded-xl border border-primary bg-card px-4 py-3 shadow-sm active:bg-accent"
    >
      <Vote className="size-6 shrink-0" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">¡Votación abierta!</span>
        <span className="text-sm text-muted-foreground">
          {titulo(partido)}: vota al MVP, al mejor suplente y al de más
          compromiso hasta las 23:59.
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}
