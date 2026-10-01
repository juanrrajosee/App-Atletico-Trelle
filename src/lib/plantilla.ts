import { Constants, type Database } from "@/types/database";

export type Posicion = Database["public"]["Enums"]["posicion_jugador"];
export type EstadoJugador = Database["public"]["Enums"]["estado_jugador"];

/** Posiciones en el orden en que se muestran (de portería a ataque). */
export const POSICIONES = Constants.public.Enums.posicion_jugador;
export const ESTADOS_JUGADOR = Constants.public.Enums.estado_jugador;

export const NOMBRE_POSICION: Record<Posicion, string> = {
  portero: "Portero",
  defensa: "Defensa",
  centrocampista: "Centrocampista",
  delantero: "Delantero",
};

/** Título de cada grupo en el listado de la plantilla. */
export const NOMBRE_POSICION_PLURAL: Record<Posicion, string> = {
  portero: "Porteros",
  defensa: "Defensas",
  centrocampista: "Centrocampistas",
  delantero: "Delanteros",
};

export const NOMBRE_ESTADO: Record<EstadoJugador, string> = {
  disponible: "Disponible",
  lesionado: "Lesionado",
  sancionado: "Sancionado",
  baja: "Baja",
};

/** Clases de color de la etiqueta de cada estado, en claro y en oscuro. */
export const COLOR_ESTADO: Record<EstadoJugador, string> = {
  disponible:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  lesionado: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  sancionado:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  baja: "bg-muted text-muted-foreground",
};
