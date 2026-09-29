/**
 * Estado de un formulario que se envía con una Server Action y
 * useActionState. Campo es la unión de los nombres de sus campos.
 */
export type EstadoFormulario<Campo extends string> = {
  errores: Partial<Record<Campo, string>>;
  mensaje: string | null;
  /** Lo que se había escrito, para no vaciar el formulario si hay errores. */
  valores: Partial<Record<Campo, string>>;
  /**
   * Cuántas veces ha respondido el servidor. El formulario lo usa como key
   * para montarse de nuevo con los valores enviados: si no, React lo
   * restablece tras cada envío y los selectores vuelven a su opción inicial.
   */
  intento: number;
};

/** Lo que responde el servidor; el intento lo cuenta responder(). */
export type RespuestaFormulario<Campo extends string> = Omit<
  EstadoFormulario<Campo>,
  "intento"
>;

/** Nuevo estado del formulario, contando esta respuesta. */
export function responder<Campo extends string>(
  anterior: EstadoFormulario<Campo>,
  respuesta: RespuestaFormulario<Campo>,
): EstadoFormulario<Campo> {
  return { ...respuesta, intento: anterior.intento + 1 };
}
