import assert from "node:assert/strict";
import { test } from "node:test";
import { rutaDeVuelta } from "./rutas.ts";

/** Adónde acabaría el navegador con la ruta devuelta, desde la app. */
function destino(valor: unknown) {
  return new URL(rutaDeVuelta(valor), "https://atletico-trelle.vercel.app/acceso");
}

test("deja volver a cualquier página de la app", () => {
  assert.equal(rutaDeVuelta("/partidos"), "/partidos");
  assert.equal(rutaDeVuelta("/partidos/abc?x=1#votar"), "/partidos/abc?x=1#votar");
  assert.equal(rutaDeVuelta("/"), "/");
});

test("no deja salir a otra web", () => {
  const intentos = [
    "//malo.example",
    "/\\malo.example",
    "/\\\\malo.example",
    // El navegador quita tabuladores y saltos de línea: "//malo.example".
    "/\t/malo.example",
    "/\n/malo.example",
    "/\r\n/malo.example",
    "https://malo.example",
    "javascript:alert(1)",
  ];
  for (const intento of intentos) {
    assert.equal(rutaDeVuelta(intento), "/", JSON.stringify(intento));
    assert.equal(destino(intento).host, "atletico-trelle.vercel.app");
  }
});

test("lo que no es una ruta lleva al inicio", () => {
  for (const valor of ["partidos", "", null, undefined, ["/partidos"], 42]) {
    assert.equal(rutaDeVuelta(valor), "/", JSON.stringify(valor));
  }
});
