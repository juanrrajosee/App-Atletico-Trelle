"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { iniciarSesion, type EstadoAcceso } from "../acciones";

const estadoInicial: EstadoAcceso = { error: null, email: "" };

/** siguiente: la página a la que volver después de entrar. */
export function FormularioAcceso({ siguiente }: { siguiente: string }) {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    estadoInicial,
  );

  return (
    <form action={accion} className="flex flex-col gap-5">
      <input type="hidden" name="siguiente" value={siguiente} />
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

      <Link
        href="/recuperar"
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ¿Has olvidado tu contraseña?
      </Link>
    </form>
  );
}
