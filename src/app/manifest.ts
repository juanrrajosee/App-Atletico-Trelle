import type { MetadataRoute } from "next";

/**
 * La ficha para instalar la web como app en el móvil (Android: "Instalar
 * aplicación"; iPhone: "Añadir a pantalla de inicio"). Con ella se abre a
 * pantalla completa, con su nombre y el escudo del club, sin la barra del
 * navegador. No hace que funcione sin internet ni manda notificaciones.
 *
 * Next la sirve en /manifest.webmanifest y la enlaza desde todas las páginas.
 */
export default function manifest(): MetadataRoute.Manifest {
  // El blanco de la cabecera (el mismo que themeColor en layout.tsx).
  const blanco = "#ffffff";

  return {
    name: "Atlético Trelle",
    short_name: "Atlético Trelle",
    description:
      "La aplicación del Atlético Trelle: partidos y resultados, plantilla, estadísticas, votaciones de la afición y noticias del club.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: blanco,
    theme_color: blanco,
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/iconos/icono-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
