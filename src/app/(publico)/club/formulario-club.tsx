"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actualizarClub } from "./acciones";
import type { CampoClub, EstadoFormularioClub } from "./validacion";

export function FormularioClub({
  valoresIniciales,
}: {
  valoresIniciales: EstadoFormularioClub["valores"];
}) {
  const [estado, enviar, pendiente] = useActionState(actualizarClub, {
    errores: {},
    mensaje: null,
    valores: valoresIniciales,
    intento: 0,
  });
  const { errores, valores } = estado;

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoClub) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : {};

  return (
    <form
      key={estado.intento}
      action={enviar}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="text-sm text-muted-foreground">
        Todo es opcional: lo que dejes vacío no sale en la página del club. En
        los textos, separa los párrafos con una línea en blanco.
      </p>

      <CampoFormulario
        id="historia_club"
        etiqueta="Historia del club"
        error={errores.historia_club}
      >
        <Textarea
          id="historia_club"
          name="historia_club"
          rows={10}
          defaultValue={valores.historia_club}
          className="min-h-48"
          {...conError("historia_club")}
        />
      </CampoFormulario>

      <CampoFormulario
        id="historia_trelle"
        etiqueta="Historia de Trelle"
        error={errores.historia_trelle}
      >
        <Textarea
          id="historia_trelle"
          name="historia_trelle"
          rows={10}
          defaultValue={valores.historia_trelle}
          className="min-h-48"
          {...conError("historia_trelle")}
        />
      </CampoFormulario>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-1 text-lg font-semibold">Contacto</legend>

        <CampoFormulario id="telefono" etiqueta="Teléfono" error={errores.telefono}>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            defaultValue={valores.telefono}
            className="h-11"
            {...conError("telefono")}
          />
        </CampoFormulario>

        <CampoFormulario id="email" etiqueta="Email" error={errores.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            defaultValue={valores.email}
            className="h-11"
            {...conError("email")}
          />
        </CampoFormulario>

        <CampoFormulario id="campo" etiqueta="Campo" error={errores.campo}>
          <Input
            id="campo"
            name="campo"
            autoComplete="off"
            defaultValue={valores.campo}
            className="h-11"
            {...conError("campo")}
          />
        </CampoFormulario>
      </fieldset>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={pendiente} className="h-11 w-full">
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link href="/club">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
