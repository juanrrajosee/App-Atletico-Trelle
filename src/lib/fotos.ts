/**
 * Reduce una foto en el navegador antes de subirla: una foto de móvil pesa
 * varios MB y en la aplicación basta con 1600 píxeles por el lado largo.
 * Respeta la orientación con la que se hizo y la guarda como JPEG.
 */
export async function reducirFoto(
  archivo: File,
  ladoMaximo = 1600,
  calidad = 0.85,
): Promise<File> {
  const imagen = await createImageBitmap(archivo, {
    imageOrientation: "from-image",
  });
  const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height));
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const contexto = lienzo.getContext("2d");
  if (!contexto) {
    throw new Error("El navegador no puede preparar la foto.");
  }
  // Fondo blanco: en JPEG, lo transparente de un PNG saldría negro.
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, ancho, alto);
  contexto.drawImage(imagen, 0, 0, ancho, alto);
  imagen.close();

  const blob = await new Promise<Blob | null>((resolver) =>
    lienzo.toBlob(resolver, "image/jpeg", calidad),
  );
  if (!blob) {
    throw new Error("El navegador no puede preparar la foto.");
  }
  return new File([blob], "foto.jpg", { type: "image/jpeg" });
}

/** Tipos de foto que se aceptan (los mismos que los buckets). */
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

/** Tamaño máximo de una foto (el mismo que los buckets). */
export const TAMANO_MAXIMO_FOTO = 3 * 1024 * 1024;

/**
 * La foto que llega en el campo "foto" de un formulario (null si no se ha
 * elegido ninguna) y, si no vale, por qué.
 */
export function fotoDelFormulario(formData: FormData): {
  foto: File | null;
  error: string | null;
} {
  const archivo = formData.get("foto");
  const foto = archivo instanceof File && archivo.size > 0 ? archivo : null;
  if (foto && !TIPOS_FOTO.includes(foto.type)) {
    return { foto, error: "La foto tiene que ser JPG, PNG o WebP." };
  }
  if (foto && foto.size > TAMANO_MAXIMO_FOTO) {
    return { foto, error: "La foto pesa demasiado (más de 3 MB)." };
  }
  return { foto, error: null };
}

/**
 * La dirección pública de una foto de un bucket (los de fotos son
 * públicos: se ven sin sesión).
 */
export function urlFotoPublica(bucket: string, ruta: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${ruta}`;
}
