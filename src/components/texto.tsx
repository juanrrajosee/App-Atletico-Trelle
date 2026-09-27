import { parrafos } from "@/lib/textos";
import { cn } from "@/lib/utils";

/**
 * Un texto escrito en la aplicación (una noticia, la historia del club):
 * párrafos separados por una línea en blanco y, dentro de cada uno, se
 * respetan los saltos de línea. Siempre como texto, nunca como HTML.
 */
export function Texto({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 leading-relaxed", className)}>
      {parrafos(texto).map((parrafo, indice) => (
        <p key={indice} className="whitespace-pre-line">
          {parrafo}
        </p>
      ))}
    </div>
  );
}
