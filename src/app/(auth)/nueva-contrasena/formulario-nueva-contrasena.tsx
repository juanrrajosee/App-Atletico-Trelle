"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cambiarContrasena, type EstadoNuevaContrasena } from "../acciones";

const estadoInicial: EstadoNuevaContrasena = { error: null };

export function FormularioNuevaContrasena() {
  const [estado, accion, pendiente] = useActionState(
    cambiarContrasena,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="contrasena">Contraseña nueva</Label>
        <Input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={estado.error ? true : undefined}
          aria-describedby="contrasena-ayuda"
          className="h-11"
        />
        <p
          id="contrasena-ayuda"
          className={
            estado.error
              ? "text-sm text-destructive"
              : "text-xs text-muted-foreground"
          }
          role={estado.error ? "alert" : undefined}
        >
          {estado.error ?? "Al menos 8 caracteres."}
        </p>
      </div>

      <Button type="submit" disabled={pendiente} className="h-11 w-full">
        {pendiente ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
