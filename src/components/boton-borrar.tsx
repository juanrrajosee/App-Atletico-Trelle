"use client";

import { useActionState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Lo que devuelve una acción de borrar si no ha podido hacerlo. */
export type EstadoBorrado = { error: string | null };

type Props = {
  accion: (estado: EstadoBorrado) => Promise<EstadoBorrado>;
  /** Texto del botón, por ejemplo "Borrar jugador". */
  texto: string;
  /** Pregunta de confirmación, por ejemplo "¿Borrar a Ana?". */
  pregunta: string;
  /** Qué pasará si se confirma. */
  consecuencias: string;
};

/** Borrar no se puede deshacer, así que se pide confirmación. */
export function BotonBorrar({ accion, texto, pregunta, consecuencias }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, { error: null });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-11 w-full text-destructive">
          {texto}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{pregunta}</AlertDialogTitle>
          <AlertDialogDescription>{consecuencias}</AlertDialogDescription>
        </AlertDialogHeader>
        {estado.error && (
          <p role="alert" className="text-sm text-destructive">
            {estado.error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel>
          <form action={enviar}>
            <Button
              type="submit"
              variant="destructive"
              disabled={pendiente}
              className="h-11 w-full"
            >
              {pendiente ? "Borrando…" : "Borrar"}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
