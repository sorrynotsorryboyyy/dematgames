"use client";

import { StepIcon } from "@/components/journey/StepIcon";
import type { Step } from "@/content/types";
import { useReducedMotion, useReveal } from "@/lib/useReveal";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/** Durée d'affichage d'une étape avant passage à la suivante. */
const STEP_MS = 5000;

/**
 * Le parcours, une étape à la fois.
 *
 * Remplace l'ancienne scène du camion : le récit n'est plus une chaîne de
 * fabrication mais un processus de service, qui commence par une
 * conversation.
 *
 * DÉFILEMENT AUTOMATIQUE — et ses garde-fous
 *
 * Les étapes défilent seules toutes les 5 s, mais un carrousel automatique
 * sur du texte explicatif devient vite pénible. Trois protections :
 *
 * 1. Il ne démarre qu'une fois la section VISIBLE (useReveal) : rien ne
 *    tourne hors écran, et le visiteur ne rate pas les premières étapes.
 * 2. Il s'ARRÊTE DÉFINITIVEMENT dès la première interaction (clic, flèche,
 *    focus clavier). Quelqu'un qui prend la main veut lire à son rythme ;
 *    reprendre le défilement lui volerait sa place.
 * 3. Il est désactivé en `prefers-reduced-motion`, où il devient une
 *    distraction non consentie.
 *
 * Le survol met aussi en pause : on ne change pas de contenu sous le
 * curseur de quelqu'un en train de lire.
 *
 * AUTRE CHOIX : toutes les étapes restent dans le DOM, masquées par
 * `hidden`. Un composant qui ne monterait que l'étape active rendrait cinq
 * étapes sur six invisibles aux moteurs de recherche, aux lecteurs d'écran
 * et à la recherche Ctrl+F du navigateur.
 */
export function JourneySteps({
  steps,
  labels,
}: {
  steps: Step[];
  labels: { prev: string; next: string; progress: string };
}) {
  const [active, setActive] = useState(0);
  /** Passe à true à la première interaction : le défilement ne reprend plus. */
  const [taken, setTaken] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);
  const total = steps.length;

  const reduced = useReducedMotion();
  // La section doit être visible pour que le défilement démarre.
  const { ref: sceneRef, revealed } = useReveal<HTMLDivElement>();

  const autoplay = revealed && !taken && !hovered && !reduced;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      // Boucle ici (contrairement à la navigation manuelle) : sans retour au
      // début, le défilement s'arrêterait tout seul à la dernière étape.
      setActive((i) => (i + 1) % total);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [autoplay, total]);

  /** Toute action du visiteur coupe le défilement pour de bon. */
  const take = useCallback(() => setTaken(true), []);

  const go = useCallback(
    (index: number) => {
      take();
      // Bornage plutôt que bouclage en navigation manuelle : arriver à la fin
      // et repartir au début désoriente sur un parcours numéroté.
      setActive(Math.min(total - 1, Math.max(0, index)));
    },
    [total, take],
  );

  /** Flèches gauche/droite dans la barre de navigation. */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      take();
      const next = active + (event.key === "ArrowRight" ? 1 : -1);
      const clamped = Math.min(total - 1, Math.max(0, next));
      setActive(clamped);
      // Le focus suit l'étape active, sinon la navigation clavier se perd.
      const buttons = tablistRef.current?.querySelectorAll("button[data-dot]");
      (buttons?.[clamped] as HTMLButtonElement | undefined)?.focus();
    },
    [active, total, take],
  );

  const progress = labels.progress
    .replace("{i}", String(active + 1))
    .replace("{n}", String(total));

  return (
    <div
      ref={sceneRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Le focus clavier coupe définitivement : quelqu'un qui navigue au
      // clavier lit à son rythme.
      onFocusCapture={take}
      className="mt-12 md:mt-14"
    >
      {/* Barre de progression */}
      <div className="flex items-center gap-4">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-slate"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out"
            style={{ width: `${((active + 1) / total) * 100}%` }}
          />
        </div>
        <p className="numeric shrink-0 text-[0.8rem] text-smoke">{progress}</p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
        {/* Pictogramme de l'étape */}
        <div
          aria-hidden="true"
          className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-slate bg-carbon text-ember md:size-24"
        >
          <div className="size-11 md:size-12">
            <StepIcon index={active} />
          </div>
        </div>

        {/* Les six étapes. Toutes rendues ; une seule visible.
            aria-live annonce le changement sans déplacer le focus. */}
        <div aria-live="polite">
          {steps.map((step, i) => (
            <div key={step.n} hidden={i !== active} className="step-panel">
              <span className="numeric text-[0.8rem] font-semibold text-ember">
                {step.n}
              </span>
              <h3 className="display mt-2 text-[1.4rem] text-chalk md:text-[1.7rem]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xl text-[1.02rem] leading-[1.7] text-smoke">
                {step.body}
              </p>
              {step.note && (
                <p className="mt-2.5 text-[0.85rem] text-smoke/80">
                  {step.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div
        ref={tablistRef}
        onKeyDown={onKeyDown}
        className="mt-9 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <button
              key={step.n}
              type="button"
              data-dot
              onClick={() => go(i)}
              aria-current={i === active ? "step" : undefined}
              aria-label={`${step.n} — ${step.title}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-8 bg-ember"
                  : "w-2.5 bg-slate hover:bg-smoke"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <NavButton
            label={labels.prev}
            onClick={() => go(active - 1)}
            disabled={active === 0}
            direction="prev"
          />
          <NavButton
            label={labels.next}
            onClick={() => go(active + 1)}
            disabled={active === total - 1}
            direction="next"
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  direction,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  direction: "prev" | "next";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-lg border border-slate bg-ash text-chalk transition-all hover:border-smoke disabled:opacity-35 disabled:hover:border-slate"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        style={
          direction === "prev" ? { transform: "rotate(180deg)" } : undefined
        }
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
