import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, DatosTitular, PaginaLegal } from "@/components/pagina-legal";
import { cargarClub } from "../club/datos";

export const metadata: Metadata = {
  title: "Aviso legal",
};

export default async function PaginaAvisoLegal() {
  const club = await cargarClub();

  return (
    <PaginaLegal titulo="Aviso legal" actualizada="27 de septiembre de 2026">
      <Apartado titulo="Titular">
        <DatosTitular club={club} />
      </Apartado>

      <Apartado titulo="Para qué es esta aplicación">
        <p>
          Es la aplicación del club para la afición: calendario y resultados,
          plantilla y estadísticas, votaciones después de cada partido,
          noticias, información del club y una tienda. En la tienda no se
          compra nada en línea: se pide presupuesto al club por teléfono o por
          WhatsApp, y los precios que se muestran son orientativos.
        </p>
      </Apartado>

      <Apartado titulo="Condiciones de uso">
        <ul>
          <li>
            Cualquiera puede consultar la aplicación sin registrarse. La cuenta
            es personal y solo sirve para votar.
          </li>
          <li>
            Cada persona vota con su propia cuenta. El club puede borrar las
            cuentas creadas para votar varias veces o para hacer un mal uso
            de la aplicación.
          </li>
          <li>
            Los resultados, clasificaciones y estadísticas los registra el
            club y tienen carácter informativo: los oficiales son los de la
            federación.
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Propiedad intelectual">
        <p>
          Los textos, fotos y demás contenidos de la aplicación son del club o
          se publican con permiso de sus autores. No se pueden reutilizar sin
          autorización del club.
        </p>
      </Apartado>

      <Apartado titulo="Datos personales">
        <p>
          Cómo se tratan los datos personales se explica en la{" "}
          <Link href="/privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>
      </Apartado>

      <Apartado titulo="Legislación">
        <p>Este aviso se rige por la legislación española.</p>
      </Apartado>
    </PaginaLegal>
  );
}
