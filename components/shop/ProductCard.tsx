import { TiltCard } from "@/components/ui/TiltCard";
import { formatPrice } from "@/content/games";
import type { Product } from "@/content/products";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import Link from "next/link";

/**
 * Carte d'un produit qui n'est pas un jeu (matériel, pack).
 *
 * Volontairement distincte de `GameCard` : pas de boîtier 3D, pas de studio,
 * et une puce qui annonce la nature du produit. Un acheteur doit voir d'un
 * coup d'œil qu'il regarde un accessoire et non un jeu.
 */
export function ProductCard({
  product,
  lang,
  t,
}: {
  product: Product;
  lang: Lang;
  t: Content;
}) {
  const isBundle = product.kind === "bundle";

  return (
    <TiltCard subtle as="article" className="card overflow-hidden">
      <Link
        href={path("shop", lang, product.slug)}
        className="flex h-full flex-col rounded-[inherit] p-6"
      >
        {/* Illustration : un pictogramme plutôt qu'une photo tant que les
            visuels réels ne sont pas fournis (voir imageId). */}
        <div className="flex justify-center py-8">
          <div
            aria-hidden="true"
            className={`flex size-24 items-center justify-center rounded-2xl border ${
              isBundle
                ? "border-ember/40 bg-[var(--color-ember-soft)] text-ember"
                : "border-slate bg-carbon text-smoke"
            }`}
          >
            <div className="size-12">
              {isBundle ? <BundleIcon /> : <DriveIcon />}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8rem] font-medium ${
            isBundle
              ? "border-ember/40 bg-[var(--color-ember-soft)] text-ember"
              : "border-slate bg-carbon text-smoke"
          }`}
        >
          {isBundle ? t.shop.kindBundle : t.shop.kindHardware}
        </span>

        <h3 className="display mt-3 text-[1.15rem] text-chalk">
          {product.name[lang]}
        </h3>
        <p className="mt-2 flex-1 text-[0.95rem] leading-[1.6] text-smoke">
          {product.tagline[lang]}
        </p>

        <p className="mt-5 text-[0.85rem] text-smoke">
          <span className="numeric text-[1.05rem] font-semibold text-chalk">
            {formatPrice(product.priceEUR, lang)}
          </span>
        </p>
      </Link>
    </TiltCard>
  );
}

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 48 48",
  "aria-hidden": true,
  className: "size-full",
};

/** Lecteur externe : un boîtier plat avec sa fente et son disque. */
function DriveIcon() {
  return (
    <svg {...STROKE}>
      <rect x="6" y="16" width="36" height="18" rx="2.5" />
      <path d="M12 25h14" />
      <circle cx="34" cy="25" r="2" />
      <path d="M42 22h4" />
    </svg>
  );
}

/** Pack : une boîte avec son ruban. */
function BundleIcon() {
  return (
    <svg {...STROKE}>
      <path d="M8 18h32v22H8Z" />
      <path d="M6 12h36v6H6Z" />
      <path d="M24 12v28" />
      <path d="M24 12c-3-6-9-5-9-1 0 2 4 1 9 1Zm0 0c3-6 9-5 9-1 0 2-4 1-9 1Z" />
    </svg>
  );
}
