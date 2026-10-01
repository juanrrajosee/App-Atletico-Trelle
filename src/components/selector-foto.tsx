"use client";

import { ImagePlus, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { TAMANO_MAXIMO_FOTO, TIPOS_FOTO, reducirFoto } from "@/lib/fotos";
import { cn } from "@/lib/utils";

/**
 * La foto que se está eligiendo en un formulario: la nueva (ya reducida en
 * el navegador), o la orden de quitar la que había. El formulario se envía
 * a mano y, antes, `prepararEnvio` pone la foto en los datos.
 */
export function useSelectorFoto(fotoActual: string | null) {
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

  /** Pone en los datos del formulario la foto nueva o la orden de quitarla. */
  function prepararEnvio(datos: FormData) {
    datos.delete("foto_elegida");
    if (foto) {
      datos.set("foto", foto);
    } else if (quitarFoto) {
      datos.set("quitar_foto", "si");
    }
  }

  return {
    fotoVisible: vistaPrevia ?? (quitarFoto ? null : fotoActual),
    procesando,
    errorFoto,
    elegirFoto,
    quitar,
    prepararEnvio,
  };
}

/**
 * El campo de la foto: la vista previa (o un icono si no hay), y los botones
 * de elegirla, cambiarla y quitarla.
 */
export function SelectorFoto({
  selector,
  error,
  icono: Icono,
  alt,
  apaisada = false,
}: {
  selector: ReturnType<typeof useSelectorFoto>;
  /** El error que devuelve el servidor, si lo hay. */
  error?: string;
  /** Lo que se ve en el hueco mientras no hay foto. */
  icono: LucideIcon;
  alt: string;
  /** Para una portada (noticias); si no, cuadrada (productos). */
  apaisada?: boolean;
}) {
  const { fotoVisible, procesando, errorFoto, elegirFoto, quitar } = selector;
  const mensaje = errorFoto ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Foto (opcional)</span>
      <div className="flex items-end gap-4">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground",
            apaisada ? "aspect-video w-44" : "size-32",
          )}
        >
          {fotoVisible ? (
            // Vista previa local o foto ya subida: no pasa por next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoVisible} alt={alt} className="size-full object-cover" />
          ) : (
            <Icono className="size-8" aria-hidden />
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
              aria-describedby={mensaje ? "foto-error" : undefined}
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
      {mensaje && (
        <p id="foto-error" className="text-sm text-destructive">
          {mensaje}
        </p>
      )}
    </div>
  );
}
