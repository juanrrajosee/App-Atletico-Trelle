/**
 * Cabeceras de seguridad de la aplicación.
 *
 * Las fijas (iguales en todas las respuestas) se ponen en next.config.ts. La
 * Content-Security-Policy cambia en cada petición, porque lleva un nonce: la
 * pone el proxy (src/proxy.ts).
 */

/**
 * Cabeceras fijas para todas las respuestas.
 *
 * - nosniff: el navegador no adivina el tipo de un archivo (que una "imagen"
 *   no se ejecute como script).
 * - Referrer-Policy: a otras webs solo les llega el dominio de la app, nunca
 *   la ruta (por ejemplo, la de un borrador).
 * - X-Frame-Options: nadie puede meter la app dentro de su web (en un iframe)
 *   para engañar a la gente y que pulse donde no quiere. La CSP dice lo mismo
 *   con frame-ancestors; esta es para navegadores antiguos.
 * - Permissions-Policy: la app no usa la cámara, el micrófono ni la ubicación,
 *   así que se le cierran. Elegir una foto del móvil no depende de esto.
 * - HSTS: el navegador solo entra por https durante dos años.
 * - COOP: otra web abierta desde la app (o que abra la app) no puede tocar su
 *   ventana.
 */
export const CABECERAS_SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** Un valor aleatorio distinto en cada petición. */
export function crearNonce() {
  return btoa(crypto.randomUUID());
}

type OpcionesPolitica = {
  nonce: string;
  /** Dirección del proyecto de Supabase: de ahí salen las fotos. */
  urlSupabase: string;
  /** En desarrollo React necesita eval para enseñar bien los errores. */
  desarrollo: boolean;
  /** Si la página se sirve por https (en local se usa http). */
  https: boolean;
};

/**
 * Content-Security-Policy: qué puede cargar y ejecutar cada página.
 *
 * - Scripts: solo los de la propia app que llevan el nonce de esta petición
 *   (Next.js se lo pone a los suyos). Un script metido por un atacante no lo
 *   lleva y no se ejecuta.
 * - Estilos: los de la app, y en línea, porque React y next/image ponen
 *   atributos style. Un estilo no ejecuta código.
 * - Imágenes: de la app, las fotos de Supabase y las vistas previas de la foto
 *   elegida al subirla (blob:).
 * - Formularios: solo a la app. Más Supabase y Google por "Entrar con
 *   Google", que lleva allí al usuario.
 * - Nadie puede meter la app en un iframe (frame-ancestors).
 */
export function politicaDeSeguridad({
  nonce,
  urlSupabase,
  desarrollo,
  https,
}: OpcionesPolitica) {
  const supabase = new URL(urlSupabase).origin;

  const directivas = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desarrollo ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${supabase}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self' ${supabase} https://accounts.google.com`,
    "frame-ancestors 'none'",
    // En local se trabaja por http: pedir https rompería la carga.
    ...(https ? ["upgrade-insecure-requests"] : []),
  ];

  return directivas.join("; ");
}
