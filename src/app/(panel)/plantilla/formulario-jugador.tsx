"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  ESTADOS_JUGADOR,
  NOMBRE_ESTADO,
  NOMBRE_POSICION,
  POSICIONES,
} from "@/lib/plantilla";
import type { CampoJugador, EstadoFormularioJugador } from "./validacion";

type Props = {
  accion: (
    estado: EstadoFormularioJugador,
    formData: FormData,
  ) => Promise<EstadoFormularioJugador>;
  valoresIniciales: EstadoFormularioJugador["valores"];
  textoBoton: string;
  hrefCancelar: string;
};

export function FormularioJugador({
  accion,
  valoresIniciales,
  textoBoton,
  hrefCancelar,
}: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, {
    errores: {},
    mensaje: null,
    valores: valoresIniciales,
    intento: 0,
  });
  const { errores, valores } = estado;

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoJugador) =>
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
      <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.nombre}
          className="h-11"
          {...conError("nombre")}
        />
      </Campo>

      <Campo id="apellidos" etiqueta="Apellidos" error={errores.apellidos}>
        <Input
          id="apellidos"
          name="apellidos"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.apellidos}
          className="h-11"
          {...conError("apellidos")}
        />
      </Campo>

      <div className="grid grid-cols-[6rem_1fr] gap-3">
        <Campo id="dorsal" etiqueta="Dorsal" error={errores.dorsal}>
          <Input
            id="dorsal"
            name="dorsal"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            defaultValue={valores.dorsal}
            className="h-11"
            {...conError("dorsal")}
          />
        </Campo>

        <Campo id="posicion" etiqueta="Posición" error={errores.posicion}>
          <NativeSelect
            id="posicion"
            name="posicion"
            defaultValue={valores.posicion ?? ""}
            className="h-11"
            {...conError("posicion")}
          >
            <NativeSelectOption value="" disabled>
              Elige…
            </NativeSelectOption>
            {POSICIONES.map((posicion) => (
              <NativeSelectOption key={posicion} value={posicion}>
                {NOMBRE_POSICION[posicion]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Campo>
      </div>

      <Campo id="estado" etiqueta="Estado" error={errores.estado}>
        <NativeSelect
          id="estado"
          name="estado"
          defaultValue={valores.estado ?? "disponible"}
          className="h-11"
          {...conError("estado")}
        >
          {ESTADOS_JUGADOR.map((estadoJugador) => (
            <NativeSelectOption key={estadoJugador} value={estadoJugador}>
              {NOMBRE_ESTADO[estadoJugador]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Campo>

      <Campo
        id="fecha_nacimiento"
        etiqueta="Fecha de nacimiento (opcional)"
        error={errores.fecha_nacimiento}
      >
        <Input
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          type="date"
          defaultValue={valores.fecha_nacimiento}
          className="h-11"
          {...conError("fecha_nacimiento")}
        />
      </Campo>

      <Campo
        id="telefono"
        etiqueta="Teléfono (opcional)"
        error={errores.telefono}
        ayuda="Solo lo verán el entrenador y el propio jugador."
      >
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
      </Campo>

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
          <Link href={hrefCancelar}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: CampoJugador;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-2 *:data-[slot=native-select-wrapper]:w-full">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>
      )}
    </div>
  );
}
