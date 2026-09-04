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
                  {/* Recto : la question, encadrée par le numéro et le « + ».
                      Le numéro occupe le haut : sans lui, une question courte
                      laissait une grande surface vide au-dessus. */}
                  <span className="flip-face card flex flex-col justify-between p-6 text-left sm:p-7">
                    <span
                      aria-hidden="true"
                      className="numeric font-mono text-[0.72rem] tracking-[0.18em] text-smoke/70"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="display text-[1.08rem] leading-snug text-chalk">
                      {item.title}
                    </span>

                    <span
                      aria-hidden="true"
                      className="inline-flex size-8 items-center justify-center rounded-full border border-slate bg-ash text-ember transition-transform"
                    >
                      +
                    </span>
                  </span>

                  {/* Verso : la réponse. Présent dans le DOM en permanence. */}
                  <span className="flip-face flip-back card flex-col gap-3 border-ember/40 bg-[var(--color-ember-soft)] p-6 text-left sm:p-7">
                    <span
                      aria-hidden="true"
                      className="numeric font-mono text-[0.72rem] tracking-[0.18em] text-ember/70"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-[0.97rem] leading-[1.7] text-chalk">
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
