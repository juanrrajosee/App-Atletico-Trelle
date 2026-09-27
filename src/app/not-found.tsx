import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Esta página no existe</h1>
      <p className="text-sm text-muted-foreground">
        Revisa la dirección o vuelve al inicio.
      </p>
      <Button asChild variant="outline" className="h-11">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}
