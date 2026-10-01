import { cn } from "@/lib/utils";

/** El dorsal de un jugador, como el número de la camiseta. */
export function Dorsal({
  numero,
  className,
}: {
  numero: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-lg font-semibold text-primary-foreground tabular-nums",
        className,
      )}
    >
      {numero}
    </span>
  );
}
