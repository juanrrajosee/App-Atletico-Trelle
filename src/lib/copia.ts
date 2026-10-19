/**
 * Copia de seguridad en SQL: los datos de las tablas del club como sentencias
 * `insert`, que se pueden pegar en el SQL Editor de Supabase para restaurarlos.
 * Aquí solo está el formato (sin acceso a la base de datos), para poder
 * probarlo.
 */

export type Valor = string | number | boolean | null;
export type Fila = Record<string, Valor>;

/** Un valor como literal de SQL: texto entre comillas, números tal cual, null. */
export function literal(valor: Valor): string {
  if (valor === null) return "null";
  if (typeof valor === "boolean") return valor ? "true" : "false";
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) {
      throw new Error(`Un número no válido no cabe en una copia: ${valor}`);
    }
    return String(valor);
  }
  // Con standard_conforming_strings (lo normal en Postgres y en Supabase) la
  // barra invertida es un carácter más: solo hay que doblar la comilla simple.
  // Un carácter nulo (que Postgres no admite en un texto) se quita.
  return `'${valor.replaceAll("\0", "").replaceAll("'", "''")}'`;
}

/** Un nombre de columna o de tabla entre comillas dobles. */
function nombre(identificador: string) {
  return `"${identificador.replaceAll('"', '""')}"`;
}

type Opciones = {
  /**
   * Si la fila ya existe: ignorarla (por defecto), o actualizarla (para la
   * fila única del club, que las migraciones ya crean).
   */
  alConflicto?: "ignorar" | { actualizar: string };
};

/**
 * Las filas de una tabla como un único `insert`. Una tabla vacía no genera
 * nada (solo un comentario). Cada fila trae las mismas columnas.
 */
export function insertarFilas(tabla: string, filas: Fila[], opciones: Opciones = {}) {
  if (filas.length === 0) {
    return `-- ${tabla}: sin filas.\n`;
  }

  const columnas = Object.keys(filas[0]);
  const valores = filas.map((fila) => {
    const claves = Object.keys(fila);
    if (
      claves.length !== columnas.length ||
      !columnas.every((columna) => columna in fila)
    ) {
      throw new Error(`Las filas de ${tabla} no tienen las mismas columnas.`);
    }
    return `  (${columnas.map((columna) => literal(fila[columna])).join(", ")})`;
  });

  const conflicto = opciones.alConflicto ?? "ignorar";
  const alConflicto =
    conflicto === "ignorar"
      ? "on conflict do nothing"
      : `on conflict (${nombre(conflicto.actualizar)}) do update set\n` +
        columnas
          .filter((columna) => columna !== conflicto.actualizar)
          .map((columna) => `  ${nombre(columna)} = excluded.${nombre(columna)}`)
          .join(",\n");

  return (
    `-- ${tabla}: ${filas.length} ${filas.length === 1 ? "fila" : "filas"}.\n` +
    `insert into public.${nombre(tabla)} (${columnas.map(nombre).join(", ")}) values\n` +
    `${valores.join(",\n")}\n${alConflicto};\n`
  );
}
