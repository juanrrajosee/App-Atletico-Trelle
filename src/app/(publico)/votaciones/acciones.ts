"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { obtenerUsuarioActual } from "@/lib/auth";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { CATEGORIAS_VOTACION, type CategoriaVotacion } from "@/lib/votaciones";

export type EstadoVoto = { error: string | null };

const esquemaVoto = z.object({
  partidoId: z.string().refine(esIdValido),
  categoria: z.enum(CATEGORIAS_VOTACION),
  jugadorId: z.string().refine(esIdValido),
});

/**
 * Vota a un jugador en una categoría de un partido. Las reglas (votación
 * abierta, candidato válido, un solo voto) las impone la base de datos.
 */
export async function votar(
  partidoId: string,
  categoria: CategoriaVotacion,
  _anterior: EstadoVoto,
  jugadorId: string,
): Promise<EstadoVoto> {
  if (!(await obtenerUsuarioActual())) {
    return { error: "Entra con tu cuenta para votar." };
  }

  const voto = esquemaVoto.safeParse({ partidoId, categoria, jugadorId });
  if (!voto.success) {
    return { error: "Elige a un jugador." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("votar", {
    p_partido_id: voto.data.partidoId,
    p_categoria: voto.data.categoria,
    p_jugador_id: voto.data.jugadorId,
  });

  if (error) {
    // P0001: las reglas de la votación, con un texto para el usuario.
    if (error.code === "P0001") {
      return { error: error.message };
    }
    // 23505: dos votos a la vez desde la misma cuenta; ya contaba el otro.
    if (error.code === "23505") {
      return { error: "Ya has votado en esta categoría." };
    }
    return { error: "No se ha podido guardar tu voto. Inténtalo de nuevo." };
  }

  revalidatePath(`/partidos/${voto.data.partidoId}`);
  return { error: null };
}
