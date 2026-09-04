import { readJson, requireAdmin, str, withAdminErrors } from "@/lib/api-admin";
import { isMailConfigured, sendMail } from "@/lib/notify";
import { COLLECTIONS } from "@/lib/schema";
import { SITE_URL } from "@/lib/i18n";
import { NextResponse } from "next/server";

/**
 * Adresses laissées pour être prévenu de l'ouverture de la boutique.
 *
 * Une liste d'e-mails est une donnée personnelle : les règles Firestore en
 * refusent la lecture au navigateur, et cette route revérifie le rôle côté
 * serveur avant de répondre.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Au-delà, l'écran d'administration devient inutilisable. */
const MAX = 1000;

/**
 * Envois par lot.
 *
 * Resend limite le débit ; envoyer mille messages d'un coup se solderait par
 * des rejets en série. Les lots sont espacés pour rester sous la limite.
 */
const BATCH_SIZE = 20;
const BATCH_PAUSE_MS = 1100;

export interface SubscriberRow {
  id: string;
  email: string;
  createdAt: number;
  source: string;
}

function millis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

async function handleGET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  let snapshot;
  try {
    snapshot = await guard
      .db!.collection(COLLECTIONS.subscribers)
      .orderBy("createdAt", "desc")
      .limit(MAX)
      .get();
  } catch (e) {
    // Une collection vide ou un index manquant fait échouer `orderBy`. On
    // journalise la cause réelle plutôt que de renvoyer un échec opaque.
    console.warn("[admin/subscribers] orderBy a échoué, lecture simple :", e);
    snapshot = await guard.db!.collection(COLLECTIONS.subscribers).limit(MAX).get();
  }

  const subscribers: SubscriberRow[] = snapshot.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        email: typeof d.email === "string" ? d.email : "",
        createdAt: millis(d.createdAt),
        source: typeof d.source === "string" ? d.source : "",
      };
    })
    .filter((s) => s.email)
    .sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({
    ok: true,
    subscribers,
    // L'écran affiche l'état de la configuration : sans clé, le bouton
    // d'envoi doit expliquer pourquoi il ne fera rien.
    mailConfigured: isMailConfigured,
  });
}

/** Retire une adresse — droit à l'effacement (RGPD art. 17). */
async function handleDELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const { data, error } = await readJson<{ id?: string }>(request);
  if (error) return error;

  const id = str(data?.id, 400);
  if (!id) {
    return NextResponse.json({ ok: false, error: "no_id" }, { status: 422 });
  }

  await guard.db!.collection(COLLECTIONS.subscribers).doc(id).delete();
  return NextResponse.json({ ok: true });
}

/**
 * Campagne : écrit à tous les inscrits.
 *
 * Chaque message part SÉPARÉMENT, jamais en copie groupée : mettre mille
 * adresses en `to` les exposerait les unes aux autres — une fuite de données
 * personnelles, et une plainte CNIL assurée.
 */
async function handlePOST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const { data, error } = await readJson<{
    subject?: string;
    body?: string;
    test?: boolean;
    testEmail?: string;
  }>(request);
  if (error) return error;

  const subject = str(data?.subject, 200);
  const body = str(data?.body, 20_000);

  if (!subject || !body) {
    return NextResponse.json(
      { ok: false, error: "subject_and_body_required" },
      { status: 422 },
    );
  }

  if (!isMailConfigured) {
    return NextResponse.json(
      { ok: false, error: "mail_not_configured" },
      { status: 503 },
    );
  }

  // --- Envoi d'essai : une seule adresse, aucune campagne déclenchée ---
  if (data?.test) {
    const testEmail = str(data.testEmail, 320);
    if (!testEmail) {
      return NextResponse.json(
        { ok: false, error: "no_test_email" },
        { status: 422 },
      );
    }
    const result = await sendMail({
      to: testEmail,
      subject,
      ...renderCampaign(body, testEmail),
    });
    return NextResponse.json({
      ok: result.ok,
      sent: result.ok ? 1 : 0,
      failed: result.ok ? 0 : 1,
      test: true,
      error: result.error,
    });
  }

  // --- Campagne réelle ---
  const snapshot = await guard.db!.collection(COLLECTIONS.subscribers).limit(MAX).get();
  const emails = snapshot.docs
    .map((d) => (typeof d.data().email === "string" ? String(d.data().email) : ""))
    .filter(Boolean);

  if (emails.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, total: 0 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map((email) =>
        sendMail({ to: email, subject, ...renderCampaign(body, email) }),
      ),
    );

    results.forEach((r, k) => {
      if (r.ok) sent += 1;
      else failures.push(`${batch[k]} — ${r.error ?? "échec"}`);
    });

    // Pause entre les lots, sauf après le dernier.
    if (i + BATCH_SIZE < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));
    }
  }

  if (failures.length > 0) {
    console.error("[admin/subscribers] échecs d'envoi :", failures.slice(0, 20));
  }

  return NextResponse.json({
    ok: true,
    total: emails.length,
    sent,
    failed: failures.length,
    // Un échantillon suffit à diagnostiquer ; la liste entière encombrerait.
    sample: failures.slice(0, 5),
  });
}

/**
 * Compose le message, avec le lien de désinscription.
 *
 * OBLIGATOIRE et non négociable : tout message publicitaire doit offrir un
 * moyen simple de s'opposer à de nouveaux envois (art. L34-5 du code des
 * postes et des communications électroniques ; RGPD art. 21). Le lien est
 * ajouté ici, dans la seule fonction de rendu, pour qu'aucun envoi ne puisse
 * en être dépourvu — même si l'auteur du message l'oublie.
 */
function renderCampaign(body: string, email: string) {
  const unsubscribe = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;

  const text = [
    body,
    "",
    "—",
    "Vous recevez ce message parce que vous avez demandé à être prévenu de",
    "l'ouverture de la boutique dematgames.com.",
    `Se désinscrire : ${unsubscribe}`,
  ].join("\n");

  const html = [
    `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;color:#16161a;max-width:560px">`,
    body
      .split(/\n{2,}/)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join(""),
    `<hr style="border:none;border-top:1px solid #e3e0da;margin:28px 0">`,
    `<p style="font-size:13px;color:#5b5b66">`,
    `Vous recevez ce message parce que vous avez demandé à être prévenu de l'ouverture de la boutique dematgames.com.<br>`,
    `<a href="${unsubscribe}" style="color:#c2410c">Se désinscrire</a>`,
    `</p></div>`,
  ].join("");

  return { text, html };
}

/** Le corps est saisi dans l'admin : on ne le rend jamais en HTML brut. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const GET = withAdminErrors(handleGET);
export const DELETE = withAdminErrors(handleDELETE);
export const POST = withAdminErrors(handlePOST);
