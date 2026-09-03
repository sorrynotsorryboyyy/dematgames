"use client";

import { useReducedMotion } from "@/lib/useReveal";
import { useTilt } from "@/lib/useTilt";

/**
 * Boîtier de jeu PC en CSS 3D.
 *
 * Aucune image bitmap : les 5 faces et la jaquette sont générées en CSS.
 * Conséquence — net à tout zoom, poids nul, LCP très bas, et le contenu
 * de la jaquette reste modifiable par props.
 *
 * Le boîtier reste sombre alors que le site est passé en thème clair : un
 * vrai boîtier DVD EST un objet de plastique sombre. Le garder ainsi
 * renforce le contraste numérique/physique et l'ancre comme un objet posé
 * sur la page, pas comme un élément d'interface.
 *
 * Chaque face accepte une prop `image` optionnelle : le jour où de vrais
 * rendus existent, ils se substituent au CSS sans refonte du composant.
 * Voir public/mockups/.
 */

const DEPTH_MM = 14; // épaisseur réelle d'un boîtier DVD
const WIDTH_MM = 135;
/** Épaisseur exprimée en fraction de la largeur : la géométrie suit --box-w. */
const DEPTH_RATIO = DEPTH_MM / WIDTH_MM;

export interface GameBoxProps {
  title: string;
  studio: string;
  /** Largeur CSS du boîtier ; toute la géométrie en découle. */
  width?: string;
  /** Pose de repos. `hero` = 3/4 avec suivi de souris ; `shelf` = quasi de face. */
  pose?: "hero" | "shelf";
  /** Teinte de la jaquette (dégradé), pour différencier les jeux de l'étagère. */
  hue?: number;
  /** Suivi du pointeur — désactivé sur l'étagère et sur pointeur grossier. */
  interactive?: boolean;
  /** Flottement vertical continu. */
  float?: boolean;
  /** Disque visible dépassant du boîtier. */
  showDisc?: boolean;
  className?: string;
  /** Remplacement futur du visuel CSS par un vrai rendu. */
  coverImage?: string;
}

