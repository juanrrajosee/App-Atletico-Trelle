import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { connection } from "next/server";
import { Visitas } from "@/components/visitas";
import "./globals.css";

// La letra de toda la aplicación; en su peso más grueso (900), la de los
// titulares grandes.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atlético Trelle",
    template: "%s · Atlético Trelle",
  },
  description:
    "La aplicación del Atlético Trelle: partidos y resultados, plantilla, estadísticas, votaciones de la afición y noticias del club.",
  // Al instalarla en el móvil (ver src/app/manifest.ts): el nombre bajo el
  // icono y la barra de estado del iPhone en blanco, como la cabecera.
  applicationName: "Atlético Trelle",
  appleWebApp: {
    capable: true,
    title: "Atlético Trelle",
    statusBarStyle: "default",
  },
};

// "cover" deja que la barra de navegación inferior use el espacio de la zona
// segura del móvil (la barra de gestos del iPhone, por ejemplo).
export const viewport: Viewport = {
  viewportFit: "cover",
  // Color de la barra del navegador en el móvil: el blanco de la cabecera.
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Todas las páginas se generan en cada petición: así sus scripts llevan el
  // nonce de la Content-Security-Policy (ver src/proxy.ts). Una página
  // generada de antemano no lo tendría y el navegador no la dejaría funcionar.
  await connection();

  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Visitas />
      </body>
    </html>
  );
}
