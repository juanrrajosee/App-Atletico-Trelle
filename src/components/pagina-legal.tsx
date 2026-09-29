import type { ReactNode } from "react";
import type { Club } from "@/app/(publico)/club/datos";

/** Una página de texto legal: título, fecha de la versión y apartados. */
export function PaginaLegal({
  titulo,
  actualizada,
  children,
}: {
  titulo: string;
  /** Fecha de esta versión del texto, por ejemplo "27 de septiembre de 2026". */
  actualizada: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-6 leading-relaxed">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {actualizada}
        </p>
      </header>
      {children}
    </article>
  );
}

export function Apartado({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Quién es el responsable, con los datos legales del club. Si falta alguno,
 * se dice (el administrador los pone en Club → Editar historia y contacto).
 */
export function DatosTitular({ club }: { club: Club }) {
  const completo =
    club.titular_nombre &&
    club.titular_cif &&
    club.titular_domicilio &&
    club.email_privacidad;

  if (!completo) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        El club todavía no ha completado sus datos legales.
      </p>
    );
  }

  return (
    <ul>
      <li>
        <strong>{club.titular_nombre}</strong>, con CIF {club.titular_cif}.
      </li>
      <li>Domicilio: {club.titular_domicilio}.</li>
      <li>
        Email:{" "}
        <a
          href={`mailto:${club.email_privacidad}`}
          className="underline underline-offset-4"
        >
          {club.email_privacidad}
        </a>
      </li>
    </ul>
  );
}
