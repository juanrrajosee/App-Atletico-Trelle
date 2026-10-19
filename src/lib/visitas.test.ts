import assert from "node:assert/strict";
import { test } from "node:test";
import { direccionAContar } from "./visitas.ts";

const WEB = "https://atletico-trelle.vercel.app";

test("cuenta las páginas públicas", () => {
  for (const ruta of [
    "/",
    "/partidos",
    "/partidos/3f330d16-fecc-4025-bc4c-5f52f304a20d",
    "/plantilla",
    "/plantilla/3f330d16-fecc-4025-bc4c-5f52f304a20d",
    "/noticias",
    "/noticias/3f330d16-fecc-4025-bc4c-5f52f304a20d",
    "/tienda",
    "/club",
    "/estadisticas",
    "/votaciones",
    "/privacidad",
    "/aviso-legal",
  ]) {
    assert.equal(direccionAContar(WEB + ruta), WEB + ruta, ruta);
  }
});

test("quita la consulta y el ancla de la dirección", () => {
  assert.equal(direccionAContar(`${WEB}/partidos?temporada=2025#votar`), `${WEB}/partidos`);
  assert.equal(direccionAContar(`${WEB}/?siguiente=/cuenta`), `${WEB}/`);
});

test("no cuenta entrar, registrarse ni la cuenta", () => {
  for (const ruta of [
    "/acceso",
    "/acceso?error=enlace-no-valido",
    "/registro",
    "/recuperar",
    "/nueva-contrasena",
    "/bienvenida",
    "/cuenta",
    "/auth/confirmar",
    "/auth/callback",
  ]) {
    assert.equal(direccionAContar(WEB + ruta), null, ruta);
  }
});

test("no cuenta la gestión del administrador", () => {
  for (const ruta of [
    "/administracion",
    "/administracion/copia",
    "/partidos/nuevo",
    "/partidos/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
    "/partidos/3f330d16-fecc-4025-bc4c-5f52f304a20d/alineacion",
    "/plantilla/nuevo",
    "/plantilla/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
    "/noticias/nueva",
    "/noticias/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
    "/tienda/nuevo",
    "/tienda/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
    "/club/editar",
    "/club/directiva/nuevo",
    "/club/directiva/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
    "/club/cuerpo-tecnico/nuevo",
    "/club/cuerpo-tecnico/3f330d16-fecc-4025-bc4c-5f52f304a20d/editar",
  ]) {
    assert.equal(direccionAContar(WEB + ruta), null, ruta);
  }
});

test("una dirección que no es una dirección no se cuenta", () => {
  assert.equal(direccionAContar("no es una url"), null);
  assert.equal(direccionAContar(""), null);
});
