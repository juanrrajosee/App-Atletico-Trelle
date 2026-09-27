import { Mail, MapPin, Pencil, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Texto } from "@/components/texto";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import { cargarClub, cargarDirectiva, type MiembroDirectiva } from "./datos";

export const metadata: Metadata = {
  title: "El club",
};

export default async function PaginaClub() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const [club, directiva] = await Promise.all([cargarClub(), cargarDirectiva()]);

  const hayContacto = Boolean(club.email || club.telefono || club.campo);
  const vacio =
    !club.historia_club &&
    !club.historia_trelle &&
    directiva.length === 0 &&
    !hayContacto;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Atlético Trelle
        </h1>
        {administrador && (
          <Button asChild variant="outline" className="h-11">
            <Link href="/club/editar">
              <Pencil aria-hidden />
              Editar historia y contacto
            </Link>
          </Button>
        )}
      </div>

      {vacio && !administrador && (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no hay información del club.
        </p>
      )}

      <Seccion
        titulo="Historia del club"
        texto={club.historia_club}
        vacio="Todavía no se ha escrito la historia del club."
        administrador={administrador}
      />
      <Seccion
        titulo="Trelle"
        texto={club.historia_trelle}
        vacio="Todavía no se ha escrito la historia de Trelle."
        administrador={administrador}
      />

      {(directiva.length > 0 || administrador) && (
        <Directiva directiva={directiva} />
      )}

      {hayContacto && (
        <section aria-labelledby="titulo-contacto" className="flex flex-col gap-3">
          <h2 id="titulo-contacto" className="text-xl font-semibold tracking-tight">
            Contacto
          </h2>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {club.telefono && (
              <FilaContacto
                icono={<Phone className="size-4" aria-hidden />}
                href={`tel:${club.telefono.replace(/\s/g, "")}`}
              >
                {club.telefono}
              </FilaContacto>
            )}
            {club.email && (
              <FilaContacto
                icono={<Mail className="size-4" aria-hidden />}
                href={`mailto:${club.email}`}
              >
                {club.email}
              </FilaContacto>
            )}
            {club.campo && (
              <FilaContacto icono={<MapPin className="size-4" aria-hidden />}>
                {club.campo}
              </FilaContacto>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Un texto del club. Si no se ha escrito, el público no ve nada y el
 * administrador ve qué falta.
 */
function Seccion({
  titulo,
  texto,
  vacio,
  administrador,
}: {
  titulo: string;
  texto: string | null;
  vacio: string;
  administrador: boolean;
}) {
  if (!texto && !administrador) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>
      {texto ? (
        <Texto texto={texto} />
      ) : (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {vacio}
        </p>
      )}
    </section>
  );
}

function Directiva({ directiva }: { directiva: MiembroDirectiva[] }) {
  return (
    <section aria-labelledby="titulo-directiva" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="titulo-directiva" className="text-xl font-semibold tracking-tight">
          Directiva
        </h2>
      </div>

      {directiva.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Todavía no se ha añadido a nadie de la directiva.
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {directiva.map((miembro) => {
            const contenido = (
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-muted-foreground">
                  {miembro.cargo}
                </span>
                <span className="font-medium">{miembro.nombre}</span>
              </span>
            );
            return (
              <li key={miembro.id}>
                <div className="flex min-h-14 items-center px-4 py-2">
                  {contenido}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FilaContacto({
  icono,
  href,
  children,
}: {
  icono: ReactNode;
  href?: string;
  children: ReactNode;
}) {
  const contenido = (
    <>
      <span className="text-muted-foreground">{icono}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a
          href={href}
          className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm active:bg-accent"
        >
          {contenido}
        </a>
      ) : (
        <div className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm">
          {contenido}
        </div>
      )}
    </li>
  );
}
