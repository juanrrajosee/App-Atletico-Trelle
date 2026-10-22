import { Images, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { portada, urlFoto, type Producto } from "@/lib/tienda";
import { cn } from "@/lib/utils";

/**
 * La portada de un producto (su primera foto), cuadrada, o un hueco con un
 * icono si no tiene. Si tiene más fotos, un aviso con cuántas son. Las fotos
 * ya se reducen al subirlas, así que se sirven tal cual.
 */
export function FotoProducto({
  producto,
  tamanos,
  className,
  prioridad = false,
}: {
  producto: Pick<Producto, "nombre" | "fotos">;
  /** El atributo sizes: qué ancho ocupa la foto en la pantalla. */
  tamanos: string;
  className?: string;
  prioridad?: boolean;
}) {
  const principal = portada(producto);
  const total = producto.fotos.length;

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg bg-muted",
        className,
      )}
    >
      {principal ? (
        <Image
          src={urlFoto(principal)}
          alt={producto.nombre}
          fill
          sizes={tamanos}
          priority={prioridad}
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ShoppingBag className="size-8" aria-hidden />
        </div>
      )}
      {total > 1 && (
        <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium shadow-sm">
          <Images className="size-3.5" aria-hidden />
          {total}
          <span className="sr-only"> fotos</span>
        </span>
      )}
    </div>
  );
}
