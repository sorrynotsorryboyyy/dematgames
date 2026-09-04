import { en } from "@/content/en";
import { fr } from "@/content/fr";
import {
  hasErrors,
  looksAutomated,
  validateApplication,
  type ApplicationInput,
} from "@/lib/validate";
import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { COLLECTIONS } from "@/lib/schema";
import { notifyApplication } from "@/lib/notify";
import { NextResponse } from "next/server";

/**
 * Réception des candidatures « Founding developers ».
 *
 * La candidature est validée, écrite dans Firestore, puis notifiée par
 * e-mail. Aucune de ces deux dernières étapes ne peut faire échouer la
 * réponse : le studio ne doit pas payer une panne d'infrastructure.
 *
 * La validation est rejouée ici avec le même module que le client : le
 * navigateur n'est jamais une source de confiance.
 */

export const runtime = "nodejs";
/** La route doit s'exécuter à chaque appel, jamais être mise en cache. */
export const dynamic = "force-dynamic";

/** Cinq candidatures par heure et par IP : large pour un humain, étroit pour un script. */
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  if (rateLimited("apply", clientIp(request), RATE_LIMIT)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: Partial<ApplicationInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  // Bot détecté : on répond 200 sans rien enregistrer. Un 4xx apprendrait
  // au script ce qui a échoué ; un succès silencieux ne lui apprend rien.
  if (looksAutomated(body)) {
    return NextResponse.json({ ok: true });
  }

  // Les options viennent du contenu FR. Elles diffèrent du contenu EN, d'où
  // la validation contre les DEUX langues : un visiteur anglophone envoie
  // « In development », un francophone « En développement », et les deux
  // doivent être acceptés.
  const q = fr.founding.form.qualification;
  const qEn = en.founding.form.qualification;
  const errors = validateApplication(
    body,
    [...fr.founding.form.platform.options, ...en.founding.form.platform.options],
    {
      stage: [...q.stage.options, ...qEn.stage.options],
      volume: [...q.volume.options, ...qEn.volume.options],
      edition: [...q.edition.options, ...qEn.edition.options],
      team: [...q.team.options, ...qEn.team.options],
    },
  );
  if (hasErrors(errors)) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: Object.keys(errors) },
      { status: 422 },
    );
  }

  const application = {
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    game: String(body.game).trim(),
    link: String(body.link).trim(),
    platform: String(body.platform).trim(),
    message: String(body.message ?? "").trim(),
    // Qualification : optionnelle, d'où les chaînes vides possibles.
    stage: String(body.stage ?? "").trim(),
    volume: String(body.volume ?? "").trim(),
    edition: String(body.edition ?? "").trim(),
    team: String(body.team ?? "").trim(),
    receivedAt: new Date().toISOString(),
  };

  // --- Persistance ---
  //
  // C'était le seul vrai bug en production : les candidatures n'étaient que
  // journalisées, donc perdues au redémarrage. Elles sont désormais écrites
  // dans Firestore, où l'admin les relit.
  if (isAdminConfigured) {
    const db = adminDb();
    if (db) {
      try {
        await db.collection(COLLECTIONS.applications).add({
          ...application,
          createdAt: Date.now(),
          status: "new",
          notes: "",
        });
      } catch (e) {
        // Écriture impossible : on journalise pour ne pas perdre la
        // candidature, et on répond quand même OK. Faire échouer l'envoi
        // ferait fuir un studio pour un problème qui n'est pas le sien.
        console.error("[apply] échec d'écriture Firestore", e);
        console.log("[apply] candidature non persistée", application);
      }
    }
  } else {
    // Sans configuration serveur, on retombe sur la journalisation.
    console.log("[apply] nouvelle candidature (non persistée)", application);
  }

  // --- Notification ---
  //
  // JAMAIS bloquante : la candidature est déjà en base. Faire échouer la
  // réponse parce qu'un service tiers est indisponible ferait fuir un studio
  // pour un problème qui n'est pas le sien.
  const mail = await notifyApplication(application);
  if (!mail.ok) {
    console.error("[apply] notification non envoyée —", mail.error);
    // On journalise la candidature en clair : si l'e-mail n'est pas parti,
    // les journaux restent le dernier endroit où la retrouver rapidement.
    console.log("[apply] candidature reçue", application);
  }

  return NextResponse.json({ ok: true });
}
