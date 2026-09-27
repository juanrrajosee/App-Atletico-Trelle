import "server-only";

import type { EstadoJugador, Posicion } from "@/lib/plantilla";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type Jugador = {
  id: string;
  nombre: string;
  apellidos: string;
  dorsal: number;
  posicion: Posicion;
  /** False si está de baja. */
  activo: boolean;
  /**
   * Estado detallado (lesionado, sancionado…): solo lo ve el administrador.
   * Que un jugador esté lesionado es un dato de salud y no se publica; para
   * el público es null.
   */
  estado: EstadoJugador | null;
};

const COLUMNAS_PUBLICAS = "id, nombre, apellidos, dorsal, posicion, activo";
const COLUMNAS_ADMINISTRADOR = "id, nombre, apellidos, dorsal, posicion, estado";

type FilaPublica = {
  id: string | null;
  nombre: string | null;
  apellidos: string | null;
  dorsal: number | null;
  posicion: Posicion | null;
  activo: boolean | null;
};

/**
 * En las vistas, los tipos generados marcan todas las columnas como
 * opcionales aunque en la tabla no lo sean: aquí se descartan esos casos.
 */
function desdeVistaPublica(fila: FilaPublica): Jugador | null {
  const { id, nombre, apellidos, dorsal, posicion, activo } = fila;
  if (!id || !nombre || !apellidos || !dorsal || !posicion || activo === null) {
    return null;
  }
  return { id, nombre, apellidos, dorsal, posicion, activo, estado: null };
}

/**
 * La plantilla, ordenada por dorsal. El administrador la lee de la tabla (con
 * el estado); el público, de la vista jugadores_publicos.
 */
export async function cargarPlantilla(
  esAdministrador: boolean,
): Promise<Jugador[]> {
  const supabase = await crearClienteServidor();

  if (esAdministrador) {
    const { data, error } = await supabase
      .from("jugadores")
      .select(COLUMNAS_ADMINISTRADOR)
      .order("dorsal");

    if (error) {
      throw new Error(`No se ha podido cargar la plantilla: ${error.message}`);
    }

    return data.map((jugador) => ({
      ...jugador,
      activo: jugador.estado !== "baja",
    }));
  }

  const { data, error } = await supabase
    .from("jugadores_publicos")
    .select(COLUMNAS_PUBLICAS)
    .order("dorsal");

  if (error) {
    throw new Error(`No se ha podido cargar la plantilla: ${error.message}`);
  }

  return data.flatMap((fila) => desdeVistaPublica(fila) ?? []);
}

const PATRON_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita mandar a la base de datos un id mal formado (daría un error). */
export function esIdValido(id: string) {
  return PATRON_UUID.test(id);
}

/** Un jugador, o null si no existe. */
export async function cargarJugador(
  esAdministrador: boolean,
  id: string,
): Promise<Jugador | null> {
  if (!esIdValido(id)) {
    return null;
  }

  const supabase = await crearClienteServidor();

  if (esAdministrador) {
    const { data, error } = await supabase
      .from("jugadores")
      .select(COLUMNAS_ADMINISTRADOR)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`No se ha podido cargar el jugador: ${error.message}`);
    }

    return data && { ...data, activo: data.estado !== "baja" };
  }

  const { data, error } = await supabase
    .from("jugadores_publicos")
    .select(COLUMNAS_PUBLICAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el jugador: ${error.message}`);
  }

  return data && desdeVistaPublica(data);
}

/**
 * Si el jugador tiene estadísticas registradas en algún partido. Con
 * historial no se le puede borrar (la base de datos tampoco lo permite): se
 * le da de baja.
 */
export async function tieneHistorial(jugadorId: string): Promise<boolean> {
  const supabase = await crearClienteServidor();
  const { count, error } = await supabase
    .from("estadisticas_partido")
    .select("id", { count: "exact", head: true })
    .eq("jugador_id", jugadorId);

  if (error) {
    throw new Error(`No se ha podido consultar el historial: ${error.message}`);
  }

  return (count ?? 0) > 0;
}
