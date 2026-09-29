"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarse, type EstadoRegistro } from "../acciones";

const estadoInicial: EstadoRegistro = {
  errores: {},
  mensaje: null,
  email: "",
  enviadoA: null,
};

export function FormularioRegistro() {
  const [estado, accion, pendiente] = useActionState(
    registrarse,
    estadoInicial,
  );
  const { errores } = estado;

  if (estado.enviadoA) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="size-10 text-muted-foreground" aria-hidden />
        <p className="font-medium">Revisa tu email</p>
        <p className="text-sm text-muted-foreground">
          Te hemos enviado un enlace a <strong>{estado.enviadoA}</strong> para
          activar la cuenta. Si no lo ves, mira en la carpeta de spam. Si ya
          tenías cuenta con este email, entra directamente.
        </p>
      </div>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-5" noValidate>
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
          aria-invalid={errores.email ? true : undefined}
          aria-describedby={errores.email ? "email-error" : undefined}
          className="h-11"
        />
        {errores.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errores.email}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contrasena">Contraseña</Label>
        <Input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={errores.contrasena ? true : undefined}
          aria-describedby="contrasena-ayuda"
          className="h-11"
        />
        <p
          id="contrasena-ayuda"
          className={
            errores.contrasena
              ? "text-sm text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {errores.contrasena ?? "Al menos 8 caracteres."}
        </p>
      </div>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="h-11 w-full">
        {pendiente ? "Creando la cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
