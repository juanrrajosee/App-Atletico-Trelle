import "server-only";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tables } from "@/types/database";

export type Club = Pick<
  Tables<"club">,
  | "historia_club"
  | "historia_trelle"
  | "email"
  | "telefono"
  | "campo"
  | "titular_nombre"
  | "titular_cif"
  | "titular_domicilio"
  | "email_privacidad"
>;

export type MiembroDirectiva = Pick<
  Tables<"directiva">,
  "id" | "nombre" | "cargo" | "orden"
>;

/** Igual que la directiva: nombre, cargo y su posición en la lista. */
export type MiembroCuerpoTecnico = Pick<
  Tables<"cuerpo_tecnico">,
  "id" | "nombre" | "cargo" | "orden"
>;

/** La información del club (la fila única de la tabla club). */
export async function cargarClub(): Promise<Club> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("club")
    .select(
      "historia_club, historia_trelle, email, telefono, campo, titular_nombre, titular_cif, titular_domicilio, email_privacidad",
    )
    .single();

  if (error) {
    throw new Error(`No se ha podido cargar el club: ${error.message}`);
  }

  return data;
}

/** La directiva, en su orden (y por nombre si dos tienen el mismo). */
export async function cargarDirectiva(): Promise<MiembroDirectiva[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("directiva")
    .select("id, nombre, cargo, orden")
    .order("orden")
    .order("nombre");

  if (error) {
    throw new Error(`No se ha podido cargar la directiva: ${error.message}`);
  }

  return data;
}

/** El cuerpo técnico, en su orden (y por nombre si dos tienen el mismo). */
export async function cargarCuerpoTecnico(): Promise<MiembroCuerpoTecnico[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("cuerpo_tecnico")
    .select("id, nombre, cargo, orden")
    .order("orden")
    .order("nombre");

  if (error) {
    throw new Error(`No se ha podido cargar el cuerpo técnico: ${error.message}`);
  }

  return data;
}
