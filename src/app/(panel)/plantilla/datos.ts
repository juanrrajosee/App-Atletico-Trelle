import "server-only";

import type { UsuarioActual } from "@/lib/auth";
import type { EstadoJugador, Posicion } from "@/lib/plantilla";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type JugadorListado = {
  id: string;
  nombre: string;
  apellidos: string;
  dorsal: number;
  posicion: Posicion;
  estado: EstadoJugador;
  /** Solo lo sabe el entrenador; para un jugador es null. */
  tieneCuenta: boolean | null;
};

/**
 * La plantilla completa, ordenada por dorsal. El entrenador la lee de la
 * tabla; un jugador, de la vista jugadores_roster, que no incluye ni el
 * teléfono ni la fecha de nacimiento de sus compañeros.
 */
export async function cargarPlantilla(
  usuario: UsuarioActual,
): Promise<JugadorListado[]> {
  const supabase = await crearClienteServidor();

  if (usuario.rol === "entrenador") {
    const { data, error } = await supabase
      .from("jugadores")
      .select("id, nombre, apellidos, dorsal, posicion, estado, perfil_id")
      .order("dorsal");

    if (error) {
      throw new Error(`No se ha podido cargar la plantilla: ${error.message}`);
    }

    return data.map(({ perfil_id, ...jugador }) => ({
      ...jugador,
      tieneCuenta: perfil_id !== null,
    }));
  }

  const { data, error } = await supabase
    .from("jugadores_roster")
    .select("id, nombre, apellidos, dorsal, posicion, estado")
    .order("dorsal");

  if (error) {
    throw new Error(`No se ha podido cargar la plantilla: ${error.message}`);
  }

  // En las vistas, los tipos generados marcan todas las columnas como
  // opcionales aunque en la tabla no lo sean.
  return data.flatMap(({ id, nombre, apellidos, dorsal, posicion, estado }) =>
    id && nombre && apellidos && dorsal && posicion && estado
      ? [{ id, nombre, apellidos, dorsal, posicion, estado, tieneCuenta: null }]
      : [],
  );
}

export type FichaJugador = Omit<JugadorListado, "tieneCuenta"> & {
  /**
   * Teléfono y fecha de nacimiento: solo para el entrenador y para el propio
   * jugador. Para el resto del equipo es null.
   */
  datosPersonales: {
    fechaNacimiento: string | null;
    telefono: string | null;
  } | null;
  /** Cuenta vinculada. Solo lo sabe el entrenador; para un jugador es null. */
  perfilId: string | null;
};

const PATRON_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita mandar a la base de datos un id mal formado (daría un error). */
export function esIdValido(id: string) {
  return PATRON_UUID.test(id);
}

/** La ficha de un jugador, o null si no existe. */
export async function cargarFicha(
  usuario: UsuarioActual,
  id: string,
): Promise<FichaJugador | null> {
  if (!esIdValido(id)) {
    return null;
  }

  const supabase = await crearClienteServidor();
  const esEntrenador = usuario.rol === "entrenador";

  if (esEntrenador || usuario.jugador?.id === id) {
    const { data, error } = await supabase
      .from("jugadores")
      .select(
        "id, nombre, apellidos, dorsal, posicion, estado, fecha_nacimiento, telefono, perfil_id",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`No se ha podido cargar el jugador: ${error.message}`);
    }
    if (!data) {
      return null;
    }

    const { fecha_nacimiento, telefono, perfil_id, ...jugador } = data;
    return {
      ...jugador,
      datosPersonales: { fechaNacimiento: fecha_nacimiento, telefono },
      perfilId: esEntrenador ? perfil_id : null,
    };
  }

  const { data, error } = await supabase
    .from("jugadores_roster")
    .select("id, nombre, apellidos, dorsal, posicion, estado")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se ha podido cargar el jugador: ${error.message}`);
  }
  if (!data?.id || !data.nombre || !data.apellidos || !data.dorsal) {
    return null;
  }
  if (!data.posicion || !data.estado) {
    return null;
  }

  return {
    id: data.id,
    nombre: data.nombre,
    apellidos: data.apellidos,
    dorsal: data.dorsal,
    posicion: data.posicion,
    estado: data.estado,
    datosPersonales: null,
    perfilId: null,
  };
}

export type Cuenta = {
  perfilId: string;
  email: string;
  rol: UsuarioActual["rol"];
  /** Ficha a la que está vinculada, o null si está libre. */
  jugadorId: string | null;
};

/**
 * Cuentas de la aplicación con su email (solo para el entrenador: a
 * cualquier otro la función de la base de datos no le devuelve nada).
 */
export async function cargarCuentas(): Promise<Cuenta[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("cuentas_usuario");

  if (error) {
    throw new Error(`No se han podido cargar las cuentas: ${error.message}`);
  }

  // Los tipos generados dan jugador_id como string, pero sale de un left
  // join: en las cuentas sin vincular llega null.
  return data.map((cuenta) => ({
    perfilId: cuenta.perfil_id,
    email: cuenta.email,
    rol: cuenta.rol,
    jugadorId: (cuenta.jugador_id as string | null) ?? null,
  }));
}

/**
 * Si el jugador aparece en alguna convocatoria, asistencia o estadística.
 * Con historial no se le puede borrar (la base de datos tampoco lo
 * permite): se le da de baja.
 */
export async function tieneHistorial(jugadorId: string): Promise<boolean> {
  const supabase = await crearClienteServidor();
  const contar = (tabla: "convocatorias" | "asistencias" | "estadisticas_partido") =>
    supabase
      .from(tabla)
      .select("id", { count: "exact", head: true })
      .eq("jugador_id", jugadorId);

  const resultados = await Promise.all([
    contar("convocatorias"),
    contar("asistencias"),
    contar("estadisticas_partido"),
  ]);

  for (const { error } of resultados) {
    if (error) {
      throw new Error(`No se ha podido consultar el historial: ${error.message}`);
    }
  }

  return resultados.some(({ count }) => (count ?? 0) > 0);
}
