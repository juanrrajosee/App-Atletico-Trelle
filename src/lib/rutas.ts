/**
 * La ruta a la que volver después de entrar (?siguiente=/partidos/…), solo
 * si es de esta misma aplicación: una ruta que empieza por "/" y no por
 * "//" ni "/\" (que el navegador trataría como otra web). Si no, el inicio.
 */
export function rutaDeVuelta(valor: unknown): string {
  if (
    typeof valor !== "string" ||
    !valor.startsWith("/") ||
    valor.startsWith("//") ||
    valor.startsWith("/\\")
  ) {
    return "/";
  }
  return valor;
}
