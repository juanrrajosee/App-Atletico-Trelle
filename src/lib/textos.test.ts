import assert from "node:assert/strict";
import { test } from "node:test";
import { extracto, parrafos } from "./textos.ts";

test("un texto corto se queda como está (en una sola línea)", () => {
  assert.equal(extracto("Fundado en 2023."), "Fundado en 2023.");
  assert.equal(extracto("Línea uno.\n\nLínea dos."), "Línea uno. Línea dos.");
});

test("un texto largo se corta donde acaba una frase, si hay una a partir de 40 letras", () => {
  const texto =
    "El Atlético Trelle nació en 2023 entre amigos del pueblo. Desde entonces juega en la liga de aficionados y no ha parado de crecer año tras año con la ayuda de todos.";
  assert.equal(
    extracto(texto),
    "El Atlético Trelle nació en 2023 entre amigos del pueblo.",
  );
});

test("sin frase que acabe a tiempo, corta en una palabra entera y pone puntos suspensivos", () => {
  const texto =
    "Una historia que empieza mucho antes de que nadie pensara en escribirla y que sigue sin parar ni un solo día desde aquellos primeros partidos en el prado";
  const resultado = extracto(texto, 60);
  assert.ok(resultado.endsWith("…"));
  assert.ok(resultado.length <= 61);
  assert.ok(texto.startsWith(resultado.slice(0, -1)));
  assert.ok(!resultado.slice(0, -1).endsWith(" "));
  // Siempre palabras enteras.
  assert.ok(texto.slice(resultado.length - 1).startsWith(" "));
});

test("una abreviatura al principio no se toma por el final de la frase", () => {
  const texto =
    "S.D. Trelle es el nombre con el que se inscribió el equipo en la federación gallega de fútbol, y con él compite desde entonces en todas las categorías.";
  const resultado = extracto(texto, 100);
  assert.ok(resultado.length > 20, resultado);
  assert.ok(resultado.startsWith("S.D. Trelle es el nombre"));
});

test("el extracto no inventa nada: es siempre el principio del texto", () => {
  const texto = parrafos(
    "Primero.\n\nSegundo párrafo bastante más largo que el primero, con muchas más palabras para que haya que cortarlo por algún sitio y no quepa en una línea de la pantalla.",
  ).join(" ");
  const resultado = extracto(texto, 50);
  assert.ok(texto.startsWith(resultado.replace(/…$/, "")));
});
