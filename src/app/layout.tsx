import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME } from "@/components/layout/logo";
import { Toaster } from "@/components/toaster";
import { FLASH_COOKIE } from "@/lib/flash-shared";
import { inter, outfit } from "@/fonts/fonts";
import "./globals.css";

/** Métadonnées par défaut ; chaque page complète le titre via le modèle. */
export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Réservez vos activités de plein air`,
  },
  description:
    "Accrobranche, kayak, escalade, tyrolienne… Découvrez les activités du Parc des Cimes et réservez votre place en ligne.",
  applicationName: SITE_NAME,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Valeur du cookie flash : transmise au Toaster pour qu'il réagisse à son changement.
  const flashKey = (await cookies()).get(FLASH_COOKIE)?.value;

  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster flashKey={flashKey} />
      </body>
    </html>
  );
}
