import {
  CalendarPlus,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Newspaper,
  ShoppingBag,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AvisoVotacion } from "@/components/votaciones/aviso-votacion";
import { Button } from "@/components/ui/button";
import { exigirAdministrador } from "@/lib/auth";
import { formatearFechaCorta } from "@/lib/fechas";
import { titulo, type Partido } from "@/lib/partidos";
import { contar } from "@/lib/textos";
import { cargarClub, cargarDirectiva } from "../club/datos";
import { cargarVotacionesAbiertas } from "../votaciones/datos";
import { cargarPendientes } from "./datos";

export const metadata: Metadata = {
  title: "Gestión",
};

type Aviso = { texto: string; href: string };

export default async function PaginaAdministracion() {
  await exigirAdministrador();

  const [pendientes, abiertas, club, directiva] = await Promise.all([
    cargarPendientes(),
    cargarVotacionesAbiertas(),
    cargarClub(),
    cargarDirectiva(),
  ]);

  // Lo que le falta a la sección del club.
  const faltaClub: Aviso[] = [
    !club.telefono && {
      texto: "Falta el teléfono del club: sin él, la tienda no enseña los botones para pedir presupuesto.",
      href: "/club/editar",
    },
    !club.historia_club && {
      texto: "Falta la historia del club.",
      href: "/club/editar",
    },
    !club.historia_trelle && {
      texto: "Falta la historia de Trelle.",
      href: "/club/editar",
    },
    directiva.length === 0 && {
      texto: "No hay nadie en la directiva.",
      href: "/club/directiva/nuevo",
    },
    !(
      club.titular_nombre &&
      club.titular_cif &&
      club.titular_domicilio &&
      club.email_privacidad
    ) && {
      texto: "Faltan datos legales del club (salen en la privacidad y el aviso legal).",
      href: "/club/editar",
    },
  ].filter((aviso): aviso is Aviso => Boolean(aviso));

  const hayPendientes =
    pendientes.sinResultado.length > 0 ||
    pendientes.sinAlineacion.length > 0 ||
    faltaClub.length > 0;

  return (
    <div className="pagina-estrecha flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestión</h1>
        <p className="text-sm text-muted-foreground">
          Lo que queda por hacer y los atajos para lo de siempre.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Atajo href="/partidos/nuevo" icono={<CalendarPlus aria-hidden />}>
          Partido
        </Atajo>
        <Atajo href="/noticias/nueva" icono={<Newspaper aria-hidden />}>
          Noticia
        </Atajo>
        <Atajo href="/tienda/nuevo" icono={<ShoppingBag aria-hidden />}>
          Producto
        </Atajo>
      </div>

      {abiertas.map((partido) => (
        <AvisoVotacion key={partido.id} partido={partido} />
      ))}

      <section aria-labelledby="titulo-pendiente" className="flex flex-col gap-4">
        <h2 id="titulo-pendiente" className="text-xl font-semibold tracking-tight">
          Pendiente
        </h2>

        {!hayPendientes && (
          <p className="flex items-center gap-2 text-sm">
            <CircleCheck className="size-4 text-emerald-600" aria-hidden />
            Todo al día.
          </p>
        )}

        <ListaPartidos
          encabezado="Partidos sin resultado"
          partidos={pendientes.sinResultado}
          ruta={(id) => `/partidos/${id}/editar`}
        />
        <ListaPartidos
          encabezado="Partidos jugados sin alineación"
          explicacion="Sin alineación no hay votación ni estadísticas."
          partidos={pendientes.sinAlineacion}
          ruta={(id) => `/partidos/${id}/alineacion`}
        />

        {faltaClub.length > 0 && (
          <Grupo titulo="El club">
            {faltaClub.map((aviso) => (
              <FilaAviso key={aviso.texto} href={aviso.href}>
                {aviso.texto}
              </FilaAviso>
            ))}
          </Grupo>
        )}
      </section>

      {(pendientes.borradores > 0 ||
        pendientes.programadas > 0 ||
        pendientes.productosOcultos > 0) && (
        <section aria-labelledby="titulo-sin-publicar" className="flex flex-col gap-4">
          <h2
            id="titulo-sin-publicar"
            className="text-xl font-semibold tracking-tight"
          >
            Sin publicar
          </h2>
          <Grupo>
            {pendientes.borradores > 0 && (
              <FilaAviso href="/noticias">
                {contar(pendientes.borradores, "noticia en borrador", "noticias en borrador")}
              </FilaAviso>
            )}
            {pendientes.programadas > 0 && (
              <FilaAviso href="/noticias">
                {contar(pendientes.programadas, "noticia programada", "noticias programadas")}
              </FilaAviso>
            )}
            {pendientes.productosOcultos > 0 && (
              <FilaAviso href="/tienda">
                {contar(
                  pendientes.productosOcultos,
                  "producto oculto en la tienda",
                  "productos ocultos en la tienda",
                )}
              </FilaAviso>
            )}
          </Grupo>
        </section>
      )}
    </div>
  );
}

function Atajo({
  href,
  icono,
  children,
}: {
  href: string;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <Button asChild variant="outline" className="h-16 flex-col gap-1">
      <Link href={href}>
        {icono}
        <span className="text-xs">
          <span className="sr-only">Añadir </span>
          {children}
        </span>
      </Link>
    </Button>
  );
}

function Grupo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {titulo && (
        <h3 className="titulo-apartado">{titulo}</h3>
      )}
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {children}
      </ul>
    </div>
  );
}

function FilaAviso({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm active:bg-accent"
      >
        <CircleAlert className="size-4 shrink-0 text-amber-600" aria-hidden />
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}

function ListaPartidos({
  encabezado,
  explicacion,
  partidos,
  ruta,
}: {
  encabezado: string;
  explicacion?: string;
  partidos: Partido[];
  ruta: (id: string) => string;
}) {
  if (partidos.length === 0) {
    return null;
  }

  return (
    <Grupo titulo={encabezado}>
      {explicacion && (
        <li className="px-4 py-2 text-xs text-muted-foreground">{explicacion}</li>
      )}
      {partidos.map((partido) => (
        <FilaAviso key={partido.id} href={ruta(partido.id)}>
          <span className="block text-xs text-muted-foreground">
            {formatearFechaCorta(partido.fecha_hora)}
          </span>
          {titulo(partido)}
        </FilaAviso>
      ))}
    </Grupo>
  );
}
