import assert from "node:assert/strict";
import { test } from "node:test";
import { esFotoDeVerdad, fotoDelFormulario } from "./fotos.ts";

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d];
// "RIFF", tamaño, "WEBP".
const WEBP = [0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];
const HTML = [...new TextEncoder().encode("<html><script>alert(1)</script>")];

const archivo = (bytes: number[], tipo: string) =>
  new File([new Uint8Array(bytes)], "foto", { type: tipo });

test("acepta las fotos que son lo que dicen ser", async () => {
  assert.equal(await esFotoDeVerdad(archivo(JPEG, "image/jpeg")), true);
  assert.equal(await esFotoDeVerdad(archivo(PNG, "image/png")), true);
  assert.equal(await esFotoDeVerdad(archivo(WEBP, "image/webp")), true);
});

test("rechaza un archivo disfrazado de foto", async () => {
  assert.equal(await esFotoDeVerdad(archivo(HTML, "image/jpeg")), false);
  assert.equal(await esFotoDeVerdad(archivo(JPEG, "image/png")), false);
  assert.equal(await esFotoDeVerdad(archivo(PNG, "image/webp")), false);
  assert.equal(await esFotoDeVerdad(archivo(JPEG.slice(0, 2), "image/jpeg")), false);
});

test("el formulario explica por qué no vale la foto", async () => {
  const conFalsa = new FormData();
  conFalsa.set("foto", archivo(HTML, "image/jpeg"));
  const falsa = await fotoDelFormulario(conFalsa);
  assert.equal(falsa.error, "El archivo no es una foto JPG, PNG o WebP de verdad.");

  const conBuena = new FormData();
  conBuena.set("foto", archivo(JPEG, "image/jpeg"));
  assert.equal((await fotoDelFormulario(conBuena)).error, null);

  const sinFoto = await fotoDelFormulario(new FormData());
  assert.deepEqual(sinFoto, { foto: null, error: null });
});
