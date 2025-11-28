import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./ClientLayout";

// Optimizar fuentes - usar display: swap para evitar FOUT
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TUKSAQRO - Plataforma Inmobiliaria",
    template: "%s | TUKSAQRO"
  },
  description: "La plataforma inmobiliaria más completa de México. Encuentra, vende o renta propiedades con la mejor tecnología.",
  keywords: ["inmobiliaria", "propiedades", "casas", "departamentos", "venta", "renta", "México"],
  authors: [{ name: "TUKSAQRO Team" }],
  creator: "TUKSAQRO",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://tuksaqro.com",
    title: "TUKSAQRO - Plataforma Inmobiliaria",
    description: "La plataforma inmobiliaria más completa de México",
    siteName: "TUKSAQRO",
  },
  twitter: {
    card: "summary_large_image",
    title: "TUKSAQRO - Plataforma Inmobiliaria",
    description: "La plataforma inmobiliaria más completa de México",
    creator: "@tuksaqro",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Configuración de viewport para Next.js 14
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Exportar rutas para prefetching automático
export const dynamicParams = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Prefetch DNS para servicios externos */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
