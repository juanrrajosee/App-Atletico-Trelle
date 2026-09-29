import "server-only";

import { desenlace, type Partido } from "@/lib/partidos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { temporadaDe } from "@/lib/temporadas";
import type { Database } from "@/types/database";

export type EstadisticasJugador =
  Database["public"]["Functions"]["estadisticas_jugadores"]["Returns"][number];

/** Lo que ha hecho cada jugador en una temporada (solo partidos jugados). */
export async function cargarEstadisticas(
  temporada: number,
): Promise<EstadisticasJugador[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("estadisticas_jugadores", {
    p_temporada: temporada,
  });

  if (error) {
    throw new Error(`No se han podido cargar las estadísticas: ${error.message}`);
  }

  return data;
}

export type Balance = {
  jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesFavor: number;
  golesContra: number;
};

/** Balance del equipo con los partidos jugados de una temporada. */
export function calcularBalance(partidos: Partido[], temporada: number): Balance {
  const balance: Balance = {
    jugados: 0,
    victorias: 0,
    empates: 0,
    derrotas: 0,
    golesFavor: 0,
    golesContra: 0,
  };

  for (const partido of partidos) {
    const resultado = desenlace(partido);
    if (
      partido.estado !== "jugado" ||
      !resultado ||
      temporadaDe(partido.fecha_hora) !== temporada
    ) {
      continue;
    }
    balance.jugados += 1;
    balance.golesFavor += partido.goles_favor ?? 0;
    balance.golesContra += partido.goles_contra ?? 0;
    if (resultado === "victoria") balance.victorias += 1;
    if (resultado === "empate") balance.empates += 1;
    if (resultado === "derrota") balance.derrotas += 1;
  }

  return balance;
}
