"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { BUCKET_FOTOS_NOTICIAS } from "@/lib/noticias";
import { borrarFotos, subirFoto } from "@/lib/supabase/fotos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  validarNoticia,
  type DatosNoticia,
  type EstadoFormularioNoticia,
} from "./validacion";

const NO_ENCONTRADA = "No se ha encontrado la noticia. Puede que se haya borrado.";
const NO_GUARDADA = "No se ha podido guardar la noticia. Inténtalo de nuevo.";
const FOTO_NO_SUBIDA = "No se ha podido subir la foto. Inténtalo de nuevo.";

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

  const validacion = await validarNoticia(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }

  const { datos, foto, valores } = validacion;
  const supabase = await crearClienteServidor();
  // El id se elige aquí para subir la foto a su carpeta antes de crear la
  // noticia: así nunca queda una noticia a medias.
  const id = randomUUID();
  const rutaFoto = foto
    ? await subirFoto(supabase, BUCKET_FOTOS_NOTICIAS, id, foto)
    : null;
  if (foto && !rutaFoto) {
    return responder(anterior, {
      errores: { foto: FOTO_NO_SUBIDA },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  const { error } = await supabase.from("noticias").insert({
    id,
    titulo: datos.titulo,
    resumen: datos.resumen,
    cuerpo: datos.cuerpo,
    foto: rutaFoto,
    publicada_en: fechaPublicacion(datos),
  });

  if (error) {
    await borrarFotos(supabase, BUCKET_FOTOS_NOTICIAS, [rutaFoto]);
    return responder(anterior, { errores: {}, mensaje: NO_GUARDADA, valores });
  }

  revalidarNoticia(id);
  redirect(`/noticias/${id}`);
}

export async function actualizarNoticia(
  id: string,
  anterior: EstadoFormularioNoticia,
  formData: FormData,
): Promise<EstadoFormularioNoticia> {
  await exigirAdministrador();

  const validacion = await validarNoticia(formData);
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
    .select("publicada_en, foto")
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

  // Foto nueva, quitar la que hay, o dejarla como está.
  const { datos, foto, valores } = validacion;
  let rutaFoto = actual.foto;
  if (foto) {
    rutaFoto = await subirFoto(supabase, BUCKET_FOTOS_NOTICIAS, id, foto);
    if (!rutaFoto) {
      return responder(anterior, {
        errores: { foto: FOTO_NO_SUBIDA },
        mensaje: "Revisa los campos marcados.",
        valores,
      });
    }
  } else if (formData.get("quitar_foto") === "si") {
    rutaFoto = null;
  }

  const { error } = await supabase
    .from("noticias")
    .update({
      titulo: datos.titulo,
      resumen: datos.resumen,
      cuerpo: datos.cuerpo,
      foto: rutaFoto,
      publicada_en: fechaPublicacion(datos, actual.publicada_en),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    // La foto recién subida ya no se usa.
    if (rutaFoto !== actual.foto) {
      await borrarFotos(supabase, BUCKET_FOTOS_NOTICIAS, [rutaFoto]);
    }
    return error.code === "PGRST116"
      ? noEncontrada()
      : responder(anterior, { errores: {}, mensaje: NO_GUARDADA, valores });
  }

  // La foto anterior ya no se usa.
  if (actual.foto !== rutaFoto) {
    await borrarFotos(supabase, BUCKET_FOTOS_NOTICIAS, [actual.foto]);
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
  const { data, error } = await supabase
    .from("noticias")
    .delete()
    .eq("id", noticiaId)
    .select("foto");

  if (error) {
    return { error: "No se ha podido borrar la noticia. Inténtalo de nuevo." };
  }
  if (data.length === 0) {
    return { error: NO_ENCONTRADA };
  }

  await borrarFotos(
    supabase,
    BUCKET_FOTOS_NOTICIAS,
    data.map(({ foto }) => foto),
  );

  revalidarNoticia(noticiaId);
  redirect("/noticias");
}
