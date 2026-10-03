import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ListaNoticias,
  NoticiaDestacada,
} from "@/components/noticias/lista-noticias";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { estadoNoticia } from "@/lib/noticias";
import { cargarNoticias } from "./datos";

export const metadata: Metadata = {
  title: "Noticias",
};

export default async function PaginaNoticias() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const noticias = await cargarNoticias(administrador);
  // La más reciente va destacada. Al administrador le pueden salir antes
  // borradores o programadas: entonces no se destaca ninguna.
  const [primera, ...resto] = noticias;
  const destacada =
    primera && estadoNoticia(primera) === "publicada" ? primera : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Noticias</h1>
        {administrador && (
          <Button asChild className="h-11">
            <Link href="/noticias/nueva">
              <Plus aria-hidden />
              Nueva
            </Link>
          </Button>
        )}
      </div>

      {noticias.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay noticias.
        </p>
      ) : destacada ? (
        // En el ordenador, la destacada a un lado y el resto al otro.
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <NoticiaDestacada noticia={destacada} />
          {resto.length > 0 && <ListaNoticias noticias={resto} />}
        </div>
      ) : (
        <ListaNoticias noticias={noticias} />
      )}
    </div>
  );
}
