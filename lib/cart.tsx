"use client";

import { getGame, type EditionTier } from "@/content/games";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useHydrated, useParsed, useStoredRaw, writeStore } from "./localStore";

/**
 * Panier — état local, persisté dans localStorage.
 *
 * Aucun backend : c'est une maquette de parcours d'achat. Le tunnel s'arrête
 * au récapitulatif, sans jamais demander de moyen de paiement.
 *
 * Deux règles importantes :
 *
 * 1. On ne stocke QUE des identifiants (slug + niveau d'édition + quantité).
 *    Les prix sont recalculés depuis content/games.ts à chaque affichage —
 *    un localStorage trafiqué ne peut donc pas inventer un prix.
 *
 * 2. Toute lecture est défensive. En navigation privée ou stockage bloqué,
 *    localStorage lève une exception ; un contenu corrompu ne doit pas
 *    produire un écran blanc.
 */

const STORAGE_KEY = "dmg.cart.v1";
const MAX_QTY = 20;

export interface CartLine {
  slug: string;
  tier: EditionTier;
  qty: number;
}

interface CartValue {
  lines: CartLine[];
  /** Nombre total d'articles (somme des quantités). */
  count: number;
  /** Total en euros, recalculé depuis le catalogue. */
  total: number;
  /** `false` tant que le localStorage n'a pas été lu (évite un flash). */
  ready: boolean;
  add: (slug: string, tier: EditionTier) => void;
  remove: (slug: string, tier: EditionTier) => void;
  setQty: (slug: string, tier: EditionTier, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

/** Ne garde que les lignes qui correspondent à un jeu et une édition réels. */
function parseLines(raw: string | null): CartLine[] {
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    // JSON corrompu : on repart d'un panier vide plutôt que de planter.
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const lines: CartLine[] = [];

  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const { slug, tier, qty } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || typeof tier !== "string") continue;

    const game = getGame(slug);
    if (!game) continue;
    if (!game.editions.some((e) => e.tier === tier)) continue;

    const key = `${slug}:${tier}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const quantity =
      typeof qty === "number" && Number.isFinite(qty)
        ? Math.min(MAX_QTY, Math.max(1, Math.floor(qty)))
        : 1;

    lines.push({ slug, tier: tier as EditionTier, qty: quantity });
  }
  return lines;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore plutôt qu'un useState + useEffect : pas de setState
  // dans un effet, et les onglets ouverts restent synchronisés.
  const raw = useStoredRaw(STORAGE_KEY);
  const ready = useHydrated();
  const lines = useParsed(raw, parseLines);

  const add = useCallback(
    (slug: string, tier: EditionTier) => {
      const current = parseLines(safeRead());
      const existing = current.find((l) => l.slug === slug && l.tier === tier);
      const next = existing
        ? current.map((l) =>
            l.slug === slug && l.tier === tier
              ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) }
              : l,
          )
        : [...current, { slug, tier, qty: 1 }];
      writeStore(STORAGE_KEY, next);
    },
    [],
  );

  const remove = useCallback((slug: string, tier: EditionTier) => {
    const next = parseLines(safeRead()).filter(
      (l) => !(l.slug === slug && l.tier === tier),
    );
    writeStore(STORAGE_KEY, next);
  }, []);

  const setQty = useCallback((slug: string, tier: EditionTier, qty: number) => {
    const clamped = Math.min(MAX_QTY, Math.max(1, Math.floor(qty) || 1));
    const next = parseLines(safeRead()).map((l) =>
      l.slug === slug && l.tier === tier ? { ...l, qty: clamped } : l,
    );
    writeStore(STORAGE_KEY, next);
  }, []);

  const clear = useCallback(() => writeStore(STORAGE_KEY, []), []);

  // Total recalculé depuis le catalogue — jamais depuis le stockage.
  const { count, total } = useMemo(() => {
    let c = 0;
    let t = 0;
    for (const line of lines) {
      const game = getGame(line.slug);
      const edition = game?.editions.find((e) => e.tier === line.tier);
      if (!edition) continue;
      c += line.qty;
      t += edition.priceEUR * line.qty;
    }
    return { count: c, total: t };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, count, total, ready, add, remove, setQty, clear }),
    [lines, count, total, ready, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function safeRead(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useCart(): CartValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un <CartProvider>.");
  }
  return context;
}
