"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { iniciarSesion, type EstadoAcceso } from "../acciones";

const estadoInicial: EstadoAcceso = { error: null, email: "" };

export function FormularioAcceso() {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={estado.email}
          aria-invalid={estado.error ? true : undefined}
          className="h-11"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contrasena">Contraseña</Label>
        <Input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={estado.error ? true : undefined}
          className="h-11"
        />
      </div>

      {estado.error && (
        <p role="alert" className="text-sm text-destructive">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="h-11 w-full">
        {pendiente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
