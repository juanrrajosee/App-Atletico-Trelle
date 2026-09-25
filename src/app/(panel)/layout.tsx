import Link from "next/link";
import { cerrarSesion } from "@/app/(auth)/acciones";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { Button } from "@/components/ui/button";
import { exigirAcceso } from "@/lib/auth";

export default async function LayoutPanel({ children }: LayoutProps<"/">) {
  // El layout no se vuelve a ejecutar al navegar entre páginas, así que cada
  // página comprueba también el acceso por su cuenta (exigirAcceso está
  // memorizada: no repite consultas).
  const usuario = await exigirAcceso();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-semibold tracking-tight">
            Atlético Trelle
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              {usuario.rol === "entrenador" ? "Entrenador" : "Jugador"}
            </span>
            <form action={cerrarSesion}>
              <Button type="submit" variant="ghost" className="h-10">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-24">
        {children}
      </main>

      <NavegacionInferior />
    </div>
  );
}
