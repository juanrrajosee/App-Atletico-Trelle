import type { ReactNode } from "react";
import { Escudo } from "@/components/escudo";

/**
 * Una pantalla que solo da un aviso (no encontrado, error…): el escudo, un
 * título, una explicación y lo que se puede hacer.
 */
export function AvisoPantalla({
  titulo,
  children,
  accion,
}: {
  titulo: string;
  children: ReactNode;
  accion: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Escudo tamano={72} decorativo className="opacity-90" />
      <h1 className="text-2xl font-semibold tracking-wide uppercase">{titulo}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{children}</p>
      {accion}
    </div>
  );
}
