"use client";

import { GameBox } from "./GameBox";
import { GAMES } from "@/content/games";
import { imageUrl } from "@/lib/images";

/**
 * Étagère d'éditions physiques — l'image que la section « Pourquoi
 * maintenant ? » doit produire : une collection, pas un produit isolé.
 *
 * Le composant listait auparavant cinq titres INVENTÉS, codés en dur et
 * indépendants du catalogue. Ils ont disparu avec les jeux fictifs : cette
 * étagère ne montre plus que des éditions réelles, sans quoi elle
 * contredisait le propos de la section qu'elle illustre.
 *
 * Rotations et écarts se calculent depuis l'index et le total, jamais depuis
 * une table figée : le catalogue grandira, et cinq boîtiers alignés ne se
 * disposent pas comme deux.
 */

/** Amplitude d'inclinaison, en degrés, du premier au dernier boîtier. */
const TILT_SPREAD = 7;

export function BoxShelf({ caption }: { caption: string }) {
  const shelf = GAMES;
  if (shelf.length === 0) return null;

  return (
    <figure className="relative">
      <div className="relative flex items-end justify-center gap-5 overflow-x-auto px-4 pb-6 pt-10 sm:gap-8 md:gap-10 md:overflow-visible">
        {shelf.map((game, i) => {
          // Éventail centré : le premier penche à gauche, le dernier à
          // droite. Avec un seul boîtier, l'inclinaison est nulle.
          const t = shelf.length > 1 ? i / (shelf.length - 1) - 0.5 : 0;
          const rotate = t * TILT_SPREAD * 2;
          const cover = imageUrl(game.coverId, { width: 400 });

          return (
            <div
              key={game.slug}
              className="shrink-0 transition-transform duration-500 ease-out motion-safe:hover:-translate-y-3"
              style={{ transform: `rotate(${rotate.toFixed(2)}deg)` }}
            >
              {game.productShot && cover ? (
                /* eslint-disable-next-line @next/next/no-img-element --
                   Cloudinary sert déjà format, qualité et densité. */
                <img
                  src={cover}
                  // Décoratif : la légende de la figure porte le sens.
                  alt=""
                  width={158}
                  height={237}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block h-auto w-[clamp(96px,13vw,158px)] select-none rounded-[4px] shadow-[0_18px_36px_-14px_rgba(0,0,0,0.5)]"
                />
              ) : (
                <GameBox
                  title={game.title}
                  studio={game.studio}
                  hue={game.hue}
                  pose="shelf"
                  width="clamp(96px, 13vw, 158px)"
                  interactive={false}
                  float={false}
                  showDisc={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* La planche de l'étagère : une ligne et une ombre portée suffisent. */}
      <div className="relative mx-auto h-px w-[94%] bg-gradient-to-r from-transparent via-slate to-transparent" />
      <div
        aria-hidden="true"
        className="mx-auto h-16 w-[92%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 78%)",
        }}
      />

      <figcaption className="mt-2 text-center font-mono text-[0.7rem] tracking-[0.18em] text-smoke/70 uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}
