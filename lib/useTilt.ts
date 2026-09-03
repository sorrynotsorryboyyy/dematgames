"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, useReducedMotion } from "./useReveal";

/**
 * Tilt 3D suivant le pointeur, amorti.
 *
 * Extrait de GameBox, qui portait cette logique en local. Une seule
 * implémentation désormais : le boîtier du hero et les cartes partagent
 * exactement le même comportement.
 *
 * Deux portées :
 * - `window` : mesure depuis le centre de la fenêtre, boucle permanente.
 *   Pour un objet unique et central (le boîtier du hero).
 * - `element` : mesure depuis le survol de l'élément, la boucle ne tourne
 *   qu'entre pointerenter et pointerleave. Indispensable pour les cartes :
 *   avec 20+ instances à l'écran, une boucle permanente par carte serait
 *   inacceptable.
 *
 * L'animation écrit directement dans `style.transform` — jamais via un state
 * React, qui provoquerait un rendu par frame.
 */

export interface TiltOptions {
  /** Amplitude horizontale en degrés (rotation autour de Y). */
  maxY?: number;
  /** Amplitude verticale en degrés (rotation autour de X). */
  maxX?: number;
  /** Pose de repos, en degrés. */
  restX?: number;
  restY?: number;
  /** `element` = réagit à son propre survol ; `window` = au pointeur global. */
  scope?: "element" | "window";
  /** Facteur d'interpolation par frame. Plus bas = plus d'inertie. */
  ease?: number;
  /** Translation Z appliquée pendant le survol, en px (effet de « soulèvement »). */
  lift?: number;
  /** Désactive le tilt sans changer l'ordre des hooks. */
  disabled?: boolean;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>({
  maxY = 8,
  maxX = 6,
  restX = 0,
  restY = 0,
  scope = "element",
  ease = 0.075,
  lift = 0,
  disabled = false,
}: TiltOptions = {}) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();

  // Pas de curseur (mobile/tactile) ou animations réduites : aucun abonnement.
  const live = !disabled && finePointer && !reduced;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const rest = `rotateX(${restX}deg) rotateY(${restY}deg)`;

    if (!live) {
      node.style.transform = rest;
      return;
    }

    let currentX = restX;
    let currentY = restY;
    let currentZ = 0;
    let targetX = restX;
    let targetY = restY;
    let targetZ = 0;
    let frame = 0;
    let running = false;

    const apply = () => {
      const z = lift ? ` translateZ(${currentZ.toFixed(2)}px)` : "";
      node.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)${z}`;
    };

    const tick = () => {
      // Interpolation exponentielle : approche asymptotique de la cible,
      // sans oscillation.
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentZ += (targetZ - currentZ) * ease;
      apply();

      // En portée `element`, on arrête la boucle une fois la pose de repos
      // atteinte : rien ne tourne en fond quand la souris est ailleurs.
      const settled =
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01 &&
        Math.abs(targetZ - currentZ) < 0.01;

      if (scope === "element" && settled && targetX === restX && targetY === restY) {
        running = false;
        node.dataset.tilting = "false";
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      node.dataset.tilting = "true";
      frame = requestAnimationFrame(tick);
    };

    const fromPoint = (clientX: number, clientY: number) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Portée élément : normalisé sur la taille de l'élément, donc le tilt
      // atteint son maximum aux bords. Portée fenêtre : normalisé sur le
      // viewport, la réaction reste douce même curseur loin de l'objet.
      const dx =
        scope === "element"
          ? (clientX - cx) / (rect.width / 2)
          : (clientX - cx) / window.innerWidth;
      const dy =
        scope === "element"
          ? (clientY - cy) / (rect.height / 2)
          : (clientY - cy) / window.innerHeight;

      targetY = restY + clamp(dx, -1, 1) * maxY;
      targetX = restX - clamp(dy, -1, 1) * maxX;
    };

    // --- Portée fenêtre : un seul listener global, boucle permanente ---
    if (scope === "window") {
      const onMove = (event: PointerEvent) =>
        fromPoint(event.clientX, event.clientY);
      window.addEventListener("pointermove", onMove, { passive: true });
      running = true;
      frame = requestAnimationFrame(tick);
      return () => {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(frame);
      };
    }

    // --- Portée élément : listeners locaux, boucle à la demande ---
    const onEnter = (event: PointerEvent) => {
      targetZ = lift;
      fromPoint(event.clientX, event.clientY);
      start();
    };
    const onMove = (event: PointerEvent) => {
      fromPoint(event.clientX, event.clientY);
      start();
    };
    const onLeave = () => {
      targetX = restX;
      targetY = restY;
      targetZ = 0;
      start();
    };

    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    apply();

    return () => {
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [live, maxX, maxY, restX, restY, scope, ease, lift]);

  return ref;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
