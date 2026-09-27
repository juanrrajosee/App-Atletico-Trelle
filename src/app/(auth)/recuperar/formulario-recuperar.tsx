"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pedirRecuperacion, type EstadoRecuperacion } from "../acciones";

const estadoInicial: EstadoRecuperacion = {
  error: null,
  email: "",
  enviadoA: null,
};

export function FormularioRecuperar() {
  const [estado, accion, pendiente] = useActionState(
    pedirRecuperacion,
    estadoInicial,
  );

  if (estado.enviadoA) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="size-10 text-muted-foreground" aria-hidden />
        <p className="font-medium">Revisa tu email</p>
        <p className="text-sm text-muted-foreground">
          Si hay una cuenta con <strong>{estado.enviadoA}</strong>, te hemos
          enviado un enlace para elegir una contraseña nueva. Si no lo ves,
          mira en la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="email">Email de tu cuenta</Label>
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

      {estado.error && (
        <p role="alert" className="text-sm text-destructive">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="h-11 w-full">
        {pendiente ? "Enviando…" : "Enviarme un enlace"}
      </Button>
    </form>
  );
}
