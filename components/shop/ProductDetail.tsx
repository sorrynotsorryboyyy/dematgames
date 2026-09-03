"use client";

import { Button } from "@/components/ui/Button";
import { formatPrice, GAMES, PRICING_IS_INDICATIVE } from "@/content/games";
import type { Product } from "@/content/products";
import type { Content, Lang } from "@/content/types";
import { useState } from "react";

/**
 * Fiche d'un accessoire ou d'un pack.
 *
 * Le pack DematKiller laisse choisir un jeu du catalogue (`picksGame`) : le
 * choix est enregistré localement, sans engagement — la boutique n'ouvre pas.
 *
 * La remise de 10 % est DÉCRITE mais aucun code n'est distribué : promettre
 * un avantage qu'on ne peut pas encore honorer serait un mauvais départ.
 */
export function ProductDetail({
  product,
  lang,
  t,
}: {
  product: Product;
  lang: Lang;
  t: Content;
}) {
  const [pickedGame, setPickedGame] = useState("");
  const [added, setAdded] = useState(false);

  const isBundle = product.kind === "bundle";
  // Le pack impose de choisir un jeu avant d'ajouter : sans cela on
  // enregistrerait une commande incomplète.
  const ready = !product.picksGame || pickedGame !== "";

  return (
    <div>
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.8rem] font-medium ${
          isBundle
            ? "border-ember/40 bg-[var(--color-ember-soft)] text-ember"
            : "border-slate bg-carbon text-smoke"
        }`}
      >
        {isBundle ? t.shop.kindBundle : t.shop.kindHardware}
      </span>

      <h1 className="display display-lg mt-4 text-chalk">
        {product.name[lang]}
      </h1>
      <p className="mt-3 text-[1.05rem] text-smoke">{product.tagline[lang]}</p>

      <p className="mt-6 text-[1.05rem] leading-[1.75] text-smoke">
        {product.description[lang]}
      </p>

      {PRICING_IS_INDICATIVE && (
        <p className="mt-6 rounded-lg border border-slate bg-carbon px-4 py-2.5 text-[0.88rem] text-smoke">
          {t.shop.pricingNotice}
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-[0.85rem] font-semibold text-chalk">
          {t.shop.includes}
        </h2>
        <ul className="mt-3 space-y-2">
          {product.includes[lang].map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-2.5 text-[0.98rem] text-smoke"
            >
              <span aria-hidden="true" className="text-[0.8rem] text-ember">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Choix du jeu, pour les packs qui en proposent un. */}
      {product.picksGame && (
        <div className="mt-8">
          <label
            htmlFor="pack-game"
            className="text-[0.9rem] font-medium text-chalk"
          >
            {t.shop.pickGame}
          </label>
          <select
            id="pack-game"
            value={pickedGame}
            onChange={(e) => {
              setPickedGame(e.target.value);
              setAdded(false);
            }}
            className="mt-2 h-12 w-full appearance-none rounded-lg border border-slate bg-ash px-4 text-[0.95rem] text-chalk transition-colors hover:border-smoke sm:max-w-sm"
          >
            <option value="" disabled>
              {t.shop.pickGamePlaceholder}
            </option>
            {GAMES.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.title} — {game.studio}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          size="lg"
          disabled={!ready}
          onClick={() => setAdded(true)}
        >
          {t.shop.addToCart} · {formatPrice(product.priceEUR, lang)}
        </Button>
      </div>

      <p aria-live="polite" className="mt-3 h-5 text-[0.9rem] text-ember">
        {added ? t.shop.added : ""}
      </p>
    </div>
  );
}
