"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Lecture réactive d'une clé localStorage, via useSyncExternalStore.
 *
 * C'est le primitif prévu par React pour lire un état externe : pas de
 * setState dans un effet, pas de rendu en cascade, et un snapshot serveur
 * distinct qui garantit que le HTML prérendu correspond au premier rendu
 * client (le stockage n'existe pas côté serveur).
 *
 * Bonus : l'abonnement à l'événement `storage` synchronise automatiquement
 * les onglets ouverts sur le site.
 */

/** Notifie les abonnés d'une écriture faite dans CET onglet. */
const listeners = new Map<string, Set<() => void>>();

export function notifyStore(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function writeStore(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée, quota) : l'état mémoire
    // reste valable pour la session en cours.
  }
  notifyStore(key);
}

export function removeStore(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Rien à faire.
  }
  notifyStore(key);
}

/**
 * Retourne la valeur brute (string) stockée sous `key`, ou null.
 * Le parsing et la validation sont à la charge de l'appelant : chaque
 * consommateur sait quelle forme il attend.
 */
export function useStoredRaw(key: string): string | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onChange);

      // `storage` ne se déclenche que dans les AUTRES onglets : il complète
      // la notification locale ci-dessus.
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        set?.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  // Côté serveur, le stockage n'existe pas : on renvoie toujours null, ce qui
  // fait correspondre le HTML prérendu au premier rendu client.
  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * `true` une fois que le composant s'exécute côté client.
 * Sert à distinguer « stockage vide » de « stockage pas encore lu », sans
 * setState dans un effet.
 */
export function useHydrated(): boolean {
  const subscribe = useCallback(() => () => {}, []);
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Mémoïse le parsing : évite de re-valider la chaîne à chaque rendu, et
 * garantit une identité de référence stable tant que le brut ne change pas
 * (sans quoi les useMemo en aval se recalculeraient sans cesse).
 *
 * `parse` doit être une fonction pure définie au niveau module — elle est
 * volontairement absente des dépendances, seul `raw` pilote le recalcul.
 */
export function useParsed<T>(raw: string | null, parse: (raw: string | null) => T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => parse(raw), [raw]);
}
