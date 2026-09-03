import "server-only";

import {
  adminDb,
  bearerToken,
  isAdminConfigured,
  verifyAdmin,
  type VerifiedUser,
} from "@/lib/firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

/**
 * Garde d'accès pour les routes /api/admin/*.
 *
 * Chaque route commence par `const guard = await requireAdmin(request)` et
 * s'arrête si `guard.error` est présent. Centraliser ce contrôle évite
 * qu'une route oublie de vérifier le jeton — l'oubli le plus coûteux
 * possible ici, puisqu'il exposerait les emails de tous les utilisateurs.
 */

export interface AdminGuard {
  error?: NextResponse;
  user?: VerifiedUser;
  db?: Firestore;
}

export async function requireAdmin(request: Request): Promise<AdminGuard> {
  if (!isAdminConfigured) {
    return {
      error: NextResponse.json(
        { ok: false, error: "not_configured" },
        { status: 503 },
      ),
    };
  }

  const user = await verifyAdmin(bearerToken(request));
  if (!user) {
    // 403 et non 404 : le client sait qu'il est authentifié mais pas
    // autorisé, ce qui permet d'afficher un message utile.
    return {
      error: NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 },
      ),
    };
  }

  const db = adminDb();
  if (!db) {
    return {
      error: NextResponse.json(
        { ok: false, error: "no_database" },
        { status: 503 },
      ),
    };
  }

  return { user, db };
}

/** Lit et valide le corps JSON d'une requête. */
export async function readJson<T>(
  request: Request,
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    return { data: (await request.json()) as T };
  } catch {
    return {
      error: NextResponse.json(
        { ok: false, error: "invalid_json" },
        { status: 400 },
      ),
    };
  }
}

/** Chaîne bornée, nettoyée. Retourne "" si l'entrée n'est pas une chaîne. */
export function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Plage Unicode des diacritiques combinants, séparés par NFD. */
const DIACRITICS = /[̀-ͯ]/g;

/**
 * Slug d'URL : minuscules, tirets, sans accents.
 *
 * `normalize("NFD")` sépare « é » en « e » + accent combinant, que l'on
 * retire ensuite — d'où « Éditions » → « editions » plutôt que « ditions ».
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
