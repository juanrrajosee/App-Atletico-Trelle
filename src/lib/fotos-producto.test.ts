import assert from "node:assert/strict";
import { test } from "node:test";
import { leerOrdenFotos, resolverFotos } from "./fotos-producto.ts";

const P = "3f330d16-fecc-4025-bc4c-5f52f304a20d";
const f = (n: number) => `${P}/0000000${n}-0000-4000-8000-00000000000${n}.jpg`;

test("sin nada, es una lista vacía", () => {
  assert.deepEqual(leerOrdenFotos(""), { ok: true, items: [] });
  assert.deepEqual(leerOrdenFotos("[]"), { ok: true, items: [] });
});

test("lee una mezcla de fotos que ya hay y fotos nuevas, en su orden", () => {
  const r = leerOrdenFotos(JSON.stringify([{ nueva: 0 }, { ruta: f(1) }, { nueva: 1 }]));
  assert.deepEqual(r, { ok: true, items: [{ nueva: 0 }, { ruta: f(1) }, { nueva: 1 }] });
});

test("rechaza lo que no es un JSON, no es una lista o trae cosas raras", () => {
  for (const malo of ["{", "no", '{"ruta":"x"}', '[{"ruta":"../otra/cosa.jpg"}]', '[{"ruta":1}]', '[{"nueva":-1}]', '[{"nueva":1.5}]', '[{"nueva":"0"}]', '[{"nueva":0,"extra":1}]', "[null]", "[1]"]) {
    assert.equal(leerOrdenFotos(malo).ok, false, malo);
  }
});

test("rechaza una ruta que no tiene la forma de las que sube la aplicación", () => {
  for (const ruta of ["../x.jpg", "otro/producto.jpg", `${P}/..%2Fx.jpg`, `${P}/foto.gif`, `${P}/0000000a-0000-4000-8000-000000000000.svg`]) {
    assert.equal(leerOrdenFotos(JSON.stringify([{ ruta }])).ok, false, ruta);
  }
});

test("a la séptima foto, error claro", () => {
  const siete = Array.from({ length: 7 }, (_, i) => ({ nueva: i % 6 }));
  const r = leerOrdenFotos(JSON.stringify(siete));
  assert.equal(r.ok, false);
  assert.match((r as { error: string }).error, /Como mucho 6/);
});

test("seis fotos sí", () => {
  const seis = Array.from({ length: 6 }, (_, i) => ({ nueva: i }));
  assert.equal(leerOrdenFotos(JSON.stringify(seis)).ok, true);
});

test("rechaza una foto repetida", () => {
  assert.equal(leerOrdenFotos(JSON.stringify([{ nueva: 0 }, { nueva: 0 }])).ok, false);
  assert.equal(leerOrdenFotos(JSON.stringify([{ ruta: f(1) }, { ruta: f(1) }])).ok, false);
});

test("junta lo que hay con lo nuevo y dice qué se quita", () => {
  const r = resolverFotos(
    [f(1), f(2), f(3)],
    [{ ruta: f(3) }, { nueva: 0 }, { ruta: f(1) }],
    new Map([[0, f(4)]]),
  );
  assert.deepEqual(r, { ok: true, fotos: [f(3), f(4), f(1)], quitadas: [f(2)] });
});

test("cambiar el orden no quita ninguna", () => {
  const r = resolverFotos([f(1), f(2)], [{ ruta: f(2) }, { ruta: f(1) }], new Map());
  assert.deepEqual(r, { ok: true, fotos: [f(2), f(1)], quitadas: [] });
});

test("dejar la lista vacía quita todas", () => {
  assert.deepEqual(resolverFotos([f(1), f(2)], [], new Map()), { ok: true, fotos: [], quitadas: [f(1), f(2)] });
});

test("una ruta que el producto no tiene se rechaza (la foto de otro producto)", () => {
  const r = resolverFotos([f(1)], [{ ruta: f(2) }], new Map());
  assert.equal(r.ok, false);
});

test("una foto nueva que no se ha subido se rechaza", () => {
  assert.equal(resolverFotos([], [{ nueva: 0 }], new Map()).ok, false);
});
