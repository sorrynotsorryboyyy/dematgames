import { en } from "@/content/en";
import { fr } from "@/content/fr";
import {
  hasErrors,
  looksAutomated,
  validateApplication,
  type ApplicationInput,
} from "@/lib/validate";
import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { NextResponse } from "next/server";

/**
 * Réception des candidatures « Founding developers ».
 *
 * État actuel : la candidature est validée puis journalisée. Rien n'est
 * persisté — c'est le point d'accroche à brancher (voir TODO plus bas).
 *
 * La validation est rejouée ici avec le même module que le client : le
 * navigateur n'est jamais une source de confiance.
 */

export const runtime = "nodejs";
/** La route doit s'exécuter à chaque appel, jamais être mise en cache. */
export const dynamic = "force-dynamic";

/**
 * Limitation de débit en mémoire.
 *
 * ATTENTION : suffisant pour une landing sur une seule instance, mais l'état
 * est perdu au redémarrage et n'est pas partagé entre instances. En production
 * multi-instance (ou serverless), remplacer par Upstash Redis / Vercel KV.
 */
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

/** Purge des entrées expirées : évite que la Map ne grossisse indéfiniment. */
function sweep() {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now > entry.resetAt) hits.delete(ip);
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  sweep();
  if (rateLimited(ip)) {
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

  // ------------------------------------------------------------------
  // TODO — notification. Les candidatures sont persistées dans Firestore
  // et visibles dans /admin, mais personne n'est prévenu à leur arrivée.
  //
  // 1) Email de notification (Resend) :
  //    import { Resend } from "resend";
  //    await new Resend(process.env.RESEND_API_KEY).emails.send({
  //      from: "site@dematgames.com",
  //      to: "hello@dematgames.com",
  //      subject: `Nouveau jeu : ${application.game}`,
  //      text: JSON.stringify(application, null, 2),
  //    });
  //
  // 2) Persistance (Supabase) :
  //    await supabase.from("applications").insert(application);
  //
  // 3) Ou simplement une ligne dans Airtable / Notion / Google Sheets.
  // ------------------------------------------------------------------

  return NextResponse.json({ ok: true });
}
