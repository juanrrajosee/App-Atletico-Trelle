import "server-only";

import { cache } from "react";
import { esIdValido } from "@/lib/ids";
import type { Partido } from "@/lib/partidos";
import { POSICIONES, type Posicion } from "@/lib/plantilla";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tables } from "@/types/database";

const COLUMNAS_PARTIDO =
  "id, rival, fecha_hora, campo, condicion, competicion, goles_favor, goles_contra, estado";

/** Todos los partidos, del más antiguo al más reciente. */
export async function cargarPartidos(): Promise<Partido[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("partidos")
    .select(COLUMNAS_PARTIDO)
    .order("fecha_hora");

  if (error) {
    throw new Error(`No se han podido cargar los partidos: ${error.message}`);
  }

  return data;
}

/**
 * Un partido, o null si no existe. Con cache: la página y sus metadatos lo
 * piden en la misma petición y solo se consulta una vez.
 */
export const cargarPartido = cache(async function cargarPartido(
  id: string,
): Promise<Partido | null> {
  if (!esIdValido(id)) {
    return null;
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("partidos")
    .select(COLUMNAS_PARTIDO)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el partido: ${error.message}`);
  }

  return data;
});

/**
 * El partido jugado más reciente (el último resultado), o null si todavía
 * no se ha jugado ninguno.
 */
export async function cargarUltimoResultado(): Promise<Partido | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("partidos")
    .select(COLUMNAS_PARTIDO)
    .eq("estado", "jugado")
    .order("fecha_hora", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el último resultado: ${error.message}`);
  }

  return data;
}

/**
 * El próximo partido por jugar, o null si no hay ninguno programado.
 */
export async function cargarProximoPartido(): Promise<Partido | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("partidos")
    .select(COLUMNAS_PARTIDO)
    .eq("estado", "programado")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el próximo partido: ${error.message}`);
  }

  return data;
}

/** Lo que hizo un jugador en un partido, con los datos públicos del jugador. */
export type Participacion = Pick<
  Tables<"estadisticas_partido">,
  | "jugador_id"
  | "titular"
  | "minutos"
  | "goles"
  | "asistencias"
  | "tarjetas_amarillas"
  | "tarjeta_roja"
> & {
  nombre: string;
  apellidos: string;
  apodo: string | null;
  dorsal: number;
  posicion: Posicion;
};

/**
 * La alineación de un partido: titulares y luego suplentes, cada grupo de
 * portería a ataque y por dorsal. Vacía si no se ha registrado.
 *
 * Los nombres salen de jugadores_publicos, que también incluye a los que ya
 * están de baja: su historial se sigue viendo.
 */
export async function cargarAlineacion(
  partidoId: string,
): Promise<Participacion[]> {
  const supabase = await crearClienteServidor();
  const { data: filas, error } = await supabase
    .from("estadisticas_partido")
    .select(
      "jugador_id, titular, minutos, goles, asistencias, tarjetas_amarillas, tarjeta_roja",
    )
    .eq("partido_id", partidoId);

  if (error) {
    throw new Error(`No se ha podido cargar la alineación: ${error.message}`);
  }
  if (filas.length === 0) {
    return [];
  }

  const { data: jugadores, error: errorJugadores } = await supabase
    .from("jugadores_publicos")
    .select("id, nombre, apellidos, apodo, dorsal, posicion")
    .in(
      "id",
      filas.map((fila) => fila.jugador_id),
    );

  if (errorJugadores) {
    throw new Error(
      `No se ha podido cargar la alineación: ${errorJugadores.message}`,
    );
  }

  const porId = new Map(jugadores.map((jugador) => [jugador.id, jugador]));

  return filas
    .flatMap((fila) => {
      const jugador = porId.get(fila.jugador_id);
      // En las vistas, los tipos generados marcan todo como opcional.
      if (
        !jugador?.nombre ||
        !jugador.apellidos ||
        !jugador.dorsal ||
        !jugador.posicion
      ) {
        return [];
      }
      return [
        {
          ...fila,
          nombre: jugador.nombre,
          apellidos: jugador.apellidos,
          apodo: jugador.apodo,
          dorsal: jugador.dorsal,
          posicion: jugador.posicion,
        },
      ];
    })
    .sort(
      (a, b) =>
        Number(b.titular) - Number(a.titular) ||
        POSICIONES.indexOf(a.posicion) - POSICIONES.indexOf(b.posicion) ||
        a.dorsal - b.dorsal,
    );
}

export type JugadorAlineacion = Pick<
  Tables<"jugadores">,
  "id" | "nombre" | "apellidos" | "apodo" | "dorsal" | "posicion" | "estado"
>;

export type FilaGuardada = Pick<
  Tables<"estadisticas_partido">,
  | "jugador_id"
  | "titular"
  | "minutos"
  | "goles"
  | "asistencias"
  | "tarjetas_amarillas"
  | "tarjeta_roja"
>;

/**
 * Para el editor de la alineación (solo el administrador): los jugadores
 * que se pueden alinear, de portería a ataque y por dorsal, y lo que ya
 * hay guardado. Se pueden alinear los que están en la plantilla y, además,
 * los que ya estaban en esta alineación aunque luego se hayan dado de baja.
 */
export async function cargarEditorAlineacion(partidoId: string): Promise<{
  jugadores: JugadorAlineacion[];
  filas: FilaGuardada[];
}> {
  const supabase = await crearClienteServidor();
  const [jugadores, filas] = await Promise.all([
    supabase
      .from("jugadores")
      .select("id, nombre, apellidos, apodo, dorsal, posicion, estado")
      .order("dorsal"),
    supabase
      .from("estadisticas_partido")
      .select(
        "jugador_id, titular, minutos, goles, asistencias, tarjetas_amarillas, tarjeta_roja",
      )
      .eq("partido_id", partidoId),
  ]);

  if (jugadores.error || filas.error) {
    const error = jugadores.error ?? filas.error;
    throw new Error(`No se ha podido cargar la alineación: ${error?.message}`);
  }

  const alineados = new Set(filas.data.map((fila) => fila.jugador_id));

  return {
    jugadores: jugadores.data
      .filter((jugador) => jugador.estado !== "baja" || alineados.has(jugador.id))
      .sort(
        (a, b) =>
          POSICIONES.indexOf(a.posicion) - POSICIONES.indexOf(b.posicion) ||
          a.dorsal - b.dorsal,
      ),
    filas: filas.data,
  };
}
