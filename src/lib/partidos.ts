import { Constants, type Database, type Tables } from "@/types/database";

export type EstadoPartido = Database["public"]["Enums"]["estado_partido"];
export type Condicion = Database["public"]["Enums"]["condicion_partido"];

export const ESTADOS_PARTIDO = Constants.public.Enums.estado_partido;
export const CONDICIONES = Constants.public.Enums.condicion_partido;

/** Lo que se muestra de cada partido. */
export type Partido = Pick<
  Tables<"partidos">,
  | "id"
  | "rival"
  | "fecha_hora"
  | "campo"
  | "condicion"
  | "competicion"
  | "goles_favor"
  | "goles_contra"
  | "estado"
>;

export const NOMBRE_EQUIPO = "Atlético Trelle";

export const NOMBRE_ESTADO_PARTIDO: Record<EstadoPartido, string> = {
  programado: "Programado",
  jugado: "Jugado",
  aplazado: "Aplazado",
};

export const NOMBRE_CONDICION: Record<Condicion, string> = {
  local: "En casa",
  visitante: "Fuera",
};

type Enfrentamiento = {
  rival: string;
  condicion: Condicion;
  goles_favor: number | null;
  goles_contra: number | null;
};

export type Equipo = { nombre: string; goles: number | null; esTrelle: boolean };

/** Los dos equipos en el orden de siempre: primero el que juega en casa. */
export function equipos(partido: Enfrentamiento): [Equipo, Equipo] {
  const trelle = {
    nombre: NOMBRE_EQUIPO,
    goles: partido.goles_favor,
    esTrelle: true,
  };
  const rival = {
    nombre: partido.rival,
    goles: partido.goles_contra,
    esTrelle: false,
  };
  return partido.condicion === "local" ? [trelle, rival] : [rival, trelle];
}

/** "Atlético Trelle – CD Rival", o al revés si el Trelle juega fuera. */
export function titulo(partido: Enfrentamiento) {
  const [local, visitante] = equipos(partido);
  return `${local.nombre} – ${visitante.nombre}`;
}

export type Desenlace = "victoria" | "empate" | "derrota";

/** Cómo le fue al Atlético Trelle, o null si el partido no tiene resultado. */
export function desenlace(partido: Enfrentamiento): Desenlace | null {
  const { goles_favor: favor, goles_contra: contra } = partido;
  if (favor === null || contra === null) {
    return null;
  }
  return favor > contra ? "victoria" : favor < contra ? "derrota" : "empate";
}

export const NOMBRE_DESENLACE: Record<Desenlace, string> = {
  victoria: "Victoria",
  empate: "Empate",
  derrota: "Derrota",
};

/** Clases de color de cada desenlace, en claro y en oscuro. */
export const COLOR_DESENLACE: Record<Desenlace, string> = {
  victoria:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  empate: "bg-muted text-muted-foreground",
  derrota: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};
