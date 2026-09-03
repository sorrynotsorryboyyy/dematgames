"use client";

import { useReveal } from "@/lib/useReveal";

/**
 * Le trajet : écran du développeur → usine → route → maison du joueur.
 *
 * Remplace l'ancien Pipeline (.EXE → 💿 → 📦 → PLAYER), qui faisait tourner
 * un setInterval en permanence. Ici tout est en CSS : le camion et les
 * stations sont animés par des @keyframes, donc composités par le GPU,
 * sans une ligne de JS de séquençage.
 *
 * `useReveal` sert uniquement à DÉMARRER l'animation quand la scène entre
 * dans le viewport — rien ne tourne tant qu'elle est hors écran.
 *
 * IMPLANTATION (viewBox 0→1000) : l'écran occupe 40-150, l'usine 290-430,
 * la maison 830-960. Le camion (112 de large) circule entre les deux, et
 * s'arrête AVANT la maison — il ne doit jamais la traverser.
 *
 * Le SVG est décoratif : l'information est portée par les quatre libellés
 * texte affichés dessous, seuls lus par un lecteur d'écran.
 */
export function DeliveryScene({
  labels,
  caption,
}: {
  labels: readonly [string, string, string, string];
  caption: string;
}) {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <figure ref={ref} className="mt-14 md:mt-16" data-scene={revealed}>
      <div className="overflow-hidden rounded-2xl border border-slate bg-carbon px-3 py-4 sm:px-6 sm:py-5">
        <svg
          viewBox="0 0 1000 178"
          preserveAspectRatio="xMidYMid meet"
          role="presentation"
          aria-hidden="true"
          className="w-full"
        >
          {/* ---------- Sol et route ---------- */}
          <line
            x1="0" y1="150" x2="1000" y2="150"
            stroke="var(--color-slate)" strokeWidth="2.5"
          />
          <line
            x1="10" y1="150" x2="990" y2="150"
            stroke="var(--color-smoke)" strokeWidth="2"
            strokeDasharray="16 20" opacity="0.3"
          />

          {/* ---------- 01 · L'écran du développeur ---------- */}
          <g className="station" data-station="1">
            <rect x="40" y="58" width="106" height="66" rx="6"
              fill="var(--color-ash)" stroke="var(--color-slate)" strokeWidth="2.5" />
            <rect x="54" y="72" width="56" height="6" rx="3" fill="var(--color-smoke)" opacity="0.5" />
            <rect x="54" y="86" width="40" height="6" rx="3" fill="var(--color-smoke)" opacity="0.35" />
            <rect x="54" y="100" width="64" height="6" rx="3" fill="var(--color-smoke)" opacity="0.35" />
            <rect x="82" y="124" width="22" height="12" fill="var(--color-slate)" />
            <rect x="62" y="136" width="62" height="6" rx="3" fill="var(--color-slate)" />
            {/* Le fichier qui s'échappe vers l'usine. */}
            <circle className="spark" cx="158" cy="90" r="5" fill="var(--color-ember)" />
          </g>

          {/* ---------- 02 · L'usine ---------- */}
          <g className="station" data-station="2">
            {/* Cheminée, derrière le corps du bâtiment. */}
            <rect x="292" y="52" width="17" height="98" fill="var(--color-ash)"
              stroke="var(--color-slate)" strokeWidth="2.5" />
            {/* Fumée : trois bouffées décalées. */}
            <circle className="smoke smoke-1" cx="300" cy="44" r="8" fill="var(--color-smoke)" />
            <circle className="smoke smoke-2" cx="300" cy="44" r="10" fill="var(--color-smoke)" />
            <circle className="smoke smoke-3" cx="300" cy="44" r="7" fill="var(--color-smoke)" />
            {/* Toit en dents de scie — la silhouette d'atelier. */}
            <path
              d="M318 150 V92 l26 -22 v22 l26 -22 v22 l26 -22 v22 l26 -22 v80 Z"
              fill="var(--color-ash)" stroke="var(--color-slate)" strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="334" y="116" width="18" height="20" fill="var(--color-smoke)" opacity="0.25" />
            <rect x="366" y="116" width="18" height="20" fill="var(--color-smoke)" opacity="0.25" />
            <rect x="398" y="116" width="18" height="20" fill="var(--color-smoke)" opacity="0.25" />
          </g>

          {/* ---------- 04 · La maison du joueur ---------- */}
          <g className="station" data-station="4">
            <path
              d="M838 150 V92 l56 -36 l56 36 v58 Z"
              fill="var(--color-ash)" stroke="var(--color-slate)" strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="876" y="110" width="30" height="40"
              fill="var(--color-smoke)" opacity="0.22" />
            <rect x="916" y="104" width="20" height="18"
              fill="var(--color-smoke)" opacity="0.22" />
            {/* Le colis livré, devant la porte. */}
            <g className="parcel">
              <rect x="912" y="128" width="22" height="22" rx="2"
                fill="var(--color-ember)" />
              <line x1="923" y1="128" x2="923" y2="150"
                stroke="var(--color-ash)" strokeWidth="2.5" />
            </g>
          </g>

          {/* ---------- Le camion ---------- */}
          <g className="truck">
            <rect x="0" y="94" width="76" height="44" rx="4"
              fill="var(--color-ash)" stroke="var(--color-chalk)" strokeWidth="2.5" />
            <rect x="9" y="104" width="58" height="11" rx="2" fill="var(--color-ember)" />
            <path
              d="M76 138 v-32 h23 l17 20 v12 Z"
              fill="var(--color-ash)" stroke="var(--color-chalk)" strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="82" y="110" width="19" height="13" rx="2"
              fill="var(--color-smoke)" opacity="0.3" />
            <g className="wheel">
              <circle cx="26" cy="142" r="11" fill="var(--color-chalk)" />
              <circle cx="26" cy="142" r="4" fill="var(--color-ash)" />
              <line x1="26" y1="133" x2="26" y2="151" stroke="var(--color-ash)" strokeWidth="1.5" />
            </g>
            <g className="wheel wheel-rear">
              <circle cx="97" cy="142" r="11" fill="var(--color-chalk)" />
              <circle cx="97" cy="142" r="4" fill="var(--color-ash)" />
              <line x1="97" y1="133" x2="97" y2="151" stroke="var(--color-ash)" strokeWidth="1.5" />
            </g>
          </g>
        </svg>
      </div>

      {/* Les libellés : la seule information lue par un lecteur d'écran. */}
      <ol className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {labels.map((label, i) => (
          <li key={label} className="flex items-baseline gap-2 text-[0.88rem] text-smoke">
            <span className="numeric text-[0.75rem] font-semibold text-ember">
              {String(i + 1).padStart(2, "0")}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <figcaption className="mt-5 text-center text-[0.9rem] text-smoke">
        {caption}
      </figcaption>
    </figure>
  );
}
