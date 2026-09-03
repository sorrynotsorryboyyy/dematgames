"use client";

import type { Choice } from "@/content/types";
import { useId } from "react";

/**
 * Groupe de choix exclusifs, rendu en boutons.
 *
 * Implémenté avec de VRAIS `<input type="radio">` masqués visuellement et
 * des `<label>` stylés, plutôt qu'un tableau de `<button aria-pressed>`.
 *
 * La différence compte : un groupe de radios natif donne gratuitement la
 * navigation aux flèches, l'annonce « 2 sur 5 » par les lecteurs d'écran, et
 * la sélection au clavier. Reproduire tout cela à la main avec des boutons
 * demande une gestion de focus complète, pour un résultat moins fiable.
 *
 * Le champ est OPTIONNEL : aucune option n'est présélectionnée, et le
 * formulaire accepte une réponse vide.
 */
export function RadioGroup({
  choice,
  name,
  value,
  onChange,
  hideLabel = false,
}: {
  choice: Choice;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /**
   * Masque la légende VISUELLEMENT, sans la retirer du DOM.
   *
   * Sert quand la question est déjà affichée en titre au-dessus : la répéter
   * ferait doublon à l'écran. Mais un <fieldset> sans <legend> perd son
   * intitulé pour les lecteurs d'écran — d'où `sr-only` plutôt qu'un
   * retrait pur et simple.
   */
  hideLabel?: boolean;
}) {
  const uid = useId();

  return (
    <fieldset>
      <legend
        className={
          hideLabel ? "sr-only" : "text-[0.9rem] font-medium text-chalk"
        }
      >
        {choice.label}
      </legend>

      <div className={`flex flex-wrap gap-2 ${hideLabel ? "" : "mt-3"}`}>
        {choice.options.map((option) => {
          const id = `${uid}-${option}`;
          const selected = value === option;
          return (
            <div key={option}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                // `sr-only` plutôt que `hidden` ou `display:none` : l'input
                // reste focusable et lisible par les lecteurs d'écran.
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`inline-flex cursor-pointer items-center rounded-lg border px-3.5 py-2 text-[0.9rem] transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember ${
                  selected
                    ? "border-ember bg-[var(--color-ember-soft)] font-medium text-chalk"
                    : "border-slate bg-ash text-smoke hover:border-smoke hover:text-chalk"
                }`}
              >
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
