import { aHoraDeEspana } from "@/lib/fechas";
import { Constants, type Database } from "@/types/database";

export type CategoriaVotacion =
  Database["public"]["Enums"]["categoria_votacion"];
export type EstadoVotacion = Database["public"]["Enums"]["estado_votacion"];

/** Categorías en el orden en que se muestran. */
export const CATEGORIAS_VOTACION = Constants.public.Enums.categoria_votacion;

export const NOMBRE_CATEGORIA: Record<CategoriaVotacion, string> = {
  mvp: "MVP del partido",
  mejor_suplente: "Mejor suplente",
  compromiso: "Jugador con más compromiso",
};

/** Nombre corto, para el ranking ("3 veces MVP"). */
export const NOMBRE_CORTO_CATEGORIA: Record<CategoriaVotacion, string> = {
  mvp: "MVP",
  mejor_suplente: "mejor suplente",
  compromiso: "el más comprometido",
};

/** A quién se puede votar en cada categoría. */
export const CANDIDATOS_CATEGORIA: Record<CategoriaVotacion, string> = {
  mvp: "Entre los que jugaron.",
  mejor_suplente: "Entre los suplentes que salieron al campo.",
  compromiso: "Entre todos los convocados.",
};

/**
 * Si un jugador de la alineación se puede votar en una categoría. Es la
 * misma regla que es_candidato() en la base de datos, que es la que manda:
 * aquí solo sirve para enseñar la lista de candidatos.
 */
export function esCandidato(
  categoria: CategoriaVotacion,
  { titular, minutos }: { titular: boolean; minutos: number },
) {
  switch (categoria) {
    case "mvp":
      return titular || minutos > 0;
    case "mejor_suplente":
      return !titular && minutos > 0;
    case "compromiso":
      return true;
  }
}

/**
 * Temporada a la que pertenece una fecha, por el año en que empieza: del 1
 * de julio al 30 de junio (en hora de España). 2026 es la 2026/27.
 */
export function temporadaDe(fechaIso: string) {
  const { fecha } = aHoraDeEspana(fechaIso);
  const ano = Number(fecha.slice(0, 4));
  const mes = Number(fecha.slice(5, 7));
  return mes >= 7 ? ano : ano - 1;
}

/** 2026 → "2026/27". */
export function nombreTemporada(temporada: number) {
  return `${temporada}/${String(temporada + 1).slice(-2)}`;
}
