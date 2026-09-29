"use client";

import { ImagePlus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { CampoFormulario } from "@/components/campo-formulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reducirFoto } from "@/lib/fotos";
import {
  TAMANO_MAXIMO_FOTO,
  TIPOS_FOTO,
  type CampoProducto,
  type EstadoFormularioProducto,
} from "./validacion";

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

  const [foto, setFoto] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [quitarFoto, setQuitarFoto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  // La vista previa es una dirección temporal: se libera al cambiarla.
  useEffect(
    () => () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    },
    [vistaPrevia],
  );

  async function elegirFoto(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setErrorFoto(null);
    setProcesando(true);
    try {
      const reducida = await reducirFoto(archivo);
      setFoto(reducida);
      setVistaPrevia(URL.createObjectURL(reducida));
    } catch {
      // Si el navegador no sabe reducirla, se sube tal cual si se puede.
      if (TIPOS_FOTO.includes(archivo.type) && archivo.size <= TAMANO_MAXIMO_FOTO) {
        setFoto(archivo);
        setVistaPrevia(URL.createObjectURL(archivo));
      } else {
        setErrorFoto("No se ha podido preparar esa foto. Prueba con otra.");
      }
    } finally {
      setProcesando(false);
    }
  }

  function quitar() {
    setFoto(null);
    setVistaPrevia(null);
    setQuitarFoto(Boolean(fotoActual));
  }

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    datos.delete("foto_elegida");
    if (foto) {
      datos.set("foto", foto);
    } else if (quitarFoto) {
      datos.set("quitar_foto", "si");
    }
    startTransition(() => enviar(datos));
  }

  /** Atributos comunes para marcar un campo con error. */
  const conError = (campo: CampoProducto) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : {};

  const fotoVisible = vistaPrevia ?? (quitarFoto ? null : fotoActual);
  const mensajeFoto = errorFoto ?? errores.foto;

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Foto (opcional)</span>
        <div className="flex items-end gap-4">
          <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
            {fotoVisible ? (
              // Vista previa local o foto ya subida: no pasa por next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoVisible}
                alt="Foto del producto"
                className="size-full object-cover"
              />
            ) : (
              <ShoppingBag className="size-8" aria-hidden />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium has-focus-visible:ring-2 has-focus-visible:ring-ring">
              <ImagePlus className="size-4" aria-hidden />
              {fotoVisible ? "Cambiar foto" : "Elegir foto"}
              <input
                type="file"
                name="foto_elegida"
                accept="image/*"
                onChange={elegirFoto}
                className="sr-only"
                aria-describedby={mensajeFoto ? "foto-error" : undefined}
              />
            </label>
            {fotoVisible && (
              <Button
                type="button"
                variant="ghost"
                className="h-10 justify-start"
                onClick={quitar}
              >
                <X aria-hidden />
                Quitar la foto
              </Button>
            )}
          </div>
        </div>
        {procesando && (
          <p className="text-sm text-muted-foreground">Preparando la foto…</p>
        )}
        {mensajeFoto && (
          <p id="foto-error" className="text-sm text-destructive">
            {mensajeFoto}
          </p>
        )}
      </div>

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
          disabled={pendiente || procesando}
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
