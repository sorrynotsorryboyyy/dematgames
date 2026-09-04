import { GameArtwork } from "@/components/shop/GameArtwork";
import { TiltCard } from "@/components/ui/TiltCard";
import { CategoryChip } from "@/components/shop/CategoryChip";
import { formatPrice, lowestPrice, type Game } from "@/content/games";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Carte produit du catalogue.
 *
 * La carte entière est un lien : toute la surface est cliquable, et un seul
 * élément focusable apparaît dans l'ordre de tabulation.
 */
export function GameCard({
  game,
  lang,
  t,
}: {
  game: Game;
  lang: Lang;
  t: Content;
}) {
  const from = lowestPrice(game);

  return (
    <TiltCard subtle as="article" className="card overflow-hidden">
      <Link
        href={path("shop", lang, game.slug)}
        className="flex h-full flex-col rounded-[inherit] p-6"
      >
        {/* Boîtier 3D ou photo produit : GameArtwork tranche. Le boîtier
            n'est pas interactif ici, la carte porte déjà le tilt. */}
        <div className="flex justify-center py-4">
          <GameArtwork game={game} size="card" className="max-w-[140px]" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <CategoryChip id={game.category} lang={lang} size="sm" />
          {/* Distingue nos éditions des exemples de format qui les entourent. */}
          {game.ownEdition && (
            <span className="rounded-full border border-ember/45 bg-[var(--color-ember-soft)] px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-ember uppercase">
              {t.preview.firstTitle}
            </span>
          )}
          {/* Sur un jeu pour enfants, la tranche d'âge est le premier
              critère d'achat : elle doit se lire sans ouvrir la fiche. */}
          {game.ageRating && (
            <span className="rounded-full border border-slate bg-ash px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-smoke">
              {game.ageRating[lang]}
            </span>
          )}
        </div>

        <h3 className="display mt-3 text-[1.15rem] text-chalk">
          {game.title}
          {game.subtitle && (
            <span className="block text-[0.82rem] font-medium tracking-[0.18em] text-ember uppercase">
              {game.subtitle[lang]}
            </span>
          )}
        </h3>
        <p className="mt-1 text-[0.88rem] text-smoke">{game.studio}</p>
        <p className="mt-3 flex-1 text-[0.95rem] leading-[1.6] text-smoke">
          {game.tagline[lang]}
        </p>

        <p className="mt-5 text-[0.85rem] text-smoke">
          {t.shop.priceFrom}{" "}
          <span className="numeric text-[1.05rem] font-semibold text-chalk">
            {formatPrice(from, lang)}
          </span>
        </p>
      </Link>
    </TiltCard>
  );
}
