"use client";

import { GameCard } from "@/components/shop/GameCard";
import { CATEGORIES, type CategoryId } from "@/content/categories";
import { GAMES } from "@/content/games";
import type { Content, Lang } from "@/content/types";
import { useMemo, useState } from "react";

/**
 * Catalogue filtrable.
 *
 * Les filtres sont de vrais <button> avec `aria-pressed` — pas des pastilles
 * colorées. L'état actif se lit à la fois par la couleur, par le fond plein
 * et par l'attribut ARIA : la couleur ne porte jamais seule l'information.
 */
export function ShopCatalogue({ lang, t }: { lang: Lang; t: Content }) {
  const [active, setActive] = useState<CategoryId | "all">("all");

  const games = useMemo(
    () => (active === "all" ? GAMES : GAMES.filter((g) => g.category === active)),
    [active],
  );

  // Seules les catégories réellement représentées sont proposées : un filtre
  // qui ne renvoie jamais rien serait une impasse.
  const available = useMemo(() => {
    const used = new Set(GAMES.map((g) => g.category));
    return CATEGORIES.filter((c) => used.has(c.id));
  }, []);

  const count =
    games.length === 1
      ? t.shop.resultsOne
      : t.shop.resultsMany.replace("{n}", String(games.length));

  return (
    <>
      <div className="mt-10">
        <h2 className="sr-only">{t.shop.filterLabel}</h2>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={active === "all"}
            onClick={() => setActive("all")}
            label={t.shop.filterAll}
          />
          {available.map((category) => (
            <FilterButton
              key={category.id}
              active={active === category.id}
              onClick={() => setActive(category.id)}
              label={category.label[lang]}
              color={category.color}
            />
          ))}
        </div>
        <p aria-live="polite" className="mt-4 text-[0.9rem] text-smoke">
          {count}
        </p>
      </div>

      {games.length === 0 ? (
        <p className="mt-12 text-[1.05rem] text-smoke">{t.shop.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <li key={game.slug}>
              <GameCard game={game} lang={lang} t={t} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-all ${
        active
          ? "border-transparent text-white shadow-[var(--shadow-soft)]"
          : "border-slate bg-ash text-smoke hover:border-smoke hover:text-chalk"
      }`}
      style={active ? { backgroundColor: color ?? "#16161a" } : undefined}
    >
      {color && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ backgroundColor: active ? "#fff" : color }}
        />
      )}
      {label}
    </button>
  );
}
