import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Letra estrecha y fuerte, como la de los carteles del club, para los
// títulos y los marcadores.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atlético Trelle",
    template: "%s · Atlético Trelle",
  },
  description:
    "La aplicación del Atlético Trelle: partidos y resultados, plantilla, estadísticas, votaciones de la afición y noticias del club.",
};

// "cover" deja que la barra de navegación inferior use el espacio de la zona
// segura del móvil (la barra de gestos del iPhone, por ejemplo).
export const viewport: Viewport = {
  viewportFit: "cover",
  // Color de la barra del navegador en el móvil: el granate de la cabecera.
  themeColor: "#6e1520",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
