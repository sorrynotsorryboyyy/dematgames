import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { COLLECTIONS } from "@/lib/schema";
import { isValidEmail, looksAutomated } from "@/lib/validate";
import { NextResponse } from "next/server";

/**
 * Inscription à l'alerte d'ouverture de la boutique.
 *
 * Un seul champ : l'adresse e-mail. Elle n'est utilisée que pour prévenir de
 * l'ouverture — c'est ce qu'annonce le formulaire, et la politique de
 * confidentialité le documente comme un traitement fondé sur le consentement.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Plus permissif que le formulaire de candidature (5/h) : il n'y a qu'un
 * champ, et un visiteur peut légitimement se tromper d'adresse puis corriger.
 */
const LIMIT = { max: 10, windowMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  if (rateLimited("subscribe", clientIp(request), LIMIT)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: { email?: unknown; website?: string; startedAt?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  // Bot détecté : on répond 200 sans rien enregistrer. Un 4xx apprendrait au
  // script ce qui a échoué ; un succès silencieux ne lui apprend rien.
  if (looksAutomated(body)) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: ["email"] },
      { status: 422 },
    );
  }

  const email = String(body.email).trim().toLowerCase();

  if (!isAdminConfigured) {
    // Sans configuration serveur, on journalise plutôt que de faire échouer :
    // l'inscription est perdue, mais le visiteur n'a rien à y faire.
    console.log("[subscribe] inscription non persistée", email);
    return NextResponse.json({ ok: true });
  }

  const db = adminDb();
  if (!db) return NextResponse.json({ ok: true });

  try {
    // L'adresse sert d'identifiant du document : une seconde inscription
    // écrase la première au lieu de créer un doublon. Pas besoin de lire
    // avant d'écrire, et pas de liste polluée.
    await db
      .collection(COLLECTIONS.subscribers)
      .doc(encodeURIComponent(email))
      .set(
        {
          email,
          createdAt: Date.now(),
          source: "opening-alert",
        },
        { merge: true },
      );
  } catch (e) {
    console.error("[subscribe] échec d'écriture Firestore", e);
    return NextResponse.json(
      { ok: false, error: "storage" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
