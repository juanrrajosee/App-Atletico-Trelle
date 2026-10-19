import assert from "node:assert/strict";
import { test } from "node:test";
import { insertarFilas, literal } from "./copia.ts";

test("los textos van entre comillas y la comilla simple se dobla", () => {
  assert.equal(literal("Ana"), "'Ana'");
  assert.equal(literal("O'Brien"), "'O''Brien'");
  assert.equal(literal("''"), "''''''");
});

test("lo que parece SQL dentro de un texto no se ejecuta, es solo texto", () => {
  const intento = "x'); drop table public.jugadores; --";
  assert.equal(literal(intento), "'x''); drop table public.jugadores; --'");
});

test("la barra invertida, los saltos de línea, las tildes y los emojis se conservan", () => {
  assert.equal(literal("a\\b"), "'a\\b'");
  assert.equal(literal("uno\ndos"), "'uno\ndos'");
  assert.equal(literal("Atlético Trelle ⚽ ñ"), "'Atlético Trelle ⚽ ñ'");
});

test("un carácter nulo se quita (Postgres no lo admite en un texto)", () => {
  assert.equal(literal("a\0b"), "'ab'");
});

test("null, booleanos y números van sin comillas", () => {
  assert.equal(literal(null), "null");
  assert.equal(literal(true), "true");
  assert.equal(literal(false), "false");
  assert.equal(literal(25), "25");
  assert.equal(literal(12.5), "12.5");
  assert.equal(literal(0), "0");
});

test("un número que no es un número da error y no una copia rota", () => {
  assert.throws(() => literal(Number.NaN));
  assert.throws(() => literal(Number.POSITIVE_INFINITY));
});

test("un insert con varias filas", () => {
  const sql = insertarFilas("jugadores", [
    { id: "1", nombre: "Ana", dorsal: 9, apodo: null, activo: true },
    { id: "2", nombre: "O'Brien", dorsal: 1, apodo: "Gato", activo: false },
  ]);
  assert.equal(
    sql,
    [
      "-- jugadores: 2 filas.",
      'insert into public."jugadores" ("id", "nombre", "dorsal", "apodo", "activo") values',
      "  ('1', 'Ana', 9, null, true),",
      "  ('2', 'O''Brien', 1, 'Gato', false)",
      "on conflict do nothing;",
      "",
    ].join("\n"),
  );
});

test("una sola fila dice 'fila' en singular", () => {
  assert.match(insertarFilas("club", [{ id: true }]), /^-- club: 1 fila\./);
});

test("una tabla vacía no genera ningún insert", () => {
  assert.equal(insertarFilas("directiva", []), "-- directiva: sin filas.\n");
});

test("la fila única del club se actualiza si ya existe", () => {
  const sql = insertarFilas(
    "club",
    [{ id: true, telefono: "687 35 38 46", campo: null }],
    { alConflicto: { actualizar: "id" } },
  );
  assert.match(sql, /on conflict \("id"\) do update set\n {2}"telefono" = excluded\."telefono",\n {2}"campo" = excluded\."campo";\n$/);
  assert.doesNotMatch(sql, /"id" = excluded/);
});

test("si las filas no tienen las mismas columnas, da error", () => {
  assert.throws(
    () => insertarFilas("jugadores", [{ id: "1", nombre: "Ana" }, { id: "2" }]),
    /mismas columnas/,
  );
});
