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
export async function fotoDelFormulario(formData: FormData): Promise<{
  foto: File | null;
  error: string | null;
}> {
  const archivo = formData.get("foto");
  const foto = archivo instanceof File && archivo.size > 0 ? archivo : null;
  if (foto && !TIPOS_FOTO.includes(foto.type)) {
    return { foto, error: "La foto tiene que ser JPG, PNG o WebP." };
  }
  if (foto && foto.size > TAMANO_MAXIMO_FOTO) {
    return { foto, error: "La foto pesa demasiado (más de 3 MB)." };
  }
  if (foto && !(await esFotoDeVerdad(foto))) {
    return { foto, error: "El archivo no es una foto JPG, PNG o WebP de verdad." };
  }
  return { foto, error: null };
}

/**
 * Si el contenido del archivo es del tipo que dice ser. El tipo lo pone el
 * navegador según el nombre del archivo, y cualquiera puede cambiarlo: lo
 * que no se puede disimular son los primeros bytes, la "firma" de cada
 * formato.
 */
export async function esFotoDeVerdad(foto: File) {
  const bytes = new Uint8Array(await foto.slice(0, 12).arrayBuffer());
  const empiezaPor = (firma: number[], desde = 0) =>
    firma.every((byte, i) => bytes[desde + i] === byte);

  switch (foto.type) {
    case "image/jpeg":
      return empiezaPor([0xff, 0xd8, 0xff]);
    case "image/png":
      return empiezaPor([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      // "RIFF", cuatro bytes de tamaño y "WEBP".
      return (
        empiezaPor([0x52, 0x49, 0x46, 0x46]) &&
        empiezaPor([0x57, 0x45, 0x42, 0x50], 8)
      );
    default:
      return false;
  }
}

/**
 * La dirección pública de una foto de un bucket (los de fotos son
 * públicos: se ven sin sesión).
 */
export function urlFotoPublica(bucket: string, ruta: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${ruta}`;
}
