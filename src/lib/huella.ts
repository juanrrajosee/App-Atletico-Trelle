import { createHash, createHmac } from "node:crypto";

/**
 * Huella de una IP o de un email para los límites de intentos: es lo único
 * que se guarda en la base de datos (nunca la IP ni el email).
 *
 * Con el secreto LIMITES_SECRETO (una cadena larga y aleatoria, solo en las
 * variables de entorno del servidor) la huella es un HMAC-SHA256: nadie sin el
 * secreto puede calcular la de un email o una IP concretos. Sin él se usa un
 * SHA-256 simple, que cualquiera puede calcular: sirve para no guardar los
 * datos tal cual, pero no impide que alguien apunte intentos a nombre de otro
 * llamando directamente a la base de datos.
 */
export function huella(valor: string, secreto = process.env.LIMITES_SECRETO) {
  const texto = `atletico-trelle:${valor.trim().toLowerCase()}`;
  return (
    secreto
      ? createHmac("sha256", secreto).update(texto)
      : createHash("sha256").update(texto)
  ).digest("hex");
}

/** Si hay un secreto para firmar las huellas. */
export function hayHuellaSecreta() {
  return Boolean(process.env.LIMITES_SECRETO);
}
