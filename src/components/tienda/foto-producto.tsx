import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { urlFoto, type Producto } from "@/lib/tienda";
import { cn } from "@/lib/utils";

/**
 * La foto de un producto, cuadrada, o un hueco con un icono si no tiene.
 * Las fotos ya se reducen al subirlas, así que se sirven tal cual.
 */
export function FotoProducto({
  producto,
  tamanos,
  className,
  prioridad = false,
}: {
  producto: Pick<Producto, "nombre" | "foto">;
  /** El atributo sizes: qué ancho ocupa la foto en la pantalla. */
  tamanos: string;
  className?: string;
  prioridad?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg bg-muted",
        className,
      )}
    >
      {producto.foto ? (
        <Image
          src={urlFoto(producto.foto)}
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
    </div>
  );
}
