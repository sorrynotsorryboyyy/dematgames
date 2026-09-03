"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Révélation au scroll, sans librairie d'animation.
 *
 * Un IntersectionObserver bascule un attribut ; toute l'animation vit dans
 * globals.css et se limite à transform/opacity. C'est ce qui permet de ne
 * charger aucune dépendance d'animation sur la page.
 *
 * L'observer se déconnecte après la première apparition : les sections ne
 * rejouent pas leur animation quand on remonte, et rien ne tourne en fond.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  /** Marge de déclenchement : négatif = attendre que l'élément soit bien entré. */
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);
  const rootMargin = options?.rootMargin ?? "0px 0px -12% 0px";
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // IntersectionObserver est supporté par tous les navigateurs ciblés par
    // Next 16 ; pas de branche de repli à prévoir ici. Le filet de sécurité
    // pour « pas de JS du tout » est la règle .no-js .reveal dans globals.css.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, revealed };
}

/**
 * Abonnement à une media query via useSyncExternalStore.
 *
 * C'est le primitif prévu par React pour lire un état externe : pas de
 * setState dans un effet, pas de rendu en cascade, et le snapshot serveur
 * (`false`) garantit que le HTML prérendu correspond au premier rendu client.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  // Snapshot serveur : on part du principe qu'aucune préférence n'est connue.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * `true` si l'utilisateur a demandé à réduire les animations.
 *
 * Le CSS gère déjà la quasi-totalité des cas via @media (prefers-reduced-motion).
 * Ce hook sert aux animations pilotées en JS (boîtier 3D, pipeline), qu'une
 * règle CSS ne peut pas arrêter à la source.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * `true` sur les pointeurs fins (souris) et écrans larges.
 * Utilisé pour n'activer le suivi de souris du boîtier que là où il a du sens :
 * sur mobile il n'y a pas de curseur, et la boucle serait du calcul gratuit.
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine) and (min-width: 768px)");
}
