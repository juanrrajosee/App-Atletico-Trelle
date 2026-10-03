import Link from "next/link";
import { AvisoPantalla } from "@/components/aviso-pantalla";
import { Button } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <AvisoPantalla
        titulo="Esta página no existe"
        accion={
          <Button asChild className="h-11">
            <Link href="/">Volver al inicio</Link>
          </Button>
        }
      >
        Revisa la dirección o vuelve al inicio.
      </AvisoPantalla>
    </main>
  );
}
