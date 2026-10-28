import { urlFotoPublica } from "@/lib/fotos";
import { Constants, type Database } from "@/types/database";

export type Posicion = Database["public"]["Enums"]["posicion_jugador"];
export type EstadoJugador = Database["public"]["Enums"]["estado_jugador"];

/** El bucket de Storage donde están las fotos de los jugadores. */
export const BUCKET_FOTOS_JUGADORES = "jugadores";

/** La dirección pública de la foto de un jugador. */
export function urlFotoJugador(ruta: string) {
  return urlFotoPublica(BUCKET_FOTOS_JUGADORES, ruta);
}

/**
 * El lado más largo, en píxeles, al que se reduce la foto de un jugador antes
 * de subirla. Se ve pequeña (en la lista y en su ficha), así que no hace
 * falta más: pesa unas decenas de KB y la lista carga rápido.
 */
export const LADO_MAXIMO_FOTO_JUGADOR = 640;

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

/**
 * Cómo se ve la etiqueta de cada estado: los que no pueden jugar, en granate
 * o con borde; los demás, en suave.
 */
export const COLOR_ESTADO: Record<EstadoJugador, string> = {
  disponible: "bg-accent text-accent-foreground",
  lesionado: "bg-primary text-primary-foreground",
  sancionado: "border-primary bg-transparent text-primary",
  baja: "bg-muted text-muted-foreground",
};

/**
 * Cómo se llama a un jugador en la aplicación: por su apodo, que es como se
 * le conoce en el club, o por su nombre y apellidos si no tiene.
 */
export function nombreVisible(jugador: {
  nombre: string;
  apellidos: string;
  apodo: string | null;
}) {
  return jugador.apodo ?? `${jugador.nombre} ${jugador.apellidos}`;
}
