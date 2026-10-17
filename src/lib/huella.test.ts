import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { huella } from "./huella.ts";

const SECRETO = "un-secreto-largo-y-aleatorio-de-prueba";

test("es siempre un SHA-256: 64 cifras hexadecimales", () => {
  assert.match(huella("ana@correo.es", SECRETO), /^[0-9a-f]{64}$/);
  assert.match(huella("ana@correo.es", ""), /^[0-9a-f]{64}$/);
});

test("el mismo valor da siempre la misma huella", () => {
  assert.equal(huella("ana@correo.es", SECRETO), huella("ana@correo.es", SECRETO));
});

test("no distingue mayúsculas ni espacios de los lados", () => {
  assert.equal(huella("  Ana@Correo.es ", SECRETO), huella("ana@correo.es", SECRETO));
});

test("valores distintos dan huellas distintas", () => {
  assert.notEqual(huella("ana@correo.es", SECRETO), huella("luis@correo.es", SECRETO));
});

test("con otro secreto, la huella es otra", () => {
  assert.notEqual(huella("ana@correo.es", SECRETO), huella("ana@correo.es", "otro-secreto"));
});

test("con secreto, no se puede calcular sin él (no sale el SHA-256 simple)", () => {
  const simple = createHash("sha256").update("atletico-trelle:ana@correo.es").digest("hex");
  assert.notEqual(huella("ana@correo.es", SECRETO), simple);
});

test("sin secreto sigue siendo el SHA-256 de siempre: las huellas ya guardadas valen", () => {
  const simple = createHash("sha256").update("atletico-trelle:ana@correo.es").digest("hex");
  assert.equal(huella("ana@correo.es", ""), simple);
});
