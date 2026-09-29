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
