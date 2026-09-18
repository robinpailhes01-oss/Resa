import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { offer } from "@/config/offer";
import { metadata as siteMetadata } from "@/content/fr/landing";
import "./globals.css";

const manrope = localFont({
  src: "../assets/fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

const isProduction = process.env.NODE_ENV === "production" && process.env.RESO_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(offer.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${offer.brandName}`,
  },
  description: siteMetadata.description[offer.launchMode],
  applicationName: offer.brandName,
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: offer.brandName,
    title: siteMetadata.title,
    description: siteMetadata.description[offer.launchMode],
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description[offer.launchMode],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="fr" className={`${manrope.variable} h-full`}>
      <head>
        {/* Signale la présence de JavaScript avant le premier rendu (onglets, FAQ, apparitions). */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-brand focus:px-4 focus:py-3 focus:text-white"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
