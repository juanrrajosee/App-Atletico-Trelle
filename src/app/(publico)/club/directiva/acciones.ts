"use server";

import type { EstadoBorrado } from "@/components/boton-borrar";
import {
  actualizarMiembroEn,
  borrarMiembroDe,
  crearMiembroEn,
} from "../miembros/operaciones";
import type { EstadoFormularioMiembro } from "../miembros/validacion";

export async function crearMiembro(
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  return crearMiembroEn("directiva", anterior, formData);
}

export async function actualizarMiembro(
  id: string,
  anterior: EstadoFormularioMiembro,
  formData: FormData,
): Promise<EstadoFormularioMiembro> {
  return actualizarMiembroEn("directiva", id, anterior, formData);
}

export async function borrarMiembro(id: string): Promise<EstadoBorrado> {
  return borrarMiembroDe("directiva", id);
}
