import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/**
 * Un campo de formulario: la etiqueta, el control y, si lo hay, su error
 * (con id `${id}-error`, para enlazarlo con aria-describedby).
 */
export function CampoFormulario({
  id,
  etiqueta,
  error,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-2 *:data-[slot=native-select-wrapper]:w-full">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
