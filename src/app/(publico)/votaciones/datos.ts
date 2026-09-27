import "server-only";

import type { UsuarioActual } from "@/lib/auth";
import type { Partido } from "@/lib/partidos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { CategoriaVotacion, EstadoVotacion } from "@/lib/votaciones";

export type Votacion = { estado: EstadoVotacion; cierre: string };

/** En qué punto está la votación de un partido y cuándo se cierra. */
export async function cargarVotacion(partidoId: string): Promise<Votacion> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .rpc("consultar_votacion", { p_partido_id: partidoId })
    .single();

  if (error) {
    throw new Error(`No se ha podido consultar la votación: ${error.message}`);
  }

  return data;
}

/**
 * A quién ha votado la cuenta actual en cada categoría de un partido. La
 * RLS solo le deja leer sus propios votos.
 */
export async function cargarMisVotos(
  usuario: UsuarioActual | null,
  partidoId: string,
): Promise<Partial<Record<CategoriaVotacion, string>>> {
  if (!usuario) {
    return {};
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("votos")
    .select("categoria, jugador_id")
    .eq("partido_id", partidoId)
    .eq("perfil_id", usuario.id);

  if (error) {
    throw new Error(`No se han podido cargar tus votos: ${error.message}`);
  }

  return Object.fromEntries(
    data.map(({ categoria, jugador_id }) => [categoria, jugador_id]),
  );
}

export type ResultadoVotacion = {
  categoria: CategoriaVotacion;
  jugador_id: string;
  votos: number;
};

/**
 * Recuento de la votación de un partido, de más a menos votos en cada
 * categoría. Vacío mientras la votación no se ha cerrado.
 */
export async function cargarResultados(
  partidoId: string,
): Promise<ResultadoVotacion[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("resultados_votacion", {
    p_partido_id: partidoId,
  });

  if (error) {
    throw new Error(`No se han podido cargar los resultados: ${error.message}`);
  }

  return data;
}

export type PuestoRanking = {
  categoria: CategoriaVotacion;
  jugador_id: string;
  victorias: number;
  votos: number;
};

/** Ranking de una temporada, ya ordenado en cada categoría. */
export async function cargarRanking(
  temporada: number,
): Promise<PuestoRanking[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("ranking_votaciones", {
    p_temporada: temporada,
  });

  if (error) {
    throw new Error(`No se ha podido cargar el ranking: ${error.message}`);
  }

  return data;
}

/**
 * Los partidos con la votación abierta ahora mismo (normalmente ninguno o
 * uno). Solo pueden ser partidos jugados en las últimas 24 horas: la
 * votación se cierra a medianoche del día del partido.
 */
export async function cargarVotacionesAbiertas(): Promise<Partido[]> {
  const supabase = await crearClienteServidor();
  const ahora = new Date();
  const { data, error } = await supabase
    .from("partidos")
    .select(
      "id, rival, fecha_hora, campo, condicion, competicion, goles_favor, goles_contra, estado",
    )
    .eq("estado", "jugado")
    .lte("fecha_hora", ahora.toISOString())
    .gte(
      "fecha_hora",
      new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    )
    .order("fecha_hora", { ascending: false });

  if (error) {
    throw new Error(`No se han podido cargar las votaciones: ${error.message}`);
  }

  const votaciones = await Promise.all(
    data.map((partido) => cargarVotacion(partido.id)),
  );

  return data.filter((_, indice) => votaciones[indice].estado === "abierta");
}

/** Nombre y apellidos de unos jugadores, por su id (también los de baja). */
export async function cargarNombres(
  ids: string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("jugadores_publicos")
    .select("id, nombre, apellidos")
    .in("id", ids);

  if (error) {
    throw new Error(`No se han podido cargar los jugadores: ${error.message}`);
  }

  return new Map(
    data.flatMap(({ id, nombre, apellidos }) =>
      id && nombre && apellidos ? [[id, `${nombre} ${apellidos}`]] : [],
    ),
  );
}
