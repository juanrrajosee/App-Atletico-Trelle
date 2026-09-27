/** Una cantidad con su palabra en singular o en plural: "1 gol", "3 goles". */
export function contar(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
