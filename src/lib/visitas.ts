/**
 * Qué visitas cuenta Vercel Web Analytics (el contador de visitas de la web).
 *
 * Solo se cuentan las páginas públicas, y sin lo que va detrás de la
 * dirección (el "?…" y el "#…"). Las pantallas de entrar, de la cuenta y de
 * gestión no se cuentan: no son visitas de la afición, y sus direcciones
 * pueden llevar datos que no hace falta mandar a nadie.
 */

/** Direcciones que nunca se cuentan. */
const NO_SE_CUENTAN = [
  /^\/(acceso|registro|recuperar|nueva-contrasena|bienvenida|cuenta|administracion|auth)(\/|$)/,
  // Crear y editar (lo hace el administrador): .../nuevo, .../nueva, .../editar, .../alineacion
  /\/(nuevo|nueva|editar|alineacion)$/,
  /^\/club\/(directiva|cuerpo-tecnico)(\/|$)/,
];

/**
 * La dirección a contar (sin consulta ni ancla), o null si no hay que
 * contarla. `direccion` es la completa, tal como la manda el contador.
 */
export function direccionAContar(direccion: string): string | null {
  let url: URL;
  try {
    url = new URL(direccion);
  } catch {
    return null;
  }

  if (NO_SE_CUENTAN.some((regla) => regla.test(url.pathname))) {
    return null;
  }

  return `${url.origin}${url.pathname}`;
}
