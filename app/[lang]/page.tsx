import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CataloguePreview } from "@/components/sections/CataloguePreview";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { OpeningAlert } from "@/components/sections/OpeningAlert";
import { WhyNow } from "@/components/sections/WhyNow";
import { isLang, type Lang } from "@/content/types";
import { brandAssets } from "@/lib/brand";
import { listCategories, listPosts } from "@/lib/blog";
import { getContent, SITE_URL } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const t = getContent(lang);

  // JSON-LD : décrit l'organisation et le site aux moteurs de recherche.
  // Aucune donnée inventée (pas de note, d'avis ni de chiffre d'affaires).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "dematgames.com",
        url: SITE_URL,
        description: t.meta.description,
        slogan: t.footer.signature,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "dematgames.com",
        description: t.meta.description,
        inLanguage: lang,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Contenu statique issu de nos propres fichiers : aucune entrée utilisateur.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Lien d'évitement : première cible au clavier. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ember focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-void"
      >
        {t.nav.skipToContent}
      </a>

      <Header
        lang={lang}
        nav={t.nav}
        navLabel={t.footer.navTitle}
        brand={brandAssets()}
      />

      {/*
        L'accueil s'adresse aux JOUEURS.

        Le parcours en six étapes et l'appel aux studios en sont sortis : ils
        exposaient le modèle économique (financement, pourcentage reversé),
        qui se discute en privé, et parlaient à la mauvaise personne. Ils
        vivent désormais sur la page « proposer mon jeu ».
      */}
      <main id="main">
        <Hero t={t} lang={lang} />
        <WhyNow t={t} />
        <CataloguePreview t={t} lang={lang} />
        <OpeningAlert o={t.opening} />
        <LatestPosts
          lang={lang}
          t={t}
          posts={await listPosts(lang)}
          categories={await listCategories()}
        />
        <Faq faq={t.faq} />
      </main>

      <Footer t={t} lang={lang} />
    </>
  );
}
