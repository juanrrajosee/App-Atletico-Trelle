"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  CONDICIONES,
  ESTADOS_PARTIDO,
  NOMBRE_CONDICION,
  NOMBRE_EQUIPO,
  NOMBRE_ESTADO_PARTIDO,
} from "@/lib/partidos";
import type { CampoPartido, EstadoFormularioPartido } from "./validacion";

type Props = {
  accion: (
    estado: EstadoFormularioPartido,
    formData: FormData,
  ) => Promise<EstadoFormularioPartido>;
  valoresIniciales: EstadoFormularioPartido["valores"];
  textoBoton: string;
  hrefCancelar: string;
};

export function FormularioPartido({
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

  // El resultado solo se pide si el partido se ha jugado.
  const [jugado, setJugado] = useState(valores.estado === "jugado");

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoPartido) =>
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
      <CampoFormulario id="rival" etiqueta="Rival" error={errores.rival}>
        <Input
          id="rival"
          name="rival"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.rival}
          className="h-11"
          {...conError("rival")}
        />
      </CampoFormulario>

      <div className="grid grid-cols-2 gap-3">
        <CampoFormulario id="fecha" etiqueta="Fecha" error={errores.fecha}>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={valores.fecha}
            className="h-11"
            {...conError("fecha")}
          />
        </CampoFormulario>

        <CampoFormulario id="hora" etiqueta="Hora" error={errores.hora}>
          <Input
            id="hora"
            name="hora"
            type="time"
            defaultValue={valores.hora}
            className="h-11"
            {...conError("hora")}
          />
        </CampoFormulario>
      </div>

      <CampoFormulario
        id="condicion"
        etiqueta="¿Dónde se juega?"
        error={errores.condicion}
      >
        <NativeSelect
          id="condicion"
          name="condicion"
          defaultValue={valores.condicion ?? ""}
          className="h-11"
          {...conError("condicion")}
        >
          <NativeSelectOption value="" disabled>
            Elige…
          </NativeSelectOption>
          {CONDICIONES.map((condicion) => (
            <NativeSelectOption key={condicion} value={condicion}>
              {NOMBRE_CONDICION[condicion]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </CampoFormulario>

      <CampoFormulario
        id="campo"
        etiqueta="Campo (opcional)"
        error={errores.campo}
      >
        <Input
          id="campo"
          name="campo"
          autoComplete="off"
          defaultValue={valores.campo}
          className="h-11"
          {...conError("campo")}
        />
      </CampoFormulario>

      <CampoFormulario
        id="competicion"
        etiqueta="Competición (opcional)"
        error={errores.competicion}
      >
        <Input
          id="competicion"
          name="competicion"
          autoComplete="off"
          defaultValue={valores.competicion}
          className="h-11"
          {...conError("competicion")}
        />
      </CampoFormulario>

      <CampoFormulario id="estado" etiqueta="Estado" error={errores.estado}>
        <NativeSelect
          id="estado"
          name="estado"
          defaultValue={valores.estado ?? "programado"}
          onChange={(evento) => setJugado(evento.target.value === "jugado")}
          className="h-11"
          {...conError("estado")}
        >
          {ESTADOS_PARTIDO.map((estadoPartido) => (
            <NativeSelectOption key={estadoPartido} value={estadoPartido}>
              {NOMBRE_ESTADO_PARTIDO[estadoPartido]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </CampoFormulario>

      {jugado && (
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="mb-3 text-sm font-medium">Goles</legend>
          <CampoFormulario
            id="goles_favor"
            etiqueta={NOMBRE_EQUIPO}
            error={errores.goles_favor}
          >
            <Input
              id="goles_favor"
              name="goles_favor"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={valores.goles_favor}
              className="h-11"
              {...conError("goles_favor")}
            />
          </CampoFormulario>

          <CampoFormulario
            id="goles_contra"
            etiqueta="Rival"
            error={errores.goles_contra}
          >
            <Input
              id="goles_contra"
              name="goles_contra"
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              defaultValue={valores.goles_contra}
              className="h-11"
              {...conError("goles_contra")}
            />
          </CampoFormulario>
        </fieldset>
      )}

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
