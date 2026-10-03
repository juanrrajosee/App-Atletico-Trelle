"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type FormEvent } from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { SelectorFoto, useSelectorFoto } from "@/components/selector-foto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CampoProducto, EstadoFormularioProducto } from "./validacion";

type Props = {
  accion: (
    estado: EstadoFormularioProducto,
    formData: FormData,
  ) => Promise<EstadoFormularioProducto>;
  valoresIniciales: EstadoFormularioProducto["valores"];
  /** Dirección de la foto que ya tiene el producto, si tiene. */
  fotoActual?: string | null;
  textoBoton: string;
  hrefCancelar: string;
};

/**
 * Formulario de un producto. Se envía a mano (no con action) para mandar
 * la foto ya reducida en lugar de la original.
 */
export function FormularioProducto({
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
  const { errores } = estado;

  const selectorFoto = useSelectorFoto(fotoActual);

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    selectorFoto.prepararEnvio(datos);
    startTransition(() => enviar(datos));
  }

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoProducto) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : {};

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5" noValidate>
      <SelectorFoto
        selector={selectorFoto}
        error={errores.foto}
        icono={ShoppingBag}
        alt="Foto del producto"
      />

      <CampoFormulario id="nombre" etiqueta="Nombre" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          autoComplete="off"
          defaultValue={valoresIniciales.nombre}
          className="h-11"
          {...conError("nombre")}
        />
      </CampoFormulario>

      <CampoFormulario
        id="descripcion"
        etiqueta="Descripción (opcional)"
        error={errores.descripcion}
      >
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          defaultValue={valoresIniciales.descripcion}
          {...conError("descripcion")}
        />
      </CampoFormulario>

      <div className="grid grid-cols-2 gap-3">
        <CampoFormulario
          id="precio"
          etiqueta="Precio (€, opcional)"
          error={errores.precio}
        >
          <Input
            id="precio"
            name="precio"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Sin precio"
            defaultValue={valoresIniciales.precio}
            className="h-11"
            {...conError("precio")}
          />
        </CampoFormulario>

        <CampoFormulario id="orden" etiqueta="Posición" error={errores.orden}>
          <Input
            id="orden"
            name="orden"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            defaultValue={valoresIniciales.orden}
            className="h-11"
            {...conError("orden")}
          />
        </CampoFormulario>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        El precio es orientativo. La posición ordena la tienda: el 1 sale el
        primero.
      </p>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm has-focus-visible:ring-2 has-focus-visible:ring-ring">
        <input
          type="checkbox"
          name="visible"
          value="si"
          defaultChecked={valoresIniciales.visible !== "no"}
          className="size-5 accent-primary"
        />
        Se ve en la tienda
      </label>

      {estado.mensaje && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={pendiente || selectorFoto.procesando}
          className="h-11 w-full"
        >
          {pendiente ? "Guardando…" : textoBoton}
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link href={hrefCancelar}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
