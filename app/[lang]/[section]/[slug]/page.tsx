import { GameBox } from "@/components/box/GameBox";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { EditionPicker } from "@/components/shop/EditionPicker";
import { GAMES, getGame, PRICING_IS_INDICATIVE } from "@/content/games";
import { isLang, LANGS, type Lang } from "@/content/types";
import { getContent, path, ROUTES, SITE_URL } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/** Fiche produit : /fr/boutique/nocturne, /en/shop/nocturne. */

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    GAMES.map((game) => ({
      lang,
      section: ROUTES.shop[lang],
      slug: game.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, section, slug } = await params;
  if (!isLang(rawLang)) return {};
  const lang = rawLang as Lang;
  if (section !== ROUTES.shop[lang]) return {};

  const game = getGame(slug);
  if (!game) return {};

  return {
    metadataBase: new URL(SITE_URL),
    title: `${game.title} — dematgames.gg`,
    description: game.tagline[lang],
    alternates: {
      canonical: `/${lang}/${section}/${slug}`,
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `/${l}/${ROUTES.shop[l]}/${slug}`]),
      ),
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}) {
  const { lang: rawLang, section, slug } = await params;
  if (!isLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  // Seul le segment « boutique » de la langue courante porte des fiches.
  if (section !== ROUTES.shop[lang]) notFound();

  const game = getGame(slug);
  if (!game) notFound();

  const t = getContent(lang);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ember focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.nav.skipToContent}
      </a>

      <Header lang={lang} t={t} />

      <main id="main" className="pt-[4.5rem]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-12">
          <Link
            href={path("shop", lang)}
            className="inline-flex items-center gap-2 text-[0.9rem] text-smoke transition-colors hover:text-chalk"
          >
            <span aria-hidden="true">←</span>
            {t.shop.backToShop}
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Visuel */}
            <div className="flex items-start justify-center rounded-2xl border border-slate bg-carbon py-14">
              <GameBox
                title={game.title}
                studio={game.studio}
                hue={game.hue}
                pose="hero"
                width="clamp(190px, 34vw, 260px)"
              />
            </div>

            {/* Informations */}
            <div>
              <CategoryChip id={game.category} lang={lang} />

              <h1 className="display display-lg mt-4 text-chalk">{game.title}</h1>

              <p className="mt-3 text-[1rem] text-smoke">
                {t.shop.byStudio} {game.studio} · {t.shop.releasedIn} {game.year}
              </p>

              <p className="mt-6 text-[1.05rem] leading-[1.75] text-smoke">
                {game.description[lang]}
              </p>

              {PRICING_IS_INDICATIVE && (
                <p className="mt-6 rounded-lg border border-slate bg-carbon px-4 py-2.5 text-[0.88rem] text-smoke">
                  {t.shop.pricingNotice}
                </p>
              )}

              <div className="mt-10">
                <EditionPicker game={game} lang={lang} t={t} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </>
  );
}
