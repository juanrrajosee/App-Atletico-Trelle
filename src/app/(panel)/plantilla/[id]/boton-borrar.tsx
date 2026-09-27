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
import type { EstadoBorrado } from "../acciones";

type Props = {
  accion: (estado: EstadoBorrado) => Promise<EstadoBorrado>;
  nombre: string;
};

/** Borrar no se puede deshacer, así que se pide confirmación. */
export function BotonBorrar({ accion, nombre }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, { error: null });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="h-11 w-full text-destructive">
          Borrar jugador
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar a {nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Desaparecerá de la plantilla y no se puede deshacer.
          </AlertDialogDescription>
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
