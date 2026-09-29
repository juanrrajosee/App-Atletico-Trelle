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
