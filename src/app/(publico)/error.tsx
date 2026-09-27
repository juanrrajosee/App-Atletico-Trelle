"use client";

import { useEffect } from "react";
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
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Algo ha fallado</h1>
      <p className="text-sm text-muted-foreground">
        No se ha podido cargar esta pantalla. Comprueba tu conexión e
        inténtalo de nuevo.
      </p>
      <Button onClick={() => retry()} className="h-11">
        Reintentar
      </Button>
    </div>
  );
}
