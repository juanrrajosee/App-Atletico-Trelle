"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Un apartado que se pliega y se despliega: plegado, enseña su título y una
 * línea descriptiva; al pulsarlo (con el ratón, el dedo o el teclado) se abre
 * con una animación suave y enseña todo el contenido. Cada uno se abre y se
 * cierra por su cuenta. El contenido va siempre en la página (también
 * plegado), pero sin poder enfocarse ni leerse hasta que se abre.
 *
 * Con "reducir movimiento" abre y cierra sin animación.
 */
export function Desplegable({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  /** La línea que se ve mientras está plegado. */
  descripcion: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const idBoton = `${id}-boton`;
  const idTitulo = `${id}-titulo`;
  const idDescripcion = `${id}-descripcion`;
  const idPanel = `${id}-panel`;

  return (
    <section className="rounded-xl border bg-card shadow-xs">
      <h2>
        <button
          type="button"
          id={idBoton}
          aria-expanded={abierto}
          aria-controls={idPanel}
          aria-labelledby={idTitulo}
          aria-describedby={idDescripcion}
          onClick={() => setAbierto((anterior) => !anterior)}
          className="flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-150 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-accent motion-reduce:transition-none"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span id={idTitulo} className="text-xl font-semibold tracking-tight">
              {titulo}
            </span>
            {/* La línea se recoge al abrir: ya se va a leer el texto entero. */}
            <span
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                abierto ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
              )}
            >
              <span className="min-h-0 overflow-hidden">
                <span
                  id={idDescripcion}
                  className="mt-1 line-clamp-2 font-sans text-sm font-normal text-muted-foreground"
                >
                  {descripcion}
                </span>
              </span>
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out motion-reduce:transition-none",
              abierto && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </h2>

      <div
        id={idPanel}
        role="region"
        aria-labelledby={idBoton}
        inert={!abierto}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          abierto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pt-1 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
