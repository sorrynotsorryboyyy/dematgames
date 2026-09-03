import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { LANGS, isLang, type Lang } from "@/content/types";
import { getContent, otherLang, SITE_URL } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { SessionProvider } from "@/lib/session";
import "../globals.css";

/**
 * Polices self-hosted par next/font : aucune requête vers Google au runtime,
 * pas de FOIT, et le CSS des variables est inliné.
 *
 * Deux familles, chacune à sa place :
 *
 * - Inter pour le corps de texte. La lisibilité du texte courant n'est pas
 *   un terrain d'expérimentation.
 * - Space Grotesk pour les titres et les chiffres. Grotesque technique aux
 *   terminaisons coupées : le registre atelier/ingénierie de l'identité,
 *   typé sans être fantaisiste.
 *
 * La version précédente chargeait Inter DEUX FOIS (corps + display) : du
 * poids pour zéro différenciation. Space Grotesk remplace ce doublon.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
  colorScheme: "light",
};

/** Les deux langues sont prérendues à la build : zéro rendu serveur au runtime. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLang(raw)) return {};
  const lang = raw as Lang;
  const t = getContent(lang);
  const other = otherLang(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    keywords: t.meta.keywords,
    applicationName: "dematgames.gg",
    alternates: {
      canonical: `/${lang}`,
      languages: {
        [lang]: `/${lang}`,
        [other]: `/${other}`,
        "x-default": "/fr",
      },
    },
    openGraph: {
      type: "website",
      siteName: "dematgames.gg",
      locale: lang === "fr" ? "fr_FR" : "en_US",
      url: `/${lang}`,
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        {/* Panier et session sont locaux au navigateur (localStorage) : les
            providers enveloppent toutes les pages d'une langue. */}
        <SessionProvider>
          <CartProvider>{children}</CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
