"use client";

import { useReveal } from "@/lib/useReveal";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Cascade : 1 à 5, ~90ms d'écart. Au-delà l'attente devient perceptible. */
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  /** L'élément rendu — `li` dans une liste, `section` pour un bloc, etc. */
  as?: ElementType;
}

/**
 * Enveloppe de révélation au scroll.
 *
 * Toute l'animation est en CSS (.reveal dans globals.css) ; ce composant
 * ne fait que basculer un attribut. Volontairement pas de `motion` ici :
 * la page en compte des dizaines d'instances.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed}
      data-delay={delay || undefined}
    >
      {children}
    </Tag>
  );
}
