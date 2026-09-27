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

const formatoFechaHoraConAno = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatoFechaCorta = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const formatoFechaCortaConAno = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  day: "numeric",
  month: "long",
});

const formatoFechaConAno = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat("es-ES", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
});

/** Las piezas de una fecha en España, con números fijos (año de 4 cifras…). */
const formatoPartes = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatoDesfase = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA_HORARIA,
  timeZoneName: "longOffset",
});

function conMayuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function partes(instante: Date) {
  const valores = Object.fromEntries(
    formatoPartes.formatToParts(instante).map(({ type, value }) => [type, value]),
  );
  return {
    ano: valores.year,
    fecha: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}`,
  };
}

function esDeEsteAno(fecha: Date) {
  return partes(fecha).ano === partes(new Date()).ano;
}

/**
 * Por ejemplo: "Sábado, 3 de octubre, 17:00". Si no es de este año, lo
 * lleva: "Sábado, 4 de octubre de 2025, 17:00".
 */
export function formatearFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const formato = esDeEsteAno(fecha) ? formatoFechaHora : formatoFechaHoraConAno;
  return conMayuscula(formato.format(fecha));
}

/**
 * Por ejemplo: "Sáb, 3 oct". Si no es de este año, lo lleva al final:
 * "Sáb, 4 oct 2025".
 */
export function formatearFechaCorta(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const formato = esDeEsteAno(fecha) ? formatoFechaCorta : formatoFechaCortaConAno;
  return conMayuscula(formato.format(fecha));
}

/** Por ejemplo: "3 de octubre", o "4 de octubre de 2025" si no es de este año. */
export function formatearFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return (esDeEsteAno(fecha) ? formatoFecha : formatoFechaConAno).format(fecha);
}

/** Por ejemplo: "17:00". */
export function formatearHora(fechaIso: string) {
  return formatoHora.format(new Date(fechaIso));
}

/**
 * Fecha ("2026-10-03") y hora ("17:00") en España, como las esperan los
 * campos de fecha y de hora de un formulario.
 */
export function aHoraDeEspana(fechaIso: string) {
  const { fecha, hora } = partes(new Date(fechaIso));
  return { fecha, hora };
}

/** Minutos que España va por delante de UTC en ese instante (60 o 120). */
function desfaseEnMinutos(instante: number) {
  const nombre = formatoDesfase
    .formatToParts(instante)
    .find(({ type }) => type === "timeZoneName")?.value;
  const partesDesfase = /GMT([+-])(\d{2}):(\d{2})/.exec(nombre ?? "");
  if (!partesDesfase) {
    return 0; // "GMT" a secas: sin desfase.
  }
  const [, signo, horas, minutos] = partesDesfase;
  return (signo === "-" ? -1 : 1) * (Number(horas) * 60 + Number(minutos));
}

/**
 * Lo contrario: de una fecha y una hora de España al instante en UTC (ISO),
 * teniendo en cuenta el horario de verano.
 */
export function desdeHoraDeEspana(fecha: string, hora: string) {
  const comoSiFueraUtc = Date.parse(`${fecha}T${hora}:00Z`);
  // Se calcula el desfase dos veces por si el cambio de hora cae justo entre
  // la primera aproximación y el instante real.
  let instante = comoSiFueraUtc - desfaseEnMinutos(comoSiFueraUtc) * 60_000;
  instante = comoSiFueraUtc - desfaseEnMinutos(instante) * 60_000;
  return new Date(instante).toISOString();
}
