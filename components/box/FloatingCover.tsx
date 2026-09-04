"use client";

import { useTilt } from "@/lib/useTilt";
import { useReducedMotion } from "@/lib/useReveal";

/**
 * Jaquette en photo produit, animée.
 *
 * Les jaquettes fournies sont des rendus du boîtier fini : elles ne passent
 * pas par `GameBox`, qui applique une image à plat sur un boîtier 3D. Elles
 * perdaient du même coup toute animation — ce composant la leur rend.
 *
 * Rien de nouveau côté moteur : `useTilt` (partagé avec GameBox et les
 * cartes), `float-box` et `sheen` existaient déjà. On les applique
 * simplement à une image.
 *
 * `prefers-reduced-motion` est neutralisé en amont par une règle globale de
 * globals.css, et `useTilt` s'auto-désactive. Rien ici ne dépend du
 * mouvement pour rester lisible.
 */
export function FloatingCover({
  src,
  width,
  /** Décale la boucle de flottement, pour que deux jaquettes ne montent pas à l'unisson. */
  delay = 0,
  /** Inclinaison au repos, en degrés — donne la composition en éventail. */
  rotate = 0,
  priority = false,
  className = "",
}: {
  src: string;
  width: number;
  delay?: number;
  rotate?: number;
  priority?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();

  // Portée `element` : la boucle ne tourne qu'entre pointerenter et
  // pointerleave. Deux jaquettes en boucle permanente pour un effet qu'on
  // ne regarde qu'au survol seraient du calcul gaspillé.
  const ref = useTilt<HTMLDivElement>({
    scope: "element",
    maxY: 14,
    maxX: 10,
    lift: 26,
    ease: 0.09,
  });

  return (
    <div
      className={`group relative ${className}`}
      style={{ width, perspective: "1100px" }}
    >
      <div
        // Le flottement porte sur un conteneur SÉPARÉ du tilt : les deux
        // écrivent dans `transform`, et les cumuler sur le même élément
        // ferait que l'un écrase l'autre.
        className={reduced ? "" : "animate-float-box"}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          ref={ref}
          className="relative transition-shadow duration-500 will-change-transform"
          style={{
            transform: `rotate(${rotate}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary
              sert déjà le format, la qualité et la densité (f_auto,q_auto,
              dpr_auto) : repasser par next/image facturerait une seconde
              optimisation sur une image déjà servie par un CDN. */}
          <img
            src={src}
            // Décoratif : le titre et le studio sont écrits en texte à côté.
            alt=""
            width={width}
            height={Math.round(width * 1.5)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="block h-auto w-full select-none rounded-[6px] shadow-[0_28px_60px_-22px_rgba(0,0,0,0.55)]"
          />

          {/* Reflet spéculaire, au survol seulement : le boîtier accroche la
              lumière comme un objet, pas comme une vignette. */}
          {!reduced && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]"
            >
              <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-[sheen_1.1s_ease-out]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
