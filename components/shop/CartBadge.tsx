"use client";

import type { Content, Lang } from "@/content/types";
import { useCart } from "@/lib/cart";
import { path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Lien panier avec compteur.
 *
 * `ready` est faux tant que le localStorage n'a pas été lu : on n'affiche
 * alors aucun compteur. Rendre un « 0 » puis le remplacer provoquerait un
 * saut visuel, et rendre le vrai total côté serveur serait impossible.
 */
export function CartBadge({
  lang,
  nav,
}: {
  lang: Lang;
  nav: Content["nav"];
}) {
  const { count, ready } = useCart();

  return (
    <Link
      href={path("cart", lang)}
      aria-label={ready && count > 0 ? `${nav.cart} (${count})` : nav.cart}
      className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-smoke transition-colors hover:bg-carbon hover:text-chalk"
    >
      <CartIcon />
      <span className="hidden sm:inline">{nav.cart}</span>
      {ready && count > 0 && (
        <span className="numeric inline-flex min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[0.7rem] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1.15rem]"
    >
      <path d="M4 5h2l1.6 9.3a2 2 0 0 0 2 1.7h6.9a2 2 0 0 0 2-1.6L20 8H7" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </svg>
  );
}
