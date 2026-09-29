"use client";

import { startTransition, useActionState, useId, useState } from "react";
import type { EstadoVoto } from "@/app/(publico)/votaciones/acciones";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  accion: (estado: EstadoVoto, jugadorId: string) => Promise<EstadoVoto>;
  candidatos: { id: string; nombre: string }[];
  /** Nombre de la categoría, para los lectores de pantalla. */
  categoria: string;
};

/** Elegir a un candidato y votarlo. El voto no se puede cambiar. */
export function FormularioVoto({ accion, candidatos, categoria }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, { error: null });
  const [elegido, setElegido] = useState<string | null>(null);
  const nombre = useId();
  const nombreElegido = candidatos.find(({ id }) => id === elegido)?.nombre;

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        if (elegido) {
          startTransition(() => enviar(elegido));
        }
      }}
      className="flex flex-col gap-3"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{categoria}</legend>
        {candidatos.map(({ id, nombre: nombreJugador }) => (
          <label
            key={id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-focus-visible:ring-2 has-focus-visible:ring-ring",
              elegido === id && "border-primary bg-accent font-medium",
            )}
          >
            <input
              type="radio"
              name={nombre}
              value={id}
              checked={elegido === id}
              onChange={() => setElegido(id)}
              className="size-4 accent-primary"
            />
            {nombreJugador}
          </label>
        ))}
      </fieldset>

      {estado.error && (
        <p role="alert" className="text-sm text-destructive">
          {estado.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!elegido || pendiente}
        className="h-11 w-full"
      >
        {pendiente
          ? "Votando…"
          : nombreElegido
            ? `Votar a ${nombreElegido}`
            : "Elige a un jugador"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Tu voto no se puede cambiar.
      </p>
    </form>
  );
}
