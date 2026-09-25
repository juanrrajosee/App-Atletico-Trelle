/**
 * Las fechas se guardan en la base de datos como timestamptz (UTC) y se
 * muestran siempre en hora de España, esté donde esté el servidor.
 */
const ZONA_HORARIA = "Europe/Madrid";

const formatoFechaHora = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Por ejemplo: "Sábado, 3 de octubre, 17:00". */
export function formatearFechaHora(fechaIso: string) {
  const texto = formatoFechaHora.format(new Date(fechaIso));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
