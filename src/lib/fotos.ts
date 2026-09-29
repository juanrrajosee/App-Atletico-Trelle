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
