"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CampoMiembro, EstadoFormularioMiembro } from "./validacion";

/** Cargos habituales, como sugerencia al escribir (se puede poner otro). */
const CARGOS_HABITUALES = [
  "Presidente",
  "Presidenta",
  "Vicepresidente",
  "Vicepresidenta",
  "Secretario",
  "Secretaria",
  "Tesorero",
  "Tesorera",
  "Vocal",
];

type Props = {
  accion: (
    estado: EstadoFormularioMiembro,
    formData: FormData,
  ) => Promise<EstadoFormularioMiembro>;
  valoresIniciales: EstadoFormularioMiembro["valores"];
  textoBoton: string;
};

export function FormularioMiembro({
  accion,
  valoresIniciales,
  textoBoton,
}: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, {
    errores: {},
    mensaje: null,
    valores: valoresIniciales,
    intento: 0,
  });
  const { errores, valores } = estado;

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoMiembro) =>
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
        Su nombre saldrá en la aplicación, que es pública: añade solo a quien
        esté de acuerdo.
      </p>

      <CampoFormulario id="nombre" etiqueta="Nombre y apellidos" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.nombre}
          className="h-11"
          {...conError("nombre")}
        />
      </CampoFormulario>

      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <CampoFormulario id="cargo" etiqueta="Cargo" error={errores.cargo}>
          <Input
            id="cargo"
            name="cargo"
            list="cargos-habituales"
            autoComplete="off"
            defaultValue={valores.cargo}
            className="h-11"
            {...conError("cargo")}
          />
          <datalist id="cargos-habituales">
            {CARGOS_HABITUALES.map((cargo) => (
              <option key={cargo} value={cargo} />
            ))}
          </datalist>
        </CampoFormulario>

        <CampoFormulario id="orden" etiqueta="Posición" error={errores.orden}>
          <Input
            id="orden"
            name="orden"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            defaultValue={valores.orden}
            className="h-11"
            {...conError("orden")}
          />
        </CampoFormulario>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        La posición ordena la lista: el 1 sale el primero.
      </p>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={pendiente} className="h-11 w-full">
          {pendiente ? "Guardando…" : textoBoton}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link href="/club">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
