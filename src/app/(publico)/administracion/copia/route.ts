import { exigirAdministrador } from "@/lib/auth";
import { insertarFilas, type Fila } from "@/lib/copia";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Las tablas con datos del club, en el orden en que hay que volver a
 * crearlas (las estadísticas dependen de jugadores y partidos). No van las
 * cuentas ni los votos: sin las cuentas no se podrían restaurar.
 */
const TABLAS = [
  "jugadores",
  "partidos",
  "estadisticas_partido",
  "noticias",
  "directiva",
  "cuerpo_tecnico",
  "productos",
] as const;

/** Cuántas filas pide cada vez (Supabase da como mucho 1000 por consulta). */
const PAGINA = 1000;

type Supabase = Awaited<ReturnType<typeof crearClienteServidor>>;

async function cargarTabla(
  supabase: Supabase,
  tabla: (typeof TABLAS)[number] | "club",
): Promise<Fila[]> {
  const filas: Fila[] = [];

  for (let desde = 0; ; desde += PAGINA) {
    // Por id, para que las páginas no se repitan ni se salten filas. El club
    // es una sola fila, con el id "true".
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .order("id")
      .range(desde, desde + PAGINA - 1);

    if (error) {
      throw new Error(`No se ha podido leer ${tabla}: ${error.message}`);
    }

    filas.push(...(data as Fila[]));
    if (data.length < PAGINA) {
      return filas;
    }
  }
}

/** La fecha y la hora de España, para el nombre del archivo y la cabecera. */
function ahoraEnEspana() {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value]),
  );
  return {
    dia: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

/**
 * Descarga una copia de seguridad de los datos del club como un archivo SQL
 * (solo para el administrador). Se restaura pegándola en el SQL Editor de
 * Supabase, con las migraciones ya aplicadas.
 */
export async function GET() {
  await exigirAdministrador();

  const supabase = await crearClienteServidor();
  let cuerpo: string;

  try {
    const bloques: string[] = [];
    for (const tabla of TABLAS) {
      bloques.push(insertarFilas(tabla, await cargarTabla(supabase, tabla)));
    }
    // La fila única del club ya la crean las migraciones: se actualiza.
    bloques.push(
      insertarFilas("club", await cargarTabla(supabase, "club"), {
        alConflicto: { actualizar: "id" },
      }),
    );

    const { dia, hora } = ahoraEnEspana();
    cuerpo = [
      "-- Copia de seguridad de la aplicación del Atlético Trelle",
      `-- Hecha el ${dia} a las ${hora} (hora de España).`,
      "--",
      "-- LLEVA DATOS PERSONALES (nombres de los jugadores y de la directiva, y el",
      "-- estado de salud de cada jugador). Guárdala en un sitio privado y no la",
      "-- compartas.",
      "--",
      "-- Qué lleva: jugadores, partidos, estadísticas de los partidos, noticias,",
      "-- directiva, cuerpo técnico, tienda y la información del club.",
      "-- Qué NO lleva: las fotos (solo su ruta; guarda los originales aparte),",
      "-- las cuentas de los aficionados ni sus votos.",
      "--",
      "-- Para restaurarla en un proyecto de Supabase donde ya estén aplicadas las",
      "-- migraciones: pegar todo este archivo en el SQL Editor y pulsar Run. Si",
      "-- una fila ya existe, no se toca. Va en una transacción: si algo falla,",
      "-- no se cambia nada.",
      "",
      "begin;",
      "",
      ...bloques,
      "commit;",
      "",
    ].join("\n");

    return new Response(cuerpo, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="copia-atletico-trelle-${dia}.sql"`,
        // Son datos personales: que no se guarden en ninguna caché.
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("No se ha podido hacer la copia. Inténtalo de nuevo.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
