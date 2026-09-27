import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
