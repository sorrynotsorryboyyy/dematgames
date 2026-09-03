import Image from "next/image";
import Link from "next/link";
import type { BrandAssets } from "@/lib/brand";

/**
 * Logo de la marque.
 *
 * Reçoit `assets` en props plutôt que de sonder le disque lui-même : le
 * header est un composant client, et y importer `node:fs` casserait le
 * build. La détection vit dans lib/brand.ts (serveur) et le résultat
 * traverse la frontière sous forme de simples booléens.
 *
 * REPLI VOLONTAIRE — tant qu'aucun fichier n'est déposé dans public/brand/,
 * on affiche le nom en texte. Le site ne doit pas casser parce qu'une image
 * manque : ce composant est sur chaque page.
 */
export function Logo({
  href,
  assets,
  className = "",
}: {
  href: string;
  assets: BrandAssets;
  className?: string;
}) {
  const { full, mark } = assets;

  return (
    <Link
      href={href}
      aria-label="DematGames.com"
      className={`inline-flex items-center ${className}`}
    >
      {full || mark ? (
        <>
          {/* Le logo complet devient illisible sous 640 px : on bascule sur
              la marque seule. Les deux images sont rendues et l'une est
              masquée par CSS — un rendu conditionnel côté client
              provoquerait un clignotement à l'hydratation. */}
          {full && (
            <Image
              src="/brand/logo-full.png"
              alt=""
              width={220}
              height={40}
              priority
              className={`h-8 w-auto ${mark ? "hidden sm:block" : ""}`}
            />
          )}
          {mark && (
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={40}
              height={40}
              priority
              className={`h-8 w-auto ${full ? "sm:hidden" : ""}`}
            />
          )}
        </>
      ) : (
        <span className="font-display text-[1.02rem] font-bold tracking-tight text-chalk">
          DematGames<span className="text-ember">.com</span>
        </span>
      )}
    </Link>
  );
}
