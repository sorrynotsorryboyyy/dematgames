import { GameBox } from "@/components/box/GameBox";
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
        {/* Le boîtier n'est pas interactif ici : la carte porte déjà le tilt. */}
        <div className="flex justify-center py-4">
          <GameBox
            title={game.title}
            studio={game.studio}
            hue={game.hue}
            pose="shelf"
            width="clamp(110px, 30vw, 140px)"
            interactive={false}
            float={false}
            showDisc={false}
          />
        </div>

        <div className="mt-5">
          <CategoryChip id={game.category} lang={lang} size="sm" />
        </div>

        <h3 className="display mt-3 text-[1.15rem] text-chalk">{game.title}</h3>
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
