"use client";

import { Analytics, type BeforeSend } from "@vercel/analytics/next";
import { direccionAContar } from "@/lib/visitas";

/**
 * El contador de visitas de Vercel (Web Analytics): cuántas personas entran y
 * qué páginas ven. No usa cookies ni identifica a nadie. Solo cuenta las
 * páginas públicas y sin lo que va detrás de la dirección: ver
 * src/lib/visitas.ts.
 */
const alContar: BeforeSend = (evento) => {
  const direccion = direccionAContar(evento.url);
  return direccion ? { ...evento, url: direccion } : null;
};

export function Visitas() {
  return <Analytics beforeSend={alContar} />;
}
