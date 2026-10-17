"use server";

import type { EstadoBorrado } from "@/components/boton-borrar";
import {
  actualizarMiembroEn,
  borrarMiembroDe,
  crearMiembroEn,
} from "../miembros/operaciones";
import type { EstadoFormularioMiembro } from "../miembros/validacion";

export async function crearTecnico(
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  return crearMiembroEn("cuerpo_tecnico", anterior, formData);
}

export async function actualizarTecnico(
  id: string,
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  return actualizarMiembroEn("cuerpo_tecnico", id, anterior, formData);
}

export async function borrarTecnico(id: string): Promise<EstadoBorrado> {
  return borrarMiembroDe("cuerpo_tecnico", id);
}
