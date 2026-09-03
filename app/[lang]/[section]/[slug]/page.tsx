import { GameBox } from "@/components/box/GameBox";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { EditionPicker } from "@/components/shop/EditionPicker";
import { formatPrice, GAMES, getGame, PRICING_IS_INDICATIVE } from "@/content/games";
import { getProduct, PRODUCTS } from "@/content/products";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { PostArticle } from "@/components/blog/PostArticle";
import { getPost, listCategories } from "@/lib/blog";
import { isLang, LANGS, type Lang } from "@/content/types";
import { brandAssets } from "@/lib/brand";
import { getContent, path, ROUTES, SITE_URL } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/** Fiche produit : /fr/boutique/nocturne, /en/shop/nocturne. */

/**
 * Les articles de blog sont volontairement ABSENTS d'ici.
 *
 * Ils vivent dans Firestore et changent depuis l'admin : les prérendre
 * figerait le blog au moment du build, et publier un article demanderait un
 * redéploiement. Next les rend donc à la demande.
 */
export const dynamicParams = true;

export function generateStaticParams(): {
  lang: string;
  section: string;
  slug: string;
}[] {
  return LANGS.flatMap((lang) => [
    ...GAMES.map((game) => ({
      lang,
      section: ROUTES.shop[lang],
      slug: game.slug,
    })),
    // Les accessoires et packs partagent la même route que les jeux : un
    // acheteur ne fait pas la différence entre /boutique/nocturne et
    // /boutique/dematkiller, et il n'a pas à la faire.
    ...PRODUCTS.map((product) => ({
      lang,
      section: ROUTES.shop[lang],
      slug: product.slug,
    })),
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; section: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, section, slug } = await params;
  if (!isLang(rawLang)) return {};
  const lang = rawLang as Lang;

  // --- Article de blog ---
  if (section === ROUTES.blog[lang]) {
    const post = await getPost(slug, lang);
    if (!post) return {};
    const content = post.content[lang]!;
    return {
      metadataBase: new URL(SITE_URL),
      title: `${content.title} — dematgames.com`,
      description: content.excerpt,
      alternates: { canonical: `/${lang}/${section}/${slug}` },
      openGraph: {
        type: "article",
        title: content.title,
        description: content.excerpt,
        publishedTime: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : undefined,
      },
    };
  }

  // Hors blog, seul le segment « boutique » porte des fiches.
  if (section !== ROUTES.shop[lang]) return {};

  const product = getProduct(slug);
  if (product) {
    return {
      metadataBase: new URL(SITE_URL),
      title: `${product.name[lang]} — dematgames.com`,
      description: product.tagline[lang],
      alternates: {
        canonical: `/${lang}/${section}/${slug}`,
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `/${l}/${ROUTES.shop[l]}/${slug}`]),
        ),
      },
    };
  }

  const game = getGame(slug);
  if (!game) return {};

  return {
    metadataBase: new URL(SITE_URL),
    title: `${game.title} — dematgames.com`,
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
  // --- Article de blog ---
  if (section === ROUTES.blog[lang]) {
    const post = await getPost(slug, lang);
    if (!post) notFound();
    const categories = await listCategories();
    const t = getContent(lang);

    return (
      <>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ember focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          {t.nav.skipToContent}
        </a>

        <Header lang={lang} t={t} brand={brandAssets()} />

        <main id="main" className="pt-[4.5rem]">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-12">
            <Link
              href={path("blog", lang)}
              className="inline-flex items-center gap-2 text-[0.9rem] text-smoke transition-colors hover:text-chalk"
            >
              <span aria-hidden="true">←</span>
              {t.blog.backToBlog}
            </Link>

            <div className="mt-10">
              <PostArticle
                post={post}
                category={categories.find((c) => c.id === post.categoryId)}
                lang={lang}
                t={t}
              />
            </div>
          </div>
        </main>

        <Footer t={t} lang={lang} />
      </>
    );
  }

  // Seul le segment « boutique » de la langue courante porte des fiches.
  if (section !== ROUTES.shop[lang]) notFound();

  const product = getProduct(slug);
  const game = product ? undefined : getGame(slug);
  if (!product && !game) notFound();

  const t = getContent(lang);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ember focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.nav.skipToContent}
      </a>

      <Header lang={lang} t={t} brand={brandAssets()} />

      <main id="main" className="pt-[4.5rem]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-12">
          <Link
            href={path("shop", lang)}
            className="inline-flex items-center gap-2 text-[0.9rem] text-smoke transition-colors hover:text-chalk"
          >
            <span aria-hidden="true">←</span>
            {t.shop.backToShop}
          </Link>

          {product ? (
            /* --- Accessoire ou pack --- */
            <div className="mt-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div
                aria-hidden="true"
                className="flex items-center justify-center rounded-2xl border border-slate bg-carbon py-20"
              >
                <span
                  className={`flex size-32 items-center justify-center rounded-3xl border ${
                    product.kind === "bundle"
                      ? "border-ember/40 bg-[var(--color-ember-soft)] text-ember"
                      : "border-slate bg-ash text-smoke"
                  }`}
                >
                  <span className="numeric text-3xl font-semibold">
                    {formatPrice(product.priceEUR, lang)}
                  </span>
                </span>
              </div>

              <ProductDetail product={product} lang={lang} t={t} />
            </div>
          ) : game ? (
            /* --- Jeu --- */
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

                <h1 className="display display-lg mt-4 text-chalk">
                  {game.title}
                </h1>

                <p className="mt-3 text-[1rem] text-smoke">
                  {t.shop.byStudio} {game.studio} · {t.shop.releasedIn}{" "}
                  {game.year}
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
          ) : null}
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </>
  );
}
