/** Un origen que no existe, solo para analizar rutas sueltas. */
const ORIGEN_PROPIO = "https://app.invalid";

/**
 * La ruta a la que volver después de entrar (?siguiente=/partidos/…), solo
 * si es de esta misma aplicación. Si no, el inicio.
 *
 * No basta con mirar que empiece por "/": el navegador quita los tabuladores
 * y saltos de línea de las direcciones y toma "\" por "/", así que
 * "/<tabulador>/otra-web.com" acabaría en otra web. Por eso la ruta se
 * analiza como lo hace él y solo vale si sigue dentro de la aplicación.
 */
export function rutaDeVuelta(valor: unknown): string {
  if (typeof valor !== "string" || !valor.startsWith("/")) {
    return "/";
  }

  let url: URL;
  try {
    url = new URL(valor, ORIGEN_PROPIO);
  } catch {
    return "/";
  }

  if (url.origin !== ORIGEN_PROPIO) {
    return "/";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
