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

/** Fecha de hoy en España, como "AAAA-MM-DD". */
export function hoyEnEspana() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(
    new Date(),
  );
}

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Fechas sin hora (como la de nacimiento): "2000-03-12" → "12 de marzo de
 * 2000". Se leen como UTC para que ninguna zona horaria mueva el día.
 */
export function formatearFecha(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return formatoFecha.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

/** Años cumplidos a día de hoy en España. */
export function calcularEdad(fechaNacimiento: string) {
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const [anioHoy, mesHoy, diaHoy] = hoyEnEspana().split("-").map(Number);
  const yaCumplidos = mesHoy > mes || (mesHoy === mes && diaHoy >= dia);
  return anioHoy - anio - (yaCumplidos ? 0 : 1);
}
