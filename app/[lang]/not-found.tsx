import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";
import { DEFAULT_LANG } from "@/content/types";
import { brandAssets } from "@/lib/brand";
import { getContent, path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Page 404 dans une langue.
 *
 * Sans elle, Next servait sa page brute : ni en-tête, ni pied de page, aucun
 * moyen de rebondir. Un visiteur arrivé par un lien périmé n'avait qu'à
 * fermer l'onglet.
 *
 * LIMITE CONNUE — un composant `not-found` ne reçoit pas les paramètres de
 * route : la langue n'est pas lisible ici, d'où le français par défaut. Une
 * 404 déclenchée depuis une page anglaise s'affichera donc en français, avec
 * une navigation qui, elle, mène aux bonnes pages. C'est le compromis retenu
 * plutôt que de rendre chaque page dynamique pour ce seul cas.
 */
export default function NotFound() {
  const lang = DEFAULT_LANG;
  const t = getContent(lang);

  return (
    <>
      <Header
        lang={lang}
        nav={t.nav}
        navLabel={t.footer.navTitle}
        brand={brandAssets()}
      />

      <main id="main" className="pt-[4.5rem]">
        <div className="mx-auto flex w-full max-w-[46rem] flex-col items-start px-5 py-24 sm:px-8 md:py-32">
          <p className="numeric font-mono text-[0.8rem] tracking-[0.2em] text-ember">
            {t.notFound.code}
          </p>

          <h1 className="display display-lg mt-4 text-chalk">
            {t.notFound.title}
          </h1>

          <p className="mt-5 max-w-xl text-[1.05rem] leading-[1.7] text-smoke">
            {t.notFound.body}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={`/${lang}`} variant="primary" size="lg">
              {t.notFound.home}
            </ButtonLink>
            <ButtonLink href={path("shop", lang)} variant="ghost" size="lg">
              {t.nav.shop}
            </ButtonLink>
          </div>

          <Link
            href={path("blog", lang)}
            className="mt-6 text-[0.95rem] text-ember underline underline-offset-4 transition-colors hover:text-chalk"
          >
            {t.nav.blog}
          </Link>
        </div>
      </main>

      <Footer t={t} lang={lang} />
    </>
  );
}
