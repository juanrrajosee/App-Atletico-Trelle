"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { esIdValido } from "@/lib/ids";
import { borrarFotos, subirFoto } from "@/lib/supabase/fotos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { BUCKET_FOTOS } from "@/lib/tienda";
import {
  validarProducto,
  type EstadoFormularioProducto,
} from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado el producto. Puede que se haya borrado.";
const NO_GUARDADO = "No se han podido guardar los cambios. Inténtalo de nuevo.";
const FOTO_NO_SUBIDA = "No se ha podido subir la foto. Inténtalo de nuevo.";

function revalidarTienda(id: string) {
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${id}`);
}

export async function crearProducto(
  anterior: EstadoFormularioProducto,
  formData: FormData,
): Promise<EstadoFormularioProducto> {
  await exigirAdministrador();

  const validacion = validarProducto(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, foto, valores } = validacion;

  const supabase = await crearClienteServidor();
  // El id se elige aquí para subir la foto a su carpeta antes de crear el
  // producto: así nunca queda un producto a medias.
  const id = randomUUID();
  const rutaFoto = foto
    ? await subirFoto(supabase, BUCKET_FOTOS, id, foto)
    : null;
  if (foto && !rutaFoto) {
    return responder(anterior, {
      errores: { foto: FOTO_NO_SUBIDA },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  const { error } = await supabase.from("productos").insert({
    id,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio_orientativo: datos.precio,
    orden: datos.orden,
    visible: datos.visible,
    foto: rutaFoto,
  });

  if (error) {
    await borrarFotos(supabase, BUCKET_FOTOS, [rutaFoto]);
    return responder(anterior, { errores: {}, mensaje: NO_GUARDADO, valores });
  }

  revalidarTienda(id);
  redirect(`/tienda/${id}`);
}

export async function actualizarProducto(
  id: string,
  anterior: EstadoFormularioProducto,
  formData: FormData,
): Promise<EstadoFormularioProducto> {
  await exigirAdministrador();

  const validacion = validarProducto(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, foto, valores } = validacion;
  const quitarFoto = formData.get("quitar_foto") === "si";

  if (!esIdValido(id)) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  const supabase = await crearClienteServidor();
  const { data: actual, error: errorActual } = await supabase
    .from("productos")
    .select("foto")
    .eq("id", id)
    .maybeSingle();

  if (errorActual) {
    return responder(anterior, { errores: {}, mensaje: NO_GUARDADO, valores });
  }
  if (!actual) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  // Foto nueva, quitar la que hay, o dejarla como está.
  let rutaFoto = actual.foto;
  if (foto) {
    rutaFoto = await subirFoto(supabase, BUCKET_FOTOS, id, foto);
    if (!rutaFoto) {
      return responder(anterior, {
        errores: { foto: FOTO_NO_SUBIDA },
        mensaje: "Revisa los campos marcados.",
        valores,
      });
    }
  } else if (quitarFoto) {
    rutaFoto = null;
  }

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio_orientativo: datos.precio,
      orden: datos.orden,
      visible: datos.visible,
      foto: rutaFoto,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    // La foto recién subida ya no se usa.
    if (rutaFoto !== actual.foto) {
      await borrarFotos(supabase, BUCKET_FOTOS, [rutaFoto]);
    }
    return responder(anterior, {
      errores: {},
      mensaje: error.code === "PGRST116" ? NO_ENCONTRADO : NO_GUARDADO,
      valores,
    });
  }

  // La foto anterior ya no se usa.
  if (actual.foto !== rutaFoto) {
    await borrarFotos(supabase, BUCKET_FOTOS, [actual.foto]);
  }

  revalidarTienda(id);
  redirect(`/tienda/${id}`);
}

export async function borrarProducto(id: string): Promise<EstadoBorrado> {
  await exigirAdministrador();

  if (!esIdValido(id)) {
    return { error: NO_ENCONTRADO };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id)
    .select("foto");

  if (error) {
    return { error: "No se ha podido borrar el producto. Inténtalo de nuevo." };
  }
  if (data.length === 0) {
    return { error: NO_ENCONTRADO };
  }

  await borrarFotos(
    supabase,
    BUCKET_FOTOS,
    data.map(({ foto }) => foto),
  );

  revalidarTienda(id);
  redirect("/tienda");
}
