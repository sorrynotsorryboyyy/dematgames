"use client";

import { GameBox } from "./GameBox";
import { GAMES } from "@/content/games";
import { imageUrl } from "@/lib/images";

/**
 * Alignement d'éditions physiques — l'image que la section « Pourquoi
 * maintenant ? » doit produire : une collection, pas un produit isolé.
 *
 * Le composant listait auparavant cinq titres INVENTÉS, codés en dur et
 * indépendants du catalogue. Ils ont disparu avec les jeux fictifs : on ne
 * montre plus que des éditions réelles, sans quoi l'illustration
 * contredisait le propos de la section.
 *
 * La planche a également disparu : rendue par un rectangle plein, elle
 * traversait toute la largeur au lieu de suggérer un meuble. Les ombres
 * portées de chaque jaquette suffisent à poser les objets.
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
      <div className="relative flex items-end justify-center gap-5 overflow-x-auto px-4 pb-10 pt-10 sm:gap-8 md:gap-10 md:overflow-visible">
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

      {/* Plus de planche.
          Elle était rendue par un <div> de hauteur fixe portant un dégradé,
          c'est-à-dire un rectangle plein traversant toute la largeur : le
          problème tenait à la NATURE de l'élément, pas à sa couleur — le
          gris clair restait une barre, comme le noir avant lui.
          Chaque jaquette porte déjà son ombre portée, qui épouse sa forme
          et suffit à l'ancrer. */}

      <figcaption className="mt-4 text-center font-mono text-[0.7rem] tracking-[0.18em] text-smoke/70 uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}
