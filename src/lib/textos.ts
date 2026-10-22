/** Una cantidad con su palabra en singular o en plural: "1 gol", "3 goles". */
export function contar(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/** Los párrafos de un texto: se separan con una línea en blanco. */
export function parrafos(texto: string) {
  return texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean);
}

/**
 * Una línea que resume un texto largo, hecha con su propio principio: hasta
 * donde termine una frase si cabe (y pasa de los 40 caracteres) o, si no,
 * cortado en una palabra entera con puntos suspensivos. No añade nada que no
 * esté en el texto.
 */
export function extracto(texto: string, maximo = 140) {
  const plano = texto.replace(/\s+/g, " ").trim();
  if (plano.length <= maximo) {
    return plano;
  }

  const ventana = plano.slice(0, maximo + 1);
  const fin = /[.!?…](?=\s)/g;
  let finDeFrase = -1;
  for (const coincidencia of ventana.matchAll(fin)) {
    if (coincidencia.index >= 40 && coincidencia.index < maximo) {
      finDeFrase = coincidencia.index;
    }
  }
  if (finDeFrase >= 0) {
    return plano.slice(0, finDeFrase + 1);
  }

  const corte = ventana.lastIndexOf(" ");
  const trozo = plano.slice(0, corte > 0 ? corte : maximo);
  return `${trozo.replace(/[\s,;:.\-–—]+$/, "")}…`;
}
