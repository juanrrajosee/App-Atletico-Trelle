"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Las fotos de un producto: una tira que se desliza con el dedo (o con las
 * flechas) y, debajo, las miniaturas. La primera foto es la portada. Con una
 * sola foto no hay controles.
 */
export function GaleriaProducto({
  nombre,
  fotos,
  tamanos,
  className,
}: {
  nombre: string;
  /** Las direcciones de las fotos, en orden. Tiene que haber al menos una. */
  fotos: string[];
  /** El atributo sizes de la foto grande. */
  tamanos: string;
  className?: string;
}) {
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const varias = fotos.length > 1;

  function ir(posicion: number) {
    const elemento = tira.current;
    if (!elemento) return;
    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    elemento.scrollTo({
      left: posicion * elemento.clientWidth,
      behavior: sinMovimiento ? "auto" : "smooth",
    });
  }

  function alDesplazar() {
    const elemento = tira.current;
    if (!elemento || elemento.clientWidth === 0) return;
    const posicion = Math.round(elemento.scrollLeft / elemento.clientWidth);
    setActual((anterior) => (anterior === posicion ? anterior : posicion));
  }

  return (
    <div
      role="group"
      aria-roledescription="galería"
      aria-label={`Fotos de ${nombre}`}
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="relative">
        <div
          ref={tira}
          onScroll={alDesplazar}
          // Se puede mover con las flechas del teclado.
          tabIndex={varias ? 0 : undefined}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl bg-muted [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((foto, posicion) => (
            <div
              key={foto}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <Image
                src={foto}
                alt={
                  varias
                    ? `${nombre}, foto ${posicion + 1} de ${fotos.length}`
                    : nombre
                }
                fill
                sizes={tamanos}
                priority={posicion === 0}
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {varias && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 size-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
              disabled={actual === 0}
              onClick={() => ir(actual - 1)}
              aria-label="Foto anterior"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 size-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
              disabled={actual === fotos.length - 1}
              onClick={() => ir(actual + 1)}
              aria-label="Foto siguiente"
            >
              <ChevronRight aria-hidden />
            </Button>
            <p
              className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm"
              aria-live="polite"
            >
              {actual + 1} / {fotos.length}
            </p>
          </>
        )}
      </div>

      {varias && (
        <ul className="grid grid-cols-6 gap-2">
          {fotos.map((foto, posicion) => (
            <li key={foto}>
              <button
                type="button"
                onClick={() => ir(posicion)}
                aria-label={`Ver la foto ${posicion + 1}`}
                aria-current={posicion === actual}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-md bg-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring",
                  posicion === actual
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={foto}
                  alt=""
                  fill
                  sizes="6rem"
                  unoptimized
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
