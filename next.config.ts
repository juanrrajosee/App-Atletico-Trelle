import type { NextConfig } from "next";
import { CABECERAS_SEGURIDAD } from "./src/lib/seguridad";

const nextConfig: NextConfig = {
  // No decir con qué está hecha la app (cabecera X-Powered-By: Next.js).
  poweredByHeader: false,
  // Cabeceras de seguridad en todas las respuestas. La Content-Security-Policy
  // la pone el proxy, porque cambia en cada petición.
  async headers() {
    return [{ source: "/:ruta*", headers: CABECERAS_SEGURIDAD }];
  },
  experimental: {
    serverActions: {
      // Las fotos de la tienda se reducen en el móvil antes de enviarlas,
      // pero se deja margen por si el navegador no puede y se sube la
      // original (hasta 3 MB, más lo que ocupa el resto del formulario).
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
