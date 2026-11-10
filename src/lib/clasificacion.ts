/**
 * La clasificación de la liga, copiada de la Federación Galega de Fútbol
 * (tabla clasificacion). Aquí solo lo que no depende de la base de datos.
 */

import type { Tables } from "@/types/database";

export type Zona = "ascenso" | "promocion" | "descenso";

export type ResultadoReciente = "G" | "E" | "P";

export const NOMBRE_ZONA: Record<Zona, string> = {
  ascenso: "Ascenso",
  promocion: "Promoción",
  descenso: "Descenso",
};

/** La franja de color de cada zona, en los colores del club. */
export const COLOR_ZONA: Record<Zona, string> = {
  ascenso: "bg-acento",
  promocion: "bg-acento/40",
  descenso: "bg-foreground/50",
};

export const NOMBRE_RESULTADO: Record<ResultadoReciente, string> = {
  G: "Ganado",
  E: "Empatado",
  P: "Perdido",
};

export function esZona(valor: string | null): valor is Zona {
  return valor === "ascenso" || valor === "promocion" || valor === "descenso";
}

/** "GPE" → ["G", "P", "E"]. Lo que no sea G, E o P no se cuenta. */
export function resultadosRecientes(ultimos: string): ResultadoReciente[] {
  return [...ultimos].filter(
    (letra): letra is ResultadoReciente =>
      letra === "G" || letra === "E" || letra === "P",
  );
}

/**
 * Si un equipo de la clasificación es el nuestro. La federación escribe
 * los nombres a su manera ("ATLETICO TRELLE", sin tilde), así que se
 * comparan sin mayúsculas, tildes ni puntos.
 */
export function esEquipoTrelle(equipo: string) {
  const normalizado = equipo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return normalizado === "atletico trelle" || normalizado === "at trelle";
}

/** Una fila de la clasificación, como la enseña la página. */
export type FilaLiga = Pick<
  Tables<"clasificacion">,
  | "id"
  | "posicion"
  | "equipo"
  | "puntos"
  | "jugados"
  | "ganados"
  | "empatados"
  | "perdidos"
  | "sancion"
  | "ultimos"
  | "zona"
  | "actualizada_en"
>;
