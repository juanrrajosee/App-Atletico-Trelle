"use client";

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { TAMANO_MAXIMO_FOTO, TIPOS_FOTO, reducirFoto } from "@/lib/fotos";
import {
  CAMPO_FOTO_NUEVA,
  MAX_BYTES_FOTOS_NUEVAS,
  MAX_FOTOS_PRODUCTO,
} from "@/lib/fotos-producto-limites";
import { cn } from "@/lib/utils";

/** Una foto de las que se están eligiendo. `clave` solo sirve para React. */
type FotoElegida = { clave: string; url: string } & (
  | { ruta: string }
  | { archivo: File }
);

export type FotoActual = { ruta: string; url: string };

const formatoMegas = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

/**
 * Las fotos de un formulario: las que ya había (en su orden), más las que se
 * van añadiendo (ya reducidas en el navegador). Se pueden reordenar y quitar;
 * la primera es la portada. El formulario se envía a mano y, antes,
 * `prepararEnvio` pone en los datos el orden y los archivos nuevos.
 */
export function useSelectorFotos(
  fotosActuales: FotoActual[],
  /** El lado más largo, en píxeles, al que se reduce cada foto. */
  ladoMaximo?: number,
) {
  const [fotos, setFotos] = useState<FotoElegida[]>(() =>
    fotosActuales.map(({ ruta, url }) => ({ clave: ruta, ruta, url })),
  );
  const [procesando, setProcesando] = useState(false);
  const [errorFotos, setErrorFotos] = useState<string | null>(null);
  const contador = useRef(0);

  // Las vistas previas son direcciones temporales: se liberan al salir.
  const temporales = useRef<string[]>([]);
  useEffect(
    () => () => {
      temporales.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const bytesNuevos = (lista: FotoElegida[]) =>
    lista.reduce(
      (total, foto) => total + ("archivo" in foto ? foto.archivo.size : 0),
      0,
    );

  async function prepararFoto(original: File): Promise<File | null> {
    try {
      return await reducirFoto(original, ladoMaximo);
    } catch {
      // Si el navegador no sabe reducirla, se sube tal cual si se puede.
      if (TIPOS_FOTO.includes(original.type) && original.size <= TAMANO_MAXIMO_FOTO) {
        return original;
      }
      return null;
    }
  }

  async function elegirFotos(evento: ChangeEvent<HTMLInputElement>) {
    const elegidas = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (elegidas.length === 0) return;

    setErrorFotos(null);
    setProcesando(true);
    try {
      const sitio = MAX_FOTOS_PRODUCTO - fotos.length;
      const aAnadir = elegidas.slice(0, Math.max(0, sitio));
      const nuevas: FotoElegida[] = [];
      let aviso: string | null = null;
      let acumulado = bytesNuevos(fotos);

      for (const original of aAnadir) {
        const preparada = await prepararFoto(original);
        if (!preparada) {
          aviso = "No se ha podido preparar alguna foto. Prueba con otra.";
          continue;
        }
        if (acumulado + preparada.size > MAX_BYTES_FOTOS_NUEVAS) {
          aviso = `Las fotos nuevas no pueden pesar más de ${formatoMegas.format(
            MAX_BYTES_FOTOS_NUEVAS / (1024 * 1024),
          )} MB juntas. Guarda estas y añade el resto después.`;
          break;
        }
        acumulado += preparada.size;
        const url = URL.createObjectURL(preparada);
        temporales.current.push(url);
        contador.current += 1;
        nuevas.push({
          clave: `nueva-${contador.current}`,
          archivo: preparada,
          url,
        });
      }

      if (elegidas.length > aAnadir.length && !aviso) {
        aviso = `Como mucho ${MAX_FOTOS_PRODUCTO} fotos por producto.`;
      }
      setFotos((anteriores) => [...anteriores, ...nuevas]);
      setErrorFotos(aviso);
    } finally {
      setProcesando(false);
    }
  }

  function mover(posicion: number, destino: number) {
    setFotos((anteriores) => {
      if (destino < 0 || destino >= anteriores.length) return anteriores;
      const copia = [...anteriores];
      const [foto] = copia.splice(posicion, 1);
      copia.splice(destino, 0, foto);
      return copia;
    });
  }

  function quitar(posicion: number) {
    setErrorFotos(null);
    setFotos((anteriores) => anteriores.filter((_, i) => i !== posicion));
  }

  /** Pone en los datos del formulario el orden de las fotos y las nuevas. */
  function prepararEnvio(datos: FormData) {
    datos.delete("fotos_elegidas");
    let nueva = 0;
    const orden = fotos.map((foto) => {
      if ("ruta" in foto) return { ruta: foto.ruta };
      datos.set(`${CAMPO_FOTO_NUEVA}${nueva}`, foto.archivo);
      return { nueva: nueva++ };
    });
    datos.set("fotos_orden", JSON.stringify(orden));
  }

  return {
    fotos,
    procesando,
    errorFotos,
    llena: fotos.length >= MAX_FOTOS_PRODUCTO,
    elegirFotos,
    mover,
    quitar,
    prepararEnvio,
  };
}

/**
 * El campo de las fotos: una tira con cada foto (la primera es la portada),
 * con los botones de moverla y quitarla, y el botón de añadir más.
 */
export function SelectorFotos({
  selector,
  error,
  icono: Icono,
  alt,
}: {
  selector: ReturnType<typeof useSelectorFotos>;
  /** El error que devuelve el servidor, si lo hay. */
  error?: string;
  /** Lo que se ve en el hueco mientras no hay fotos. */
  icono: LucideIcon;
  alt: string;
}) {
  const { fotos, procesando, errorFotos, llena, elegirFotos, mover, quitar } =
    selector;
  const mensaje = errorFotos ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        Fotos (opcional, hasta {MAX_FOTOS_PRODUCTO})
      </span>

      {fotos.length === 0 ? (
        <div className="flex size-32 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icono className="size-8" aria-hidden />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto, posicion) => (
            <li key={foto.clave} className="flex flex-col gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {/* Vista previa local o foto ya subida: no pasa por next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={`${alt} ${posicion + 1}`}
                  className="size-full object-cover"
                />
                {posicion === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                    Portada
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10"
                  disabled={posicion === 0}
                  onClick={() => mover(posicion, posicion - 1)}
                  aria-label={`Mover la foto ${posicion + 1} antes`}
                >
                  <ArrowLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10"
                  disabled={posicion === fotos.length - 1}
                  onClick={() => mover(posicion, posicion + 1)}
                  aria-label={`Mover la foto ${posicion + 1} después`}
                >
                  <ArrowRight aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10"
                  onClick={() => quitar(posicion)}
                  aria-label={`Quitar la foto ${posicion + 1}`}
                >
                  <X aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label
        className={cn(
          "inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium has-focus-visible:ring-2 has-focus-visible:ring-ring",
          (llena || procesando) && "pointer-events-none opacity-50",
        )}
      >
        <ImagePlus className="size-4" aria-hidden />
        {fotos.length === 0 ? "Elegir fotos" : "Añadir fotos"}
        <input
          type="file"
          name="fotos_elegidas"
          accept="image/*"
          multiple
          disabled={llena || procesando}
          onChange={elegirFotos}
          className="sr-only"
          aria-describedby={mensaje ? "fotos-error" : undefined}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {fotos.length > 1
          ? "La primera es la portada: la que sale en la lista de la tienda. Mueve las fotos con las flechas."
          : "La primera foto es la portada de la tienda."}
      </p>

      {procesando && (
        <p className="text-sm text-muted-foreground">Preparando las fotos…</p>
      )}
      {mensaje && (
        <p id="fotos-error" className="text-sm text-destructive">
          {mensaje}
        </p>
      )}
    </div>
  );
}
