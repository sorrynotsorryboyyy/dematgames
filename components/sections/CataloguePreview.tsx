import { GameCard } from "@/components/shop/GameCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { GAMES } from "@/content/games";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Aperçu du catalogue sur la page d'accueil.
 *
 * La grille mêle nos propres éditions (puce « Édition DematGames ») et des
 * exemples de format. La mention qui les distingue est placée AVANT la
 * grille, délibérément : sous les cartes, elle serait lue après coup, une
 * fois l'illusion installée.
 */
export function CataloguePreview({ t, lang }: { t: Content; lang: Lang }) {
  // Nos éditions d'abord, puis des exemples de format pour compléter la
  // ligne. Trois au total : au-delà, la section devient une boutique alors
  // que la boutique n'ouvre pas encore.
  const own = GAMES.filter((g) => g.ownEdition);
  const sample = [...own, ...GAMES.filter((g) => !g.ownEdition)].slice(0, 3);

  return (
    <Section tone="void" labelledBy="preview-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.preview.eyebrow}</p>
          <h2 id="preview-title" className="display display-lg mt-4 text-chalk">
            {t.preview.title}
          </h2>
        </div>

        <Link
          href={path("shop", lang)}
          className="text-[0.95rem] text-ember underline underline-offset-4 transition-colors hover:text-chalk"
        >
          {t.preview.cta}
        </Link>
      </div>

      <p className="mt-8 rounded-lg border border-slate bg-carbon px-4 py-3 text-[0.95rem] leading-relaxed text-smoke">
        {t.preview.notice}
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sample.map((game, i) => (
          <Reveal key={game.slug} as="li" delay={(i + 1) as 1 | 2 | 3}>
            <GameCard game={game} lang={lang} t={t} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
