"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type FormEvent } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { SelectorFoto, useSelectorFoto } from "@/components/selector-foto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  ESTADOS_JUGADOR,
  LADO_MAXIMO_FOTO_JUGADOR,
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
  /** Dirección de la foto que ya tiene el jugador, si tiene. */
  fotoActual?: string | null;
  textoBoton: string;
  hrefCancelar: string;
};

/**
 * Formulario de un jugador. Se envía a mano (no con action) para mandar la
 * foto ya reducida en lugar de la original.
 */
export function FormularioJugador({
  accion,
  valoresIniciales,
  fotoActual = null,
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

  const selectorFoto = useSelectorFoto(fotoActual, LADO_MAXIMO_FOTO_JUGADOR);

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    selectorFoto.prepararEnvio(datos);
    startTransition(() => enviar(datos));
  }

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoJugador) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : {};

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5" noValidate>
      <CampoFormulario id="nombre" etiqueta="Nombre" error={errores.nombre}>
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

      <CampoFormulario id="apellidos" etiqueta="Apellidos" error={errores.apellidos}>
        <Input
          id="apellidos"
          name="apellidos"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.apellidos}
          className="h-11"
          {...conError("apellidos")}
        />
      </CampoFormulario>

      <CampoFormulario id="apodo" etiqueta="Apodo (opcional)" error={errores.apodo}>
        <Input
          id="apodo"
          name="apodo"
          autoComplete="off"
          autoCapitalize="words"
          defaultValue={valores.apodo}
          className="h-11"
          aria-invalid={errores.apodo ? true : undefined}
          aria-describedby={
            errores.apodo ? "apodo-error apodo-ayuda" : "apodo-ayuda"
          }
        />
        <p id="apodo-ayuda" className="text-xs text-muted-foreground">
          Como se le conoce en el club. Si tiene, la aplicación le llama así, con
          el nombre completo en su ficha.
        </p>
      </CampoFormulario>

      <div className="grid grid-cols-[6rem_1fr] gap-3">
        <CampoFormulario id="dorsal" etiqueta="Dorsal" error={errores.dorsal}>
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
        </CampoFormulario>

        <CampoFormulario id="posicion" etiqueta="Posición" error={errores.posicion}>
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
        </CampoFormulario>
      </div>

      <CampoFormulario id="estado" etiqueta="Estado" error={errores.estado}>
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
      </CampoFormulario>

      <div className="flex flex-col gap-2">
        <SelectorFoto
          selector={selectorFoto}
          error={errores.foto}
          icono={UserRound}
          alt="Foto del jugador"
        />
        <p className="text-xs text-muted-foreground">
          Es una foto de una persona: súbela solo si ha dado su permiso para
          publicarla (si es menor de edad, el de su padre, madre o tutor).
        </p>
      </div>

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
