import Link from "next/link";
import { AvisoPantalla } from "@/components/aviso-pantalla";
import { Button } from "@/components/ui/button";

export default function NoEncontradoPanel() {
  return (
    <AvisoPantalla
      titulo="No lo encontramos"
      accion={
        <Button asChild className="h-11">
          <Link href="/">Volver al inicio</Link>
        </Button>
      }
    >
      Puede que se haya borrado o que el enlace no sea correcto.
    </AvisoPantalla>
  );
}
