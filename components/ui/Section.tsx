import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Fond : `void` par défaut, `carbon` pour alterner le rythme vertical. */
  tone?: "void" | "carbon";
  /** Grain papier — côté « physical » du contraste. */
  grain?: boolean;
  /** Titre accessible associé à la section (id de son <h2>). */
  labelledBy?: string;
}

/**
 * Conteneur de section : rythme vertical, largeur max et fond cohérents
 * sur toute la page. Chaque section porte son propre landmark.
 */
export function Section({
  id,
  children,
  className = "",
  tone = "void",
  grain = false,
  labelledBy,
}: SectionProps) {
  const bg = tone === "carbon" ? "bg-carbon" : "bg-void";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative isolate overflow-hidden ${bg} ${grain ? "grain" : ""} ${className}`}
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 md:py-24 lg:px-12 lg:py-28">
        {children}
      </div>
    </section>
  );
}

/** Bandeau court entre deux sections (phrases de transition). */
export function Band({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden border-y border-slate bg-carbon ${className}`}
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-12">
        {children}
      </div>
    </div>
  );
}

/** Petit label au-dessus d'un titre. */
export function Eyebrow({
  children,
  withDot = false,
}: {
  children: ReactNode;
  withDot?: boolean;
}) {
  return (
    <p className="eyebrow flex items-center gap-2.5">
      {withDot && (
        <span
          aria-hidden="true"
          className="animate-pulse-dot inline-block size-1.5 rounded-full bg-ember"
        />
      )}
      {children}
    </p>
  );
}
