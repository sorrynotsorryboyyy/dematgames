/**
 * Pictogrammes du parcours, un par étape.
 *
 * SVG inline plutôt qu'une police d'icônes ou des fichiers : six dessins
 * pèsent moins qu'une requête, restent nets à tout zoom et suivent la
 * couleur du texte via `currentColor`.
 *
 * Purement décoratifs : le sens est porté par le titre de l'étape, d'où
 * l'aria-hidden systématique.
 */

const COMMON = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** 01 — Contact : une bulle de conversation. */
function Contact() {
  return (
    <svg {...COMMON}>
      <path d="M8 12h32v20H22l-8 7v-7H8Z" />
      <path d="M16 20h16M16 26h10" />
    </svg>
  );
}

/** 02 — Définition du besoin : un plan avec ses cotes. */
function Scope() {
  return (
    <svg {...COMMON}>
      <rect x="8" y="10" width="32" height="26" rx="2" />
      <path d="M8 18h32" />
      <path d="M14 26h8M14 31h14" />
      <path d="M30 24v9M27 24h6M27 33h6" />
    </svg>
  );
}

/** 03 — Préparation : boîtier ouvert et jaquette. */
function Prepare() {
  return (
    <svg {...COMMON}>
      <path d="M24 12v26" />
      <path d="M24 12 10 15v22l14-3" />
      <path d="M24 12l14 3v22l-14-3" />
      <circle cx="31" cy="26" r="4" />
    </svg>
  );
}

/** 04 — Pressage : le disque et la presse. */
function Press() {
  return (
    <svg {...COMMON}>
      <circle cx="24" cy="28" r="10" />
      <circle cx="24" cy="28" r="3" />
      <path d="M12 12h24" />
      <path d="M24 12v6" />
    </svg>
  );
}

/** 05 — Expédition : le colis en mouvement. */
function Ship() {
  return (
    <svg {...COMMON}>
      <path d="M6 32V18h20v14Z" />
      <path d="M26 22h8l6 6v4h-14Z" />
      <circle cx="14" cy="34" r="3" />
      <circle cx="32" cy="34" r="3" />
      <path d="M2 22h4M2 27h6" />
    </svg>
  );
}

/** 06 — Le joueur : une main tenant la boîte. */
function Player() {
  return (
    <svg {...COMMON}>
      <rect x="16" y="10" width="16" height="20" rx="1.5" />
      <path d="M20 10v20" />
      <path d="M10 40c2-5 6-7 14-7s12 2 14 7" />
    </svg>
  );
}

const ICONS = [Contact, Scope, Prepare, Press, Ship, Player] as const;

/** Rend le pictogramme correspondant à l'index d'étape (0-5). */
export function StepIcon({ index }: { index: number }) {
  const Icon = ICONS[index % ICONS.length];
  return <Icon />;
}
