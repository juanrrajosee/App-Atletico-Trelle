import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import manifest from "../app/manifest.ts";

const ficha = manifest();

/** Ancho y alto de un PNG, leídos de su cabecera. */
function medidasPng(ruta: string) {
  const bytes = readFileSync(ruta);
  assert.equal(bytes.subarray(1, 4).toString(), "PNG", `${ruta} no es un PNG`);
  return { ancho: bytes.readUInt32BE(16), alto: bytes.readUInt32BE(20) };
}

test("tiene lo que pide Chrome para ofrecer instalarla", () => {
  assert.equal(ficha.name, "Atlético Trelle");
  assert.equal(ficha.start_url, "/");
  assert.equal(ficha.display, "standalone");
  assert.equal(ficha.lang, "es");
});

test("el color es el granate de la cabecera", () => {
  assert.equal(ficha.theme_color, "#6e1520");
  assert.equal(ficha.background_color, "#6e1520");
});

test("tiene iconos de 192 y de 512 píxeles", () => {
  const medidas = (ficha.icons ?? []).map((icono) => icono.sizes);
  assert.ok(medidas.includes("192x192"));
  assert.ok(medidas.includes("512x512"));
});

test("cada icono existe, es un PNG y mide lo que dice", () => {
  for (const icono of ficha.icons ?? []) {
    const ruta = `public${icono.src}`;
    assert.ok(existsSync(ruta), `falta ${ruta}`);
    const { ancho, alto } = medidasPng(ruta);
    assert.equal(`${ancho}x${alto}`, icono.sizes, ruta);
  }
});

test("hay un icono adaptable (maskable) para Android", () => {
  assert.ok((ficha.icons ?? []).some((icono) => icono.purpose === "maskable"));
});
