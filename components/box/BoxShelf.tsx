"use client";

import { GameBox } from "./GameBox";

/**
 * Étagère de jeux indés en édition physique — l'image que la Section 5
 * doit produire : une collection, pas un produit isolé.
 *
 * Titres et teintes fixes (pas d'aléatoire) : le rendu serveur et client
 * doivent être identiques.
 */
const SHELF = [
  { title: "Nocturne", studio: "Pale Moth", hue: 8, rot: -3 },
  { title: "Driftwood", studio: "Two Hands", hue: 196, rot: 2 },
  { title: "Ashfall", studio: "Ember Lab", hue: 24, rot: -1.5 },
  { title: "Signal", studio: "Null Div", hue: 152, rot: 3 },
  { title: "Vela", studio: "Kite Works", hue: 268, rot: -2 },
] as const;

export function BoxShelf({ caption }: { caption: string }) {
  return (
    <figure className="relative">
      <div className="relative flex items-end justify-center gap-3 overflow-x-auto px-4 pb-6 pt-10 sm:gap-5 md:gap-7 md:overflow-visible">
        {SHELF.map((game) => (
          <div
            key={game.title}
            className="shrink-0 transition-transform duration-500 ease-out hover:-translate-y-3"
            style={{ transform: `rotate(${game.rot}deg)` }}
          >
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
          </div>
        ))}
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
