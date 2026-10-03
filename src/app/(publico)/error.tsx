"use client";

import { useEffect } from "react";
import { AvisoPantalla } from "@/components/aviso-pantalla";
import { Button } from "@/components/ui/button";

export default function ErrorPanel({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AvisoPantalla
      titulo="Algo ha fallado"
      accion={
        <Button onClick={() => retry()} className="h-11">
          Reintentar
        </Button>
      }
    >
      No se ha podido cargar esta pantalla. Comprueba tu conexión e inténtalo
      de nuevo.
    </AvisoPantalla>
  );
}
