"use client";

import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Item } from "@/content/types";

/**
 * Étagère portant les trois problèmes.
 *
 * Le titre de la section dit « ... sauf sur nos étagères » : la planche est
 * donc VIDE DE JEUX. Ce qu'elle porte, ce sont les trois obstacles qui
 * empêchent un jeu indé d'y arriver. Y poser des boîtiers contredirait la
 * phrase juste au-dessus — l'étagère garnie vit dans BoxShelf, section
 * « Pourquoi maintenant », où elle sert de contrepoint.
 *
 * GÉOMÉTRIE — le point délicat : les cartes doivent REPOSER sur la planche,
 * pas flotter au-dessus. Trois choses s'en chargent :
 *   1. chaque <li> est un flex column avec `justify-end`, donc la carte est
 *      poussée vers le bas de la rangée quelle que soit sa hauteur ;
 *   2. les cartes ne sont PAS inclinées (une rotation décolle un coin de la
 *      planche et trahit immédiatement l'illusion) ;
 *   3. la planche est collée aux cartes (`-mt-px`), sans espace intermédiaire.
 */
export function ProblemShelf({ cards }: { cards: Item[] }) {
  return (
    <div className="relative mt-16 md:mt-20">
      {/* --- Desktop : une seule planche porte les trois cartes --- */}
      <div className="relative hidden md:block">
        <div className="relative px-6 lg:px-8">
          {/* Montants : ils encadrent les cartes ET la planche, d'où le
              positionnement absolu sur toute la hauteur du bloc. */}
          <Uprights />

          <ul className="relative z-[2] grid grid-cols-3 gap-5 lg:gap-6">
            {cards.map((card, i) => (
              <Reveal
                as="li"
                key={card.title}
                delay={(i + 1) as 1 | 2 | 3}
                className="flex flex-col justify-end"
              >
                <ShelfCard card={card} index={i} />
              </Reveal>
            ))}
          </ul>
        </div>

        <Plank />
      </div>

      {/* --- Mobile : une planche par carte ---
          Trois cartes côte à côte sous 768 px deviennent illisibles ; on
          empile plutôt trois petites étagères, ce qui garde la métaphore. */}
      <ul className="space-y-12 md:hidden">
        {cards.map((card, i) => (
          <Reveal as="li" key={card.title} delay={(i + 1) as 1 | 2 | 3}>
            <div className="relative">
              <div className="relative px-5">
                <Uprights />
                <div className="relative z-[2]">
                  <ShelfCard card={card} index={i} />
                </div>
              </div>
              <Plank />
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Une carte posée sur la planche, avec son ombre de contact. */
function ShelfCard({ card, index }: { card: Item; index: number }) {
  return (
    <div className="relative">
      <TiltCard subtle className="card p-6 lg:p-7">
        <span
          aria-hidden="true"
          className="numeric inline-flex size-8 items-center justify-center rounded-lg bg-[var(--color-ember-soft)] text-[0.8rem] font-semibold text-ember"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="display mt-4 text-lg text-chalk lg:text-xl">
          {card.title}
        </h3>
        <p className="mt-3 text-[0.98rem] leading-[1.65] text-smoke">
          {card.body}
        </p>
      </TiltCard>

      {/* Ombre de contact, juste sous la base de la carte : c'est ce détail
          qui fait « posé sur » la planche plutôt que « superposé à » elle. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-2 top-full h-2.5 rounded-[50%] blur-[5px]"
        style={{ background: "rgb(22 22 26 / 0.28)" }}
      />
    </div>
  );
}

/** Les deux montants latéraux, sur toute la hauteur du bloc. */
function Uprights() {
  return (
    <div aria-hidden="true">
      <div
        className="absolute inset-y-0 left-0 w-3 rounded-t-sm lg:w-3.5"
        style={{ background: WOOD_SIDE }}
      />
      <div
        className="absolute inset-y-0 right-0 w-3 rounded-t-sm lg:w-3.5"
        style={{ background: WOOD_SIDE }}
      />
    </div>
  );
}

/** La planche horizontale, avec sa tranche et son ombre portée. */
function Plank() {
  return (
    <div aria-hidden="true" className="relative z-[3]">
      {/* Le dessus de la planche, collé à la base des cartes. */}
      <div className="h-3 rounded-sm lg:h-3.5" style={{ background: WOOD_TOP }} />
      {/* La tranche, plus sombre : donne l'épaisseur. */}
      <div
        className="mx-[3px] h-2 rounded-b-sm"
        style={{ background: WOOD_EDGE }}
      />
      {/* Ombre portée au sol, sous l'étagère. */}
      <div
        className="mx-auto h-10 w-[95%]"
        style={{
          background:
            "linear-gradient(to bottom, rgb(22 22 26 / 0.14), transparent 70%)",
        }}
      />
    </div>
  );
}

/* Bois clair — chaud, discret, cohérent avec le fond papier du thème.
   Défini ici plutôt que dans globals.css : ces trois teintes ne servent
   qu'à ce composant. */
const WOOD_TOP =
  "linear-gradient(to bottom, #e8ddcd 0%, #dccbb4 55%, #cdb99f 100%)";
const WOOD_EDGE = "linear-gradient(to bottom, #c4ad91 0%, #ab9276 100%)";
const WOOD_SIDE =
  "linear-gradient(to right, #cdb99f 0%, #e0d1bc 45%, #c4ad91 100%)";
