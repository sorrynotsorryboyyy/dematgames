import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AccountView } from "@/components/account/AccountView";
import { AuthView } from "@/components/account/AuthView";
import { CartView } from "@/components/shop/CartView";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { ShopCatalogue } from "@/components/shop/ShopCatalogue";
import { listCategories, listPosts } from "@/lib/blog";
import { PRICING_IS_INDICATIVE } from "@/content/games";
import { isLang, LANGS, type Lang } from "@/content/types";
import { brandAssets } from "@/lib/brand";
import { getContent, ROUTES, SITE_URL } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Route unique pour les sections localisées : /fr/boutique, /en/shop,
 * /fr/panier, /en/cart, /fr/compte, /en/account, /fr/connexion, /en/login.
 *
 * Un segment dynamique plutôt que huit dossiers : les URLs restent dans la
 * langue de la page (un /fr/shop mélangerait les deux langues), et l'ajout
 * d'une langue ne demande pas de créer de nouveaux répertoires.
 */

type SectionKey = "shop" | "cart" | "account" | "login" | "blog" | "admin";

/** Retrouve la section à partir du segment ET vérifie qu'il correspond à la langue. */
function resolveSection(segment: string, lang: Lang): SectionKey | null {
  for (const [key, paths] of Object.entries(ROUTES)) {
    // Le segment doit être celui de CETTE langue : /fr/shop doit donner 404,
    // sinon chaque page existerait sous deux URLs (duplicat SEO).
    if (paths[lang] === segment) return key as SectionKey;
  }
  return null;
}

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    Object.values(ROUTES).map((paths) => ({ lang, section: paths[lang] })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; section: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, section } = await params;
  if (!isLang(rawLang)) return {};
  const lang = rawLang as Lang;
  const key = resolveSection(section, lang);
  if (!key) return {};

  const t = getContent(lang);
  const titles: Record<SectionKey, string> = {
    shop: t.shop.title,
    cart: t.cart.title,
    account: t.account.title,
    login: t.account.auth.loginTitle,
    blog: t.blog.title,
    admin: "Administration",
  };
  const title = `${titles[key]} — dematgames.com`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: key === "shop" ? t.shop.intro : t.meta.description,
    alternates: {
      canonical: `/${lang}/${section}`,
      languages: Object.fromEntries(
        LANGS.map((l) => [l, `/${l}/${ROUTES[key][l]}`]),
      ),
    },
    // Panier, compte et connexion sont des pages d'état : rien à indexer.
    // Boutique et blog sont indexables ; panier, compte, connexion et
    // surtout /admin ne doivent jamais apparaître dans un moteur.
    robots:
      key === "shop" || key === "blog"
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ lang: string; section: string }>;
}) {
  const { lang: rawLang, section } = await params;
  if (!isLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const key = resolveSection(section, lang);
  if (!key) notFound();

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
        <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 md:py-20 lg:px-12">
          {key === "shop" && (
            <>
              <h1 className="display display-lg text-chalk">{t.shop.title}</h1>
              <p className="mt-5 max-w-2xl text-[1.08rem] leading-[1.7] text-smoke">
                {t.shop.intro}
              </p>
              {PRICING_IS_INDICATIVE && (
                <p className="mt-6 inline-block rounded-lg border border-slate bg-carbon px-4 py-2.5 text-[0.9rem] text-smoke">
                  {t.shop.pricingNotice}
                </p>
              )}
              <ShopCatalogue lang={lang} t={t} />
            </>
          )}

          {key === "blog" && (
            <BlogIndex
              lang={lang}
              t={t}
              posts={await listPosts(lang)}
              categories={await listCategories()}
            />
          )}

          {/* L'admin est protégé côté SERVEUR dans chaque route
              /api/admin/* : ce composant ne fait qu'éviter d'afficher une
              coquille vide à qui n'a pas les droits. */}
          {key === "admin" && <AdminShell lang={lang} />}

          {key === "cart" && <CartView lang={lang} t={t} />}
          {key === "account" && <AccountView lang={lang} t={t} />}
          {key === "login" && <AuthView lang={lang} t={t} />}
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </>
  );
}
