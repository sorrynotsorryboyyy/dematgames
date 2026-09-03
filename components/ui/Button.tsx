import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost" | "solid";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight " +
  "rounded-lg transition-all duration-200 ease-out select-none " +
  "disabled:opacity-45 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  // Blanc sur ember : 5.18:1 (AA). En thème sombre il fallait l'inverse
  // (texte sombre sur ember) — l'accent a été assombri pour le thème clair.
  primary:
    "bg-ember text-white hover:bg-[#a8380a] hover:-translate-y-0.5 " +
    "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
  ghost:
    "border border-slate bg-ash text-chalk hover:border-chalk/30 hover:-translate-y-0.5 " +
    "hover:shadow-[var(--shadow-soft)]",
  solid:
    "bg-chalk text-white hover:bg-[#000] hover:-translate-y-0.5 " +
    "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.85rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/** Bouton-lien (ancre interne ou URL). */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Bouton d'action (soumission de formulaire, ajout au panier…). */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
