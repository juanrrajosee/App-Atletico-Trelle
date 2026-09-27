import "server-only";

import type { Partido } from "@/lib/partidos";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type Pendientes = {
  /** Partidos cuya hora ya pasó y siguen sin resultado. */
  sinResultado: Partido[];
  /** Partidos jugados que aún no tienen alineación. */
  sinAlineacion: Partido[];
  borradores: number;
  programadas: number;
  productosOcultos: number;
};

const COLUMNAS_PARTIDO =
  "id, rival, fecha_hora, campo, condicion, competicion, goles_favor, goles_contra, estado";

/**
 * Lo que tiene pendiente el administrador. Solo lo llama el panel, que
 * exige ser administrador: con esa sesión, la RLS deja leerlo todo.
 */
export async function cargarPendientes(): Promise<Pendientes> {
  const supabase = await crearClienteServidor();
  const ahora = new Date().toISOString();

  const [sinResultado, jugados, conAlineacion, borradores, programadas, ocultos] =
    await Promise.all([
      supabase
        .from("partidos")
        .select(COLUMNAS_PARTIDO)
        .eq("estado", "programado")
        .lt("fecha_hora", ahora)
        .order("fecha_hora"),
      supabase
        .from("partidos")
        .select(COLUMNAS_PARTIDO)
        .eq("estado", "jugado")
        .order("fecha_hora", { ascending: false }),
      supabase.from("estadisticas_partido").select("partido_id"),
      supabase
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .is("publicada_en", null),
      supabase
        .from("noticias")
        .select("id", { count: "exact", head: true })
        .gt("publicada_en", ahora),
      supabase
        .from("productos")
        .select("id", { count: "exact", head: true })
        .eq("visible", false),
    ]);

  const error =
    sinResultado.error ??
    jugados.error ??
    conAlineacion.error ??
    borradores.error ??
    programadas.error ??
    ocultos.error;
  if (error) {
    throw new Error(`No se ha podido cargar lo pendiente: ${error.message}`);
  }

  const partidosConAlineacion = new Set(
    (conAlineacion.data ?? []).map(({ partido_id }) => partido_id),
  );

  return {
    sinResultado: sinResultado.data ?? [],
    sinAlineacion: (jugados.data ?? []).filter(
      ({ id }) => !partidosConAlineacion.has(id),
    ),
    borradores: borradores.count ?? 0,
    programadas: programadas.count ?? 0,
    productosOcultos: ocultos.count ?? 0,
  };
}
