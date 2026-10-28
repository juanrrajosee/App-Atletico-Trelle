"use client";

import Image from "next/image";
import { useId, useRef, useState, type ReactNode } from "react";
import campoHorizontal from "@/assets/campo-horizontal.webp";
import campoVertical from "@/assets/campo-vertical.webp";
import type { Posicion } from "@/lib/plantilla";
import { cn } from "@/lib/utils";

export type GrupoPizarra = {
  posicion: Posicion;
  /** "Defensas". */
  titulo: string;
  cantidad: number;
  /** La lista de jugadores de esa posición, ya hecha en el servidor. */
  contenido: ReactNode;
};

/**
 * Cuánto ocupa cada posición en el campo, de nuestra portería hacia la del
 * rival: el portero, en su área; luego la defensa, el centro del campo y la
 * delantera, ya en el campo contrario.
 */
const FRANJA: Record<Posicion, string> = {
  portero: "basis-[21%]",
  defensa: "basis-[25%]",
  centrocampista: "basis-[26%]",
  delantero: "basis-[28%]",
};

/**
 * La pizarra de la plantilla: un campo con las cuatro posiciones. Al entrar
 * no enseña a nadie; al pulsar una posición se despliegan debajo sus
 * jugadores, y al pulsarla otra vez se recogen. En el móvil el campo va en
 * vertical, con nuestra portería abajo; en el ordenador, en horizontal, con
 * nuestra portería a la izquierda.
 */
export function Pizarra({ grupos }: { grupos: GrupoPizarra[] }) {
  const [abierta, setAbierta] = useState<Posicion | null>(null);
  const id = useId();
  const zonaLista = useRef<HTMLDivElement>(null);

  function elegir(posicion: Posicion) {
    const nueva = abierta === posicion ? null : posicion;
    setAbierta(nueva);
    if (nueva) {
      // Que se vea la lista que se acaba de abrir, sin perder la pizarra si
      // ya cabe en la pantalla.
      requestAnimationFrame(() => {
        const sinMovimiento = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        zonaLista.current?.scrollIntoView({
          behavior: sinMovimiento ? "auto" : "smooth",
          block: "nearest",
        });
      });
    }
  }

  const grupoAbierto = grupos.find((grupo) => grupo.posicion === abierta);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-[475/740] w-full max-w-xs overflow-hidden rounded-2xl lg:aspect-[740/475] lg:max-w-3xl">
        <Image
          src={campoVertical}
          alt=""
          fill
          sizes="20rem"
          priority
          className="object-cover lg:hidden"
        />
        <Image
          src={campoHorizontal}
          alt=""
          fill
          sizes="48rem"
          priority
          className="hidden object-cover lg:block"
        />
        <div
          role="group"
          aria-label="Posiciones"
          className="absolute inset-0 flex flex-col-reverse lg:flex-row"
        >
          {grupos.map(({ posicion, titulo, cantidad }) => {
            const activa = abierta === posicion;
            return (
              <button
                key={posicion}
                type="button"
                aria-expanded={activa}
                aria-controls={`${id}-lista`}
                onClick={() => elegir(posicion)}
                className={cn(
                  "group flex items-center justify-center transition-colors duration-200 outline-none motion-reduce:transition-none",
                  FRANJA[posicion],
                  activa ? "bg-white/20" : "hover:bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md ring-offset-2 ring-offset-transparent transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-white motion-reduce:transition-none lg:text-base",
                    activa
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/95 text-primary",
                  )}
                >
                  {titulo}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      activa ? "bg-white/20" : "bg-primary/10",
                    )}
                  >
                    <span className="sr-only">: </span>
                    {cantidad}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={zonaLista}
        id={`${id}-lista`}
        aria-live="polite"
        className="scroll-mt-20"
      >
        {grupoAbierto ? (
          <section
            key={grupoAbierto.posicion}
            aria-label={grupoAbierto.titulo}
            className="animate-in duration-300 fade-in slide-in-from-top-2 motion-reduce:animate-none"
          >
            <h2 className="mb-2 titulo-apartado">{grupoAbierto.titulo}</h2>
            {grupoAbierto.cantidad > 0 ? (
              grupoAbierto.contenido
            ) : (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No hay jugadores en esta posición.
              </p>
            )}
          </section>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Toca una posición en la pizarra para ver a sus jugadores.
          </p>
        )}
      </div>
    </div>
  );
}
