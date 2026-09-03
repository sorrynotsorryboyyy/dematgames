"use client";

import { useTilt } from "@/lib/useTilt";
import type { ElementType, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** L'élément rendu — `li` dans une liste, `article` pour une carte produit. */
  as?: ElementType;
  /** Amplitude réduite pour les grandes surfaces, où un fort tilt fatigue. */
  subtle?: boolean;
}

/**
 * Carte inclinable au survol.
 *
 * Même moteur que le boîtier du hero (lib/useTilt), mais amplitude très
 * inférieure : 6-8° contre 46° pour la boîte. Au-delà, le texte de la carte
 * devient pénible à lire — l'effet doit rester une texture, pas un obstacle.
 *
 * Réservé aux surfaces qui se lisent comme des objets (cartes, produits,
 * étapes). Jamais sur des paragraphes ou des champs de formulaire.
 */
export function TiltCard({
  children,
  className = "",
  as: Tag = "div",
  subtle = false,
}: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>({
    maxY: subtle ? 4 : 7,
    maxX: subtle ? 3 : 5,
    lift: subtle ? 4 : 8,
    scope: "element",
  });

  return (
    <div className="tilt-scene h-full">
      <Tag ref={ref} className={`tilt-target h-full ${className}`}>
        {children}
      </Tag>
    </div>
  );
}
