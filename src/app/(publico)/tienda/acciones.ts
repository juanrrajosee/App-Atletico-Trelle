"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoBorrado } from "@/components/boton-borrar";
import { exigirAdministrador } from "@/lib/auth";
import { responder } from "@/lib/formularios";
import { resolverFotos } from "@/lib/fotos-producto";
import { esIdValido } from "@/lib/ids";
import { borrarFotos, subirFoto } from "@/lib/supabase/fotos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { BUCKET_FOTOS } from "@/lib/tienda";
import {
  validarProducto,
  type EstadoFormularioProducto,
  type FotosEnviadas,
} from "./validacion";

const NO_ENCONTRADO = "No se ha encontrado el producto. Puede que se haya borrado.";
const NO_GUARDADO = "No se han podido guardar los cambios. Inténtalo de nuevo.";
const FOTO_NO_SUBIDA = "No se ha podido subir una de las fotos. Inténtalo de nuevo.";

type Supabase = Awaited<ReturnType<typeof crearClienteServidor>>;

/**
 * Sube las fotos nuevas, una a una y en su orden, a la carpeta del producto.
 * Si una falla, borra las que ya se habían subido: no quedan fotos sueltas.
 */
async function subirFotosNuevas(
  supabase: Supabase,
  id: string,
  fotos: FotosEnviadas,
): Promise<Map<number, string> | null> {
  const subidas = new Map<number, string>();

  for (const item of fotos.items) {
    if (!("nueva" in item)) continue;
    const archivo = fotos.nuevas.get(item.nueva);
    const ruta = archivo
      ? await subirFoto(supabase, BUCKET_FOTOS, id, archivo)
      : null;
    if (!ruta) {
      await borrarFotos(supabase, BUCKET_FOTOS, [...subidas.values()]);
      return null;
    }
    subidas.set(item.nueva, ruta);
  }

  return subidas;
}

function revalidarTienda(id: string) {
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${id}`);
}

export async function crearProducto(
  anterior: EstadoFormularioProducto,
  formData: FormData,
): Promise<EstadoFormularioProducto> {
  await exigirAdministrador();

  const validacion = await validarProducto(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, fotos, valores } = validacion;

  const supabase = await crearClienteServidor();
  // El id se elige aquí para subir las fotos a su carpeta antes de crear el
  // producto: así nunca queda un producto a medias.
  const id = randomUUID();
  const subidas = await subirFotosNuevas(supabase, id, fotos);
  if (!subidas) {
    return responder(anterior, {
      errores: { fotos: FOTO_NO_SUBIDA },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  // Un producto nuevo no tiene fotos de antes: todas son nuevas.
  const resuelto = resolverFotos([], fotos.items, subidas);
  if (!resuelto.ok) {
    await borrarFotos(supabase, BUCKET_FOTOS, [...subidas.values()]);
    return responder(anterior, {
      errores: { fotos: resuelto.error },
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
    fotos: resuelto.fotos,
  });

  if (error) {
    await borrarFotos(supabase, BUCKET_FOTOS, [...subidas.values()]);
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

  const validacion = await validarProducto(formData);
  if (!validacion.ok) {
    return responder(anterior, validacion.respuesta);
  }
  const { datos, fotos, valores } = validacion;

  if (!esIdValido(id)) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  const supabase = await crearClienteServidor();
  const { data: actual, error: errorActual } = await supabase
    .from("productos")
    .select("fotos")
    .eq("id", id)
    .maybeSingle();

  if (errorActual) {
    return responder(anterior, { errores: {}, mensaje: NO_GUARDADO, valores });
  }
  if (!actual) {
    return responder(anterior, { errores: {}, mensaje: NO_ENCONTRADO, valores });
  }

  // Las que ya tiene (en el orden pedido), más las nuevas; y las que se quitan.
  const subidas = await subirFotosNuevas(supabase, id, fotos);
  if (!subidas) {
    return responder(anterior, {
      errores: { fotos: FOTO_NO_SUBIDA },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  const resuelto = resolverFotos(actual.fotos, fotos.items, subidas);
  if (!resuelto.ok) {
    await borrarFotos(supabase, BUCKET_FOTOS, [...subidas.values()]);
    return responder(anterior, {
      errores: { fotos: resuelto.error },
      mensaje: "Revisa los campos marcados.",
      valores,
    });
  }

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio_orientativo: datos.precio,
      orden: datos.orden,
      visible: datos.visible,
      fotos: resuelto.fotos,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    // Las fotos recién subidas ya no se usan.
    await borrarFotos(supabase, BUCKET_FOTOS, [...subidas.values()]);
    return responder(anterior, {
      errores: {},
      mensaje: error.code === "PGRST116" ? NO_ENCONTRADO : NO_GUARDADO,
      valores,
    });
  }

  // Las fotos que se han quitado ya no se usan.
  await borrarFotos(supabase, BUCKET_FOTOS, resuelto.quitadas);

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
    .select("fotos");

  if (error) {
    return { error: "No se ha podido borrar el producto. Inténtalo de nuevo." };
  }
  if (data.length === 0) {
    return { error: NO_ENCONTRADO };
  }

  await borrarFotos(
    supabase,
    BUCKET_FOTOS,
    data.flatMap(({ fotos }) => fotos),
  );

  revalidarTienda(id);
  redirect("/tienda");
}
