import {
  ChevronRight,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Escudo } from "@/components/escudo";
import { PestanasClub } from "@/components/pestanas";
import { Texto } from "@/components/texto";
import { Button } from "@/components/ui/button";
import { esAdministrador, obtenerUsuarioActual } from "@/lib/auth";
import {
  cargarClub,
  cargarCuerpoTecnico,
  cargarDirectiva,
  type MiembroDirectiva,
} from "./datos";

export const metadata: Metadata = {
  title: "El club",
};

export default async function PaginaClub() {
  const administrador = esAdministrador(await obtenerUsuarioActual());
  const [club, directiva, cuerpoTecnico] = await Promise.all([
    cargarClub(),
    cargarDirectiva(),
    cargarCuerpoTecnico(),
  ]);

  const hayContacto = Boolean(club.email || club.telefono || club.campo);
  const vacio =
    !club.historia_club &&
    !club.historia_trelle &&
    directiva.length === 0 &&
    cuerpoTecnico.length === 0 &&
    !hayContacto;

  return (
    <div className="flex flex-col gap-8">
      <PestanasClub activa="/club" />

      <div className="-mt-2 flex flex-col gap-4">
        {/* Como los carteles del club: el escudo sobre los dos granates. */}
        <header className="fondo-camiseta flex items-center gap-4 rounded-2xl p-5 text-white shadow-sm">
          <Escudo tamano={72} decorativo />
          <div className="min-w-0">
            <h1 className="text-3xl leading-tight font-semibold uppercase">
              Atlético Trelle
            </h1>
            <p className="text-sm text-white/80">#FamiliaRoxibranca</p>
          </div>
        </header>
        {administrador && (
          <Button asChild variant="outline" className="h-11 lg:w-fit">
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

      {/* En el ordenador, la historia a un lado; la directiva, el cuerpo
          técnico y el contacto, al otro. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-8">
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
        </div>

        <div className="flex flex-col gap-8">
          {(directiva.length > 0 || administrador) && (
            <ListaPersonas
              id="directiva"
              titulo="Directiva"
              personas={directiva}
              administrador={administrador}
              rutaBase="/club/directiva"
              vacio="Todavía no se ha añadido a nadie de la directiva."
              paraQuien="a la directiva"
            />
          )}

          {(cuerpoTecnico.length > 0 || administrador) && (
            <ListaPersonas
              id="cuerpo-tecnico"
              titulo="Cuerpo técnico"
              personas={cuerpoTecnico}
              administrador={administrador}
              rutaBase="/club/cuerpo-tecnico"
              vacio="Todavía no se ha añadido a nadie del cuerpo técnico."
              paraQuien="al cuerpo técnico"
            />
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
      </div>
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

/**
 * Una lista de personas con su cargo (la directiva o el cuerpo técnico). El
 * administrador añade y entra a editar a cada una; el público solo la lee.
 */
function ListaPersonas({
  id,
  titulo,
  personas,
  administrador,
  rutaBase,
  vacio,
  paraQuien,
}: {
  id: string;
  titulo: string;
  personas: MiembroDirectiva[];
  administrador: boolean;
  /** Dónde se añade (rutaBase/nuevo) y se edita (rutaBase/<id>/editar). */
  rutaBase: string;
  vacio: string;
  /** Para el nombre accesible del botón: "Añadir a la directiva". */
  paraQuien: string;
}) {
  return (
    <section aria-labelledby={`titulo-${id}`} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id={`titulo-${id}`} className="text-xl font-semibold tracking-tight">
          {titulo}
        </h2>
        {administrador && (
          <Button asChild variant="outline" className="h-10">
            <Link href={`${rutaBase}/nuevo`}>
              <Plus aria-hidden />
              Añadir<span className="sr-only"> {paraQuien}</span>
            </Link>
          </Button>
        )}
      </div>

      {personas.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {vacio}
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {personas.map((persona) => {
            const contenido = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <UserRound className="size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="titulo-apartado text-xs">{persona.cargo}</span>
                  <span className="font-medium">{persona.nombre}</span>
                </span>
              </>
            );
            return (
              <li key={persona.id}>
                {/* El administrador entra a editar; el público solo lo lee. */}
                {administrador ? (
                  <Link
                    href={`${rutaBase}/${persona.id}/editar`}
                    className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-accent"
                  >
                    {contenido}
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                ) : (
                  <div className="flex min-h-14 items-center gap-3 px-4 py-2">
                    {contenido}
                  </div>
                )}
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
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icono}
      </span>
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
