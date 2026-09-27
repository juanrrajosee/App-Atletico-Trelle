"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  validarNoticia,
  type DatosNoticia,
  type EstadoFormularioNoticia,
} from "./validacion";

const NO_ENCONTRADA = "No se ha encontrado la noticia. Puede que se haya borrado.";
const NO_GUARDADA = "No se ha podido guardar la noticia. Inténtalo de nuevo.";

/** Lo que enseña una noticia, en todas las páginas donde aparece. */
function revalidarNoticia(id: string) {
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath(`/noticias/${id}`);
}

/**
 * La fecha de publicación que se guarda: ninguna para un borrador; para una
 * publicada, la que ya tuviera (editar no la cambia) o ahora mismo.
 */
function fechaPublicacion(
  { estado }: DatosNoticia,
  anterior: string | null = null,
) {
  if (estado === "borrador") {
    return null;
  }
  return anterior ?? new Date().toISOString();
}

export async function crearNoticia(
  anterior: EstadoFormularioNoticia,
  formData: FormData,
): Promise<EstadoFormularioNoticia> {
  await exigirAdministrador();

  const validacion = validarNoticia(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const { titulo, resumen, cuerpo } = validacion.datos;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("noticias")
    .insert({
      titulo,
      resumen,
      cuerpo,
      publicada_en: fechaPublicacion(validacion.datos),
    })
    .select("id")
    .single();

  if (error) {
    return responder(anterior, {
      errores: {},
      mensaje: NO_GUARDADA,
      valores: validacion.valores,
    });
  }

  revalidarNoticia(data.id);
  redirect(`/noticias/${data.id}`);
}

export async function actualizarNoticia(
  id: string,
  anterior: EstadoFormularioNoticia,
  formData: FormData,
): Promise<EstadoFormularioNoticia> {
  await exigirAdministrador();

  const validacion = validarNoticia(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const noEncontrada = () =>
    responder(anterior, {
      errores: {},
      mensaje: NO_ENCONTRADA,
      valores: validacion.valores,
    });

  if (!esIdValido(id)) {
    return noEncontrada();
  }

  const supabase = await crearClienteServidor();
  const { data: actual, error: errorActual } = await supabase
    .from("noticias")
    .select("publicada_en")
    .eq("id", id)
    .maybeSingle();

  if (errorActual) {
    return responder(anterior, {
      errores: {},
      mensaje: NO_GUARDADA,
      valores: validacion.valores,
    });
  }
  if (!actual) {
    return noEncontrada();
  }

  const { titulo, resumen, cuerpo } = validacion.datos;
  const { error } = await supabase
    .from("noticias")
    .update({
      titulo,
      resumen,
      cuerpo,
      publicada_en: fechaPublicacion(validacion.datos, actual.publicada_en),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return error.code === "PGRST116"
      ? noEncontrada()
      : responder(anterior, {
          errores: {},
          mensaje: NO_GUARDADA,
          valores: validacion.valores,
        });
  }

  revalidarNoticia(id);
  redirect(`/noticias/${id}`);
}

export async function borrarNoticia(noticiaId: string): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(noticiaId)) {
    return { error: NO_ENCONTRADA };
  }

  const supabase = await crearClienteServidor();
  const { error, count } = await supabase
    .from("noticias")
    .delete({ count: "exact" })
    .eq("id", noticiaId);

  if (error) {
    return { error: "No se ha podido borrar la noticia. Inténtalo de nuevo." };
  }
  if (count === 0) {
    return { error: NO_ENCONTRADA };
  }

  revalidarNoticia(noticiaId);
  redirect("/noticias");
}