export function GameBox({
  title,
  studio,
  width = "clamp(200px, 25vw, 310px)",
  pose = "hero",
  hue = 8,
  interactive = true,
  float = true,
  showDisc = true,
  className = "",
  coverImage,
}: GameBoxProps) {
  const reduced = useReducedMotion();

  // Pose de repos : le boîtier n'est jamais parfaitement de face, c'est ce qui
  // donne le volume et la lecture « objet » plutôt que « image ».
  const restY = pose === "hero" ? -26 : -13;
  const restX = pose === "hero" ? 7 : 4;

  // Même moteur que les cartes (lib/useTilt), mais portée fenêtre et grande
  // amplitude : le boîtier est l'objet central, il réagit au pointeur partout.
  const boxRef = useTilt<HTMLDivElement>({
    scope: "window",
    restX,
    restY,
    maxY: 23,
    maxX: 13,
    disabled: !interactive,
  });

  const depth = `calc(var(--box-w) * ${DEPTH_RATIO})`;
  const halfDepth = `calc(var(--box-w) * ${DEPTH_RATIO / 2})`;

  return (
    <div
      className={`scene ${float && !reduced ? "animate-float-box" : ""} ${className}`}
      style={{ ["--box-w" as string]: width }}
    >
      <div
        ref={boxRef}
        className="box3d"
        style={{ transform: `rotateX(${restX}deg) rotateY(${restY}deg)` }}
      >
        {/* ---------- Face avant : la jaquette ---------- */}
        <div
          className="box-face rounded-r-[3px] rounded-l-[1px] shadow-[var(--shadow-box)]"
          style={{ transform: `translateZ(${halfDepth})` }}
        >
          <Cover title={title} studio={studio} hue={hue} image={coverImage} />
        </div>

        {/* ---------- Face arrière ---------- */}
        <div
          className="box-face rounded-[2px] bg-[#0d0d10]"
          style={{ transform: `translateZ(-${halfDepth}) rotateY(180deg)` }}
        >
          <BackCover title={title} studio={studio} />
        </div>

        {/* ---------- Tranche gauche : le dos titré, ce qu'on voit sur une étagère ---------- */}
        <div
          className="box-face"
          style={{
            width: depth,
            left: 0,
            transform: `rotateY(-90deg) translateZ(${halfDepth})`,
            transformOrigin: "left center",
            background:
              "linear-gradient(to right, #050506 0%, #17171c 45%, #0b0b0e 100%)",
          }}
        >
          <Spine title={title} />
        </div>

        {/* ---------- Tranche droite : ouverture du boîtier ---------- */}
        <div
          className="box-face"
          style={{
            width: depth,
            left: "100%",
            transform: `rotateY(90deg) translateZ(${halfDepth})`,
            transformOrigin: "left center",
            background:
              "linear-gradient(to right, #0a0a0d 0%, #1d1d23 50%, #08080a 100%)",
          }}
        >
          {/* Rainure d'ouverture du plastique. */}
          <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-black/60" />
        </div>

        {/* ---------- Tranches haute et basse ---------- */}
        <div
          className="box-face"
          style={{
            height: depth,
            top: 0,
            transform: `rotateX(90deg) translateZ(${halfDepth})`,
            transformOrigin: "center top",
            background: "linear-gradient(to bottom, #26262d, #0a0a0d)",
          }}
        />
        <div
          className="box-face"
          style={{
            height: depth,
            top: "100%",
            transform: `rotateX(-90deg) translateZ(${halfDepth})`,
            transformOrigin: "center top",
            background: "linear-gradient(to top, #17171c, #060608)",
          }}
        />

        {/* ---------- Le disque, glissé derrière le boîtier ---------- */}
        {showDisc && <Disc />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Cover({
  title,
  studio,
  hue,
  image,
}: {
  title: string;
  studio: string;
  hue: number;
  image?: string;
}) {
  return (
    <div
      className="relative size-full overflow-hidden"
      style={
        image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover" }
          : {
              background: `
                radial-gradient(120% 80% at 50% 8%, hsl(${hue} 78% 46% / 0.55) 0%, transparent 58%),
                radial-gradient(90% 60% at 20% 100%, hsl(${hue + 24} 60% 32% / 0.42) 0%, transparent 62%),
                linear-gradient(168deg, #16161b 0%, #0a0a0d 55%, #050507 100%)
              `,
            }
      }
    >
      {!image && (
        <>
          {/* Trame fine — rappel « impression offset ». */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px)",
            }}
          />

          {/* Bandeau éditeur en haut. */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[7%] py-[4.5%]">
            <span className="font-mono text-[0.42rem] tracking-[0.3em] text-white/75 uppercase">
              PC · DVD-ROM
            </span>
            <span className="size-[0.3rem] rounded-full bg-[#ff5a2b]" />
          </div>

          {/* Titre — la masse typographique porte toute la jaquette. */}
          <div className="absolute inset-x-0 bottom-[16%] px-[7%]">
            <h3
              className="display font-extrabold text-white uppercase"
              style={{
                fontSize: "calc(var(--box-w) * 0.155)",
                lineHeight: 0.85,
              }}
            >
              {title}
            </h3>
            <div className="mt-[4%] h-px w-[38%] bg-[#ff5a2b]" />
            <p
              className="mt-[4%] font-mono tracking-[0.24em] text-white/60 uppercase"
              style={{ fontSize: "calc(var(--box-w) * 0.032)" }}
            >
              {studio}
            </p>
          </div>

          {/* Pied : classification + code-barres, les détails qui font « vrai objet ». */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-[7%] py-[4.5%]">
            <span
              className="border border-white/35 px-[0.35em] py-[0.1em] font-mono text-white/60"
              style={{ fontSize: "calc(var(--box-w) * 0.03)" }}
            >
              12+
            </span>
            <Barcode />
          </div>
        </>
      )}

      {/* Reflet spéculaire qui balaie la jaquette. */}
      <div className="box-sheen" aria-hidden="true" />

      {/* Ombre interne côté charnière : donne l'épaisseur du plastique. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[9%]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.55), transparent)",
        }}
      />
    </div>
  );
}

function BackCover({ title, studio }: { title: string; studio: string }) {
  return (
    <div className="relative size-full bg-[#0c0c10] px-[8%] py-[7%]">
      <p
        className="font-mono tracking-[0.2em] text-white/50 uppercase"
        style={{ fontSize: "calc(var(--box-w) * 0.03)" }}
      >
        {studio}
      </p>
      {/* Faux bloc de texte : trois colonnes de lignes, comme un dos de boîtier. */}
      <div className="mt-[8%] space-y-[3.5%]">
        {[92, 100, 84, 96, 72].map((w, i) => (
          <div
            key={i}
            className="h-px bg-white/12"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {/* Trois vignettes de screenshots. */}
      <div className="mt-[10%] grid grid-cols-3 gap-[3%]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-[1px] bg-gradient-to-br from-white/10 to-transparent"
          />
        ))}
      </div>
      <div className="absolute inset-x-[8%] bottom-[7%] flex items-end justify-between">
        <span
          className="font-mono text-white/40"
          style={{ fontSize: "calc(var(--box-w) * 0.026)" }}
        >
          {title.toUpperCase()}
        </span>
        <Barcode />
      </div>
    </div>
  );
}

function Spine({ title }: { title: string }) {
  return (
    <div className="flex size-full items-center justify-center overflow-hidden">
      <span
        className="display whitespace-nowrap font-extrabold text-white/90 uppercase"
        style={{
          writingMode: "vertical-rl",
          fontSize: "calc(var(--box-w) * 0.052)",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function Barcode() {
  // Largeurs fixes (pas de Math.random) : le rendu serveur et client doivent
  // correspondre, sinon React signale une erreur d'hydratation.
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1];
  return (
    <div
      aria-hidden="true"
      className="flex items-end gap-[1px] bg-white/90 px-[0.25em] py-[0.2em]"
      style={{ height: "calc(var(--box-w) * 0.05)" }}
    >
      {bars.map((w, i) => (
        <span
          key={i}
          className="h-full bg-black"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  );
}

/** Disque pressé, dépassant légèrement derrière le boîtier. */
function Disc() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        width: "calc(var(--box-w) * 0.78)",
        height: "calc(var(--box-w) * 0.78)",
        right: "calc(var(--box-w) * -0.3)",
        top: "50%",
        transform: `translateY(-50%) translateZ(calc(var(--box-w) * -0.02))`,
      }}
    >
      <div
        className="size-full rounded-full shadow-[0_18px_40px_-14px_rgba(22,22,26,0.45)]"
        style={{
          background: `
            conic-gradient(from 210deg,
              #2a2a32 0deg, #6f6f7d 32deg, #34343d 64deg,
              #8a8a99 96deg, #3a3a44 128deg, #5e5e6b 168deg,
              #2b2b33 210deg, #7d7d8c 250deg, #33333c 290deg,
              #6a6a78 330deg, #2a2a32 360deg)
          `,
        }}
      >
        {/* Anneau interne + trou central. */}
        <div className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141418]/85" />
        <div className="absolute left-1/2 top-1/2 size-[13%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0d]" />
      </div>
    </div>
  );
}
