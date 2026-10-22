/**
 * Los límites de las fotos de un producto, en un archivo aparte y sin
 * dependencias para que el formulario (en el navegador) los use sin cargar
 * con la validación del servidor.
 */

/** Las fotos que cabe en un producto (lo exige también la base de datos). */
export const MAX_FOTOS_PRODUCTO = 6;

/**
 * Lo máximo que pesan juntas las fotos nuevas de un envío. Vercel no deja
 * pasar más de 4,5 MB en una petición; queda margen para el resto del
 * formulario.
 */
export const MAX_BYTES_FOTOS_NUEVAS = 3.4 * 1024 * 1024;

/** En el formulario, la foto nueva número n viaja en el campo `foto_nueva_n`. */
export const CAMPO_FOTO_NUEVA = "foto_nueva_";
