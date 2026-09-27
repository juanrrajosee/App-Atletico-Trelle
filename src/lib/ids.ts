const PATRON_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita mandar a la base de datos un id mal formado (daría un error). */
export function esIdValido(id: string) {
  return PATRON_UUID.test(id);
}
