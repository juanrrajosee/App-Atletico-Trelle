import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * Una rejilla con columnas solo desde cierto ancho ("grid lg:grid-cols-2")
 * tiene, en el móvil, una columna que mide lo que mida su contenido: un
 * nombre largo la ensancha más que la pantalla y el contenido se sale por la
 * derecha. Con "grid-cols-1" la columna se ajusta al ancho (minmax(0, 1fr)).
 */
test("las rejillas con columnas por ancho también definen la columna del móvil", () => {
  const carpeta = join(import.meta.dirname, "..");
  const archivos = readdirSync(carpeta, { recursive: true, encoding: "utf8" })
    .filter((ruta) => ruta.endsWith(".tsx"))
    .map((ruta) => join(carpeta, ruta));

  const mal: string[] = [];
  for (const archivo of archivos) {
    for (const texto of leerCadenas(readFileSync(archivo, "utf8"))) {
      const clases = texto.split(/\s+/);
      const esRejilla = clases.includes("grid");
      const porAncho = clases.some((clase) =>
        /^(sm|md|lg|xl|2xl):grid-cols-/.test(clase),
      );
      const base = clases.some((clase) => clase.startsWith("grid-cols-"));
      if (esRejilla && porAncho && !base) {
        mal.push(`${archivo.slice(carpeta.length + 1)}: "${texto}"`);
      }
    }
  }

  assert.deepEqual(mal, [], "Falta grid-cols-1 en estas rejillas");
});

/** Los textos entre comillas de un archivo (donde van las clases). */
function leerCadenas(codigo: string): string[] {
  return [...codigo.matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)].map(
    (coincidencia) => coincidencia[2],
  );
}
