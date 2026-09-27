import type { Metadata } from "next";
import { Apartado, DatosTitular, PaginaLegal } from "@/components/pagina-legal";
import { cargarClub } from "../club/datos";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default async function PaginaPrivacidad() {
  const club = await cargarClub();
  const email = club.email_privacidad;

  return (
    <PaginaLegal titulo="Política de privacidad" actualizada="27 de septiembre de 2026">
      <p>
        Esta aplicación es del club y la puede usar cualquiera sin cuenta. Aquí
        se explica qué datos personales trata, para qué y qué derechos tienes.
      </p>

      <Apartado titulo="Quién es el responsable">
        <DatosTitular club={club} />
      </Apartado>

      <Apartado titulo="Qué datos tratamos">
        <ul>
          <li>
            <strong>Si usas la aplicación sin cuenta</strong>, ninguno: no
            usamos cookies de análisis ni de publicidad.
          </li>
          <li>
            <strong>Si creas una cuenta</strong>: tu email y tu contraseña
            (guardada cifrada: nadie puede leerla). Si entras con Google,
            Google nos da tu email y tu nombre.
          </li>
          <li>
            <strong>Tus votos</strong>: a quién votas en cada partido. Solo se
            publican los totales; nadie, tampoco el club, puede ver a quién
            has votado tú.
          </li>
          <li>
            <strong>Una cookie de sesión</strong>, imprescindible para que
            sigas dentro de tu cuenta.
          </li>
          <li>
            <strong>De los jugadores y de la directiva</strong>: nombre,
            dorsal, posición, estadísticas de los partidos y cargo, que el
            club publica con su conformidad. No se publica ningún dato de
            salud (por ejemplo, si un jugador está lesionado).
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Para qué y con qué base legal">
        <ul>
          <li>
            Gestionar tu cuenta y que puedas votar, porque lo pides al crearla
            (artículo 6.1.b del RGPD).
          </li>
          <li>
            Publicar los resultados y los rankings de las votaciones, siempre
            como totales, sin identificar a nadie.
          </li>
          <li>
            Publicar la plantilla, las estadísticas y la directiva, con el
            consentimiento de cada persona (artículo 6.1.a del RGPD).
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Cuánto tiempo">
        <p>
          Tus datos se guardan mientras tengas la cuenta. Si la borras, tus
          votos siguen contando en los resultados, pero ya sin ninguna
          relación contigo.
        </p>
      </Apartado>

      <Apartado titulo="Quién más los trata">
        <p>
          No vendemos ni cedemos tus datos a nadie. Para funcionar, la
          aplicación usa estos proveedores, que los tratan por encargo del
          club:
        </p>
        <ul>
          <li>Supabase: base de datos, cuentas y fotos de la tienda.</li>
          <li>Vercel: alojamiento de la aplicación.</li>
          <li>
            El servicio de correo que envía los emails de confirmación y de
            cambio de contraseña.
          </li>
        </ul>
        <p>
          Si entras con Google, Google trata tus datos según su propia
          política. Algunos de estos proveedores son de Estados Unidos: en ese
          caso los datos salen de la Unión Europea con las garantías que exige
          el RGPD (el Marco de Privacidad de Datos UE-EE. UU. o cláusulas
          contractuales tipo).
        </p>
      </Apartado>

      <Apartado titulo="Tus derechos">
        <p>
          Puedes pedir acceder a tus datos, corregirlos, borrarlos, oponerte a
          su uso, limitarlo o llevártelos
          {email ? (
            <>
              , escribiendo a{" "}
              <a href={`mailto:${email}`} className="underline underline-offset-4">
                {email}
              </a>
            </>
          ) : (
            " escribiendo al club"
          )}
          .
        </p>
        <p>
          Si crees que no se han respetado tus derechos, puedes reclamar ante
          la Agencia Española de Protección de Datos (
          <a
            href="https://www.aepd.es"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            aepd.es
          </a>
          ).
        </p>
      </Apartado>

      <Apartado titulo="Menores">
        <p>Para crear una cuenta hay que tener 14 años o más.</p>
      </Apartado>

      <Apartado titulo="Cookies">
        <p>
          Solo se usa la cookie de sesión, que es técnica e imprescindible
          para mantener abierta tu cuenta. Por eso no hace falta aceptarla. No
          hay cookies de análisis ni de publicidad.
        </p>
      </Apartado>
    </PaginaLegal>
  );
}
