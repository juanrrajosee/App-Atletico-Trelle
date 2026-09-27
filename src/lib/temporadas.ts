import { aHoraDeEspana } from "@/lib/fechas";

/** El club se fundó en 2023: su primera temporada fue la 2023/24. */
export const PRIMERA_TEMPORADA = 2023;

/**
 * Temporada a la que pertenece una fecha, por el año en que empieza: del 1
 * de julio al 30 de junio (en hora de España), como inicio_temporada() en
 * la base de datos. 2026 es la 2026/27.
 */
export function temporadaDe(fechaIso: string) {
  const { fecha } = aHoraDeEspana(fechaIso);
  const ano = Number(fecha.slice(0, 4));
  const mes = Number(fecha.slice(5, 7));
  return mes >= 7 ? ano : ano - 1;
}

export function temporadaActual() {
  return temporadaDe(new Date().toISOString());
}

/**
 * La temporada que se pide en la dirección (?temporada=2025), si existe:
 * entre la primera del club y la actual. Si no, la actual.
 */
export function temporadaPedida(valor: string | string[] | undefined) {
  const actual = temporadaActual();
  const pedida = Number(valor);
  return Number.isInteger(pedida) &&
    pedida >= PRIMERA_TEMPORADA &&
    pedida <= actual
    ? pedida
    : actual;
}

/** 2026 → "2026/27". */
export function nombreTemporada(temporada: number) {
  return `${temporada}/${String(temporada + 1).slice(-2)}`;
}
