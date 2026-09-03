"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { formatPrice, getGame } from "@/content/games";
import type { Content, Lang } from "@/content/types";
import { useCart } from "@/lib/cart";
import { ANCHORS, path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Panier et fin de parcours.
 *
 * IMPORTANT — aucun champ de paiement n'est présenté, nulle part. Le tunnel
 * s'arrête sur un message explicite : la boutique n'est pas ouverte. Une
 * maquette qui imite un vrai paiement amènerait des visiteurs à saisir de
 * véritables coordonnées bancaires.
 */
export function CartView({ lang, t }: { lang: Lang; t: Content }) {
  const { lines, total, ready, setQty, remove } = useCart();

  // Les lignes sont enrichies depuis le catalogue : le stockage ne contient
  // que des identifiants, jamais un prix.
  const items = lines.flatMap((line) => {
    const game = getGame(line.slug);
    const edition = game?.editions.find((e) => e.tier === line.tier);
    return game && edition ? [{ line, game, edition }] : [];
  });

  return (
    <>
      <h1 className="display display-lg text-chalk">{t.cart.title}</h1>

      {/* `ready` évite d'afficher « panier vide » le temps de lire le stockage. */}
      {!ready ? (
        <div className="mt-10 h-32" aria-hidden="true" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <p className="text-[1.05rem] text-smoke">{t.cart.empty}</p>
          <ButtonLink href={path("shop", lang)} className="mt-6" size="lg">
            {t.cart.emptyCta}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <ul className="divide-y divide-slate border-y border-slate">
            {items.map(({ line, game, edition }) => (
              <li
                key={`${line.slug}-${line.tier}`}
                className="flex flex-wrap items-start gap-4 py-6 sm:flex-nowrap"
              >
                <div className="flex-1">
                  <Link
                    href={path("shop", lang, game.slug)}
                    className="display text-[1.1rem] text-chalk transition-colors hover:text-ember"
                  >
                    {game.title}
                  </Link>
                  <p className="mt-1 text-[0.9rem] text-smoke capitalize">
                    {edition.tier} · {game.studio}
                  </p>

                  <button
                    type="button"
                    onClick={() => remove(line.slug, line.tier)}
                    className="mt-3 text-[0.85rem] text-smoke underline underline-offset-4 transition-colors hover:text-ember"
                  >
                    {t.cart.remove}
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[0.85rem] text-smoke">
                  <span className="sr-only sm:not-sr-only">{t.cart.quantity}</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={line.qty}
                    onChange={(e) =>
                      setQty(line.slug, line.tier, Number(e.target.value))
                    }
                    className="numeric h-10 w-16 rounded-lg border border-slate bg-ash px-2 text-center text-chalk"
                  />
                </label>

                <p className="numeric w-24 shrink-0 text-right font-semibold text-chalk">
                  {formatPrice(edition.priceEUR * line.qty, lang)}
                </p>
              </li>
            ))}
          </ul>

          <aside>
            <div className="card p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.95rem] text-smoke">{t.cart.subtotal}</span>
                <span className="numeric text-[1.35rem] font-semibold text-chalk">
                  {formatPrice(total, lang)}
                </span>
              </div>
              <p className="mt-2 text-[0.82rem] text-smoke">
                {t.cart.shippingNote}
              </p>

              {/* Bouton volontairement inactif et libellé sans ambiguïté :
                  pas un « Payer » inerte qui laisserait croire à une panne. */}
              <Button disabled className="mt-6 w-full" size="lg">
                {t.cart.checkoutDisabled}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Fin de parcours — le vrai appel à l'action de cette page. */}
      <section className="mt-16 rounded-2xl border border-slate border-t-2 border-t-ember bg-ash p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <h2 className="display text-[1.35rem] text-chalk">
          {t.cart.closedTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-[1.02rem] leading-[1.7] text-smoke">
          {t.cart.closedBody}
        </p>
        <ButtonLink
          href={`/${lang}#${ANCHORS.founding}`}
          className="mt-7"
          size="lg"
        >
          {t.cart.closedCta}
        </ButtonLink>
      </section>
    </>
  );
}
