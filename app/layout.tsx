import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/**
 * Fraunces para títulos (com itálico nos momentos editoriais) e Inter para
 * corpo/UI, conforme a identidade visual. Ambas via next/font, self-hosted
 * e com `display: swap` para não bloquear o primeiro paint.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Comida Bairro Alto — Restaurante em Curitiba",
    template: "%s · Comida Bairro Alto",
  },
  description:
    "Gastronomia contemporânea com raízes na herança de imigração de Curitiba. Cardápio autoral, massa fresca do dia e barreado de dezoito horas, no Bairro Alto.",
  keywords: [
    "restaurante Curitiba",
    "Bairro Alto",
    "gastronomia contemporânea",
    "comida polonesa Curitiba",
    "barreado",
    "pierogi",
    "reservas restaurante Curitiba",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Comida Bairro Alto",
    title: "Comida Bairro Alto — Restaurante em Curitiba",
    description:
      "A herança das colônias servida em mesa de bairro. Reserve sua mesa no Bairro Alto, Curitiba.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Comida Bairro Alto",
    description: "Gastronomia contemporânea no Bairro Alto, Curitiba.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#EDE6DA",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="bg-paper text-ink flex min-h-full flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
