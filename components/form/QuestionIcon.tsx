/**
 * Pictogrammes des questions du formulaire.
 *
 * Le tracé se dessine à l'apparition (stroke-dasharray animé) : c'est ce qui
 * donne le sentiment d'un écran qui « arrive » plutôt que d'apparaître d'un
 * coup. L'animation est portée par .draw-in dans globals.css, neutralisée en
 * prefers-reduced-motion.
 *
 * Purement décoratifs : le sens vient du libellé de la question.
 */

const COMMON = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "draw-in size-full",
};

/** Stade du jeu : un jalon sur une ligne de temps. */
function Stage() {
  return (
    <svg {...COMMON}>
      <path d="M6 34h36" />
      <path d="M14 34V22M24 34V14M34 34V26" />
      <circle cx="24" cy="10" r="3.5" />
    </svg>
  );
}

/** Volume : une pile de boîtiers. */
function Volume() {
  return (
    <svg {...COMMON}>
      <rect x="12" y="30" width="24" height="10" rx="1.5" />
      <rect x="12" y="20" width="24" height="10" rx="1.5" />
      <rect x="12" y="10" width="24" height="10" rx="1.5" />
      <path d="M17 30v10M17 20v10M17 10v10" />
    </svg>
  );
}

/** Édition : un boîtier avec son disque. */
function Edition() {
  return (
    <svg {...COMMON}>
      <rect x="10" y="8" width="28" height="32" rx="2" />
      <path d="M16 8v32" />
      <circle cx="28" cy="24" r="7" />
      <circle cx="28" cy="24" r="1.5" />
    </svg>
  );
}

/** Équipe : des silhouettes. */
function Team() {
  return (
    <svg {...COMMON}>
      <circle cx="18" cy="17" r="5" />
      <path d="M8 36c1.5-5 5-7.5 10-7.5s8.5 2.5 10 7.5" />
      <circle cx="33" cy="19" r="4" />
      <path d="M30 29c4 0 7 2 8.5 6" />
    </svg>
  );
}

const ICONS = [Stage, Volume, Edition, Team] as const;

export function QuestionIcon({ index }: { index: number }) {
  const Icon = ICONS[index % ICONS.length];
  return <Icon />;
}
