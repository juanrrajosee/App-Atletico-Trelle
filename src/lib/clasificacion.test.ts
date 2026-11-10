import assert from "node:assert/strict";
import { test } from "node:test";
import { esEquipoTrelle, esZona, resultadosRecientes } from "./clasificacion.ts";

test("reconoce al Atlético Trelle como lo escriba la federación", () => {
  for (const nombre of [
    "ATLETICO TRELLE",
    "Atlético Trelle",
    "  atlético   trelle ",
    "AT. TRELLE",
  ]) {
    assert.equal(esEquipoTrelle(nombre), true, nombre);
  }
});

test("no confunde a otros equipos con el Trelle", () => {
  for (const nombre of ["ATLETICO COLES", "C.D. TRIVES", "TRELLE B CF", "ATLETICO TRELLES"]) {
    assert.equal(esEquipoTrelle(nombre), false, nombre);
  }
});

test("los últimos resultados se leen letra a letra", () => {
  assert.deepEqual(resultadosRecientes("GPEPG"), ["G", "P", "E", "P", "G"]);
  assert.deepEqual(resultadosRecientes(""), []);
  assert.deepEqual(resultadosRecientes("GX"), ["G"]);
});

test("solo hay tres zonas", () => {
  assert.equal(esZona("ascenso"), true);
  assert.equal(esZona("promocion"), true);
  assert.equal(esZona("descenso"), true);
  assert.equal(esZona("campeon"), false);
  assert.equal(esZona(null), false);
});
