"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";
import { useState } from "react";

/**
 * FAQ en cartes qui se retournent.
 *
 * Remplace l'accordéon <details>/<summary>, trop classique.
 *
 * DEUX POINTS IMPORTANTS
 *
 * 1. La réponse est TOUJOURS dans le DOM. Le verso est masqué par
 *    `backface-visibility`, jamais démonté : sans cela, tout le contenu de
 *    la FAQ deviendrait invisible pour Google — un recul SEO net, alors que
 *    la FAQ est précisément le genre de contenu qu'on cherche à indexer.
 *
 * 2. Chaque carte est un vrai <button> avec `aria-expanded`. Un lecteur
 *    d'écran l'annonce et la manipule exactement comme un accordéon ; seule
 *    la présentation change.
 */
export function Faq({ faq }: { faq: Content["faq"] }) {
  // Une seule carte retournée à la fois : deux réponses ouvertes côte à côte
  // créeraient un décalage de hauteur désordonné.
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id={ANCHORS.faq} tone="void" labelledBy="faq-title">
      <Reveal className="max-w-2xl">
        <h2 id="faq-title" className="display display-lg text-chalk">
          {faq.title}
        </h2>
      </Reveal>

      <ul className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2">
        {faq.items.map((item, i) => {
          const flipped = open === i;
          return (
            <Reveal
              as="li"
              key={item.title}
              delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}
            >
              <div className="flip-scene h-full">
                <button
                  type="button"
                  onClick={() => setOpen(flipped ? null : i)}
                  aria-expanded={flipped}
                  className={`flip-card ${flipped ? "is-flipped" : ""}`}
                >
                  {/* Recto : la question */}
                  <span className="flip-face card flex flex-col justify-between p-7 text-left">
                    <span className="display text-[1.1rem] leading-snug text-chalk">
                      {item.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-6 inline-flex size-8 items-center justify-center rounded-full border border-slate text-ember transition-colors"
                    >
                      +
                    </span>
                  </span>

                  {/* Verso : la réponse. Présent dans le DOM en permanence. */}
                  <span className="flip-face flip-back card border-ember/40 bg-[var(--color-ember-soft)] p-7 text-left">
                    <span className="block text-[0.98rem] leading-[1.7] text-chalk">
                      {item.body}
                    </span>
                  </span>
                </button>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
