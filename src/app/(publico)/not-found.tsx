import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoEncontradoPanel() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <h1 className="text-lg font-semibold">No lo encontramos</h1>
      <p className="text-sm text-muted-foreground">
        Puede que se haya borrado o que el enlace no sea correcto.
      </p>
      <Button asChild variant="outline" className="h-11">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
