"use client";

import { Button } from "@/components/ui/Button";
import { formatPrice, type Game } from "@/content/games";
import type { Content, Lang } from "@/content/types";
import { useCart } from "@/lib/cart";
import { path } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";

/**
 * Choix d'édition + ajout au panier.
 *
 * Le prix affiché vient toujours du catalogue, jamais du panier stocké.
 */
export function EditionPicker({
  game,
  lang,
  t,
}: {
  game: Game;
  lang: Lang;
  t: Content;
}) {
  const { add } = useCart();
  const [tier, setTier] = useState(game.editions[0].tier);
  const [justAdded, setJustAdded] = useState(false);

  const edition = game.editions.find((e) => e.tier === tier) ?? game.editions[0];

  function onAdd() {
    add(game.slug, edition.tier);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <div>
      <h2 className="display text-[1.15rem] text-chalk">
        {t.shop.chooseEdition}
      </h2>

      {/* Groupe de radios : sémantique correcte et navigable au clavier
          (flèches), contrairement à une liste de boutons. */}
      <fieldset className="mt-4">
        <legend className="sr-only">{t.shop.chooseEdition}</legend>
        <div className="space-y-2.5">
          {game.editions.map((option) => {
            const selected = option.tier === tier;
            return (
              <label
                key={option.tier}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                  selected
                    ? "border-ember bg-[var(--color-ember-soft)]"
                    : "border-slate bg-ash hover:border-smoke"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="edition"
                    value={option.tier}
                    checked={selected}
                    onChange={() => setTier(option.tier)}
                    className="size-4 accent-[var(--color-ember)]"
                  />
                  <span>
                    <span className="block font-semibold text-chalk capitalize">
                      {option.tier}
                    </span>
                    {option.limited && (
                      <span className="block text-[0.8rem] text-smoke">
                        {t.shop.limitedRun} · {option.limited}
                      </span>
                    )}
                  </span>
                </span>
                <span className="numeric shrink-0 font-semibold text-chalk">
                  {formatPrice(option.priceEUR, lang)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <h3 className="text-[0.85rem] font-semibold text-chalk">
          {t.shop.includes}
        </h3>
        <ul className="mt-3 space-y-2">
          {edition.includes[lang].map((item) => (
            <li key={item} className="flex items-baseline gap-2.5 text-[0.98rem] text-smoke">
              <span aria-hidden="true" className="text-[0.8rem] text-ember">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onAdd} size="lg">
          {t.shop.addToCart} · {formatPrice(edition.priceEUR, lang)}
        </Button>
        <Link
          href={path("cart", lang)}
          className="text-[0.9rem] text-smoke underline underline-offset-4 transition-colors hover:text-chalk"
        >
          {t.nav.cart}
        </Link>
      </div>

      {/* aria-live : le lecteur d'écran annonce l'ajout sans déplacer le focus. */}
      <p aria-live="polite" className="mt-3 h-5 text-[0.9rem] text-ember">
        {justAdded ? t.shop.added : ""}
      </p>
    </div>
  );
}
