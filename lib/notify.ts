import "server-only";

/**
 * Envoi d'e-mails transactionnels et de campagnes, via l'API HTTP de Resend.
 *
 * Aucune dépendance ajoutée : le SDK officiel ne fait qu'emballer cet appel
 * `fetch`, et le projet tient à zéro dépendance runtime tierce.
 *
 * `import "server-only"` fait échouer la compilation si ce module est importé
 * depuis un composant client — RESEND_API_KEY donne le droit d'envoyer du
 * courrier au nom du domaine, et une importation distraite dans un fichier
 * "use client" la publierait dans le bundle du navigateur.
 */

const API = "https://api.resend.com/emails";

const apiKey = process.env.RESEND_API_KEY?.trim();

/**
 * Adresse d'expédition.
 *
 * Tant que `dematgames.com` n'est pas vérifié chez Resend, seule l'adresse
 * du domaine bac à sable est acceptée — et elle ne peut écrire qu'au
 * propriétaire du compte. C'est suffisant pour les notifications internes,
 * jamais pour une campagne.
 */
const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

/** Destinataire des notifications internes (nouvelle candidature). */
const notifyTo = process.env.NOTIFY_EMAIL?.trim();

export const isMailConfigured = Boolean(apiKey);

export interface MailResult {
  ok: boolean;
  /** Renseigné en cas d'échec : sert au diagnostic, jamais affiché au visiteur. */
  error?: string;
  /** Identifiant Resend du message envoyé. */
  id?: string;
}

/**
 * Envoie un e-mail. Ne lève JAMAIS.
 *
 * Un appelant en chemin critique (l'enregistrement d'une candidature) ne doit
 * pas échouer parce qu'un service tiers est indisponible. L'erreur est
 * retournée, à l'appelant de décider — et jusqu'ici, tous choisissent de
 * poursuivre.
 */
export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<MailResult> {
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY absente" };
  }

  try {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      // Le corps de la réponse porte le motif exact (domaine non vérifié,
      // quota dépassé…). On le remonte : sans lui, le diagnostic se résume
      // à un code HTTP.
      const detail = await response.text();
      return {
        ok: false,
        error: `HTTP ${response.status} — ${detail.slice(0, 300)}`,
      };
    }

    const data = (await response.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Prévient l'équipe qu'une candidature vient d'arriver.
 *
 * Sans cela, une candidature dort dans Firestore jusqu'à ce que quelqu'un
 * pense à ouvrir /admin — un studio qui attend une réponse ne le sait pas.
 */
export async function notifyApplication(application: {
  name: string;
  email: string;
  game: string;
  link: string;
  platform: string;
  message: string;
  stage: string;
  volume: string;
  edition: string;
  team: string;
}): Promise<MailResult> {
  if (!notifyTo) {
    return { ok: false, error: "NOTIFY_EMAIL absente" };
  }

  const lines = [
    `Jeu       : ${application.game}`,
    `Studio    : ${application.name}`,
    `E-mail    : ${application.email}`,
    `Lien      : ${application.link}`,
    `Plateforme: ${application.platform}`,
    "",
    "— Qualification —",
    `Avancement: ${application.stage || "non précisé"}`,
    `Volume    : ${application.volume || "non précisé"}`,
    `Édition   : ${application.edition || "non précisé"}`,
    `Équipe    : ${application.team || "non précisé"}`,
    "",
    "— Message —",
    application.message || "(aucun)",
  ];

  return sendMail({
    to: notifyTo,
    subject: `Nouvelle candidature : ${application.game}`,
    text: lines.join("\n"),
    // Répondre à l'e-mail répond directement au studio.
    replyTo: application.email,
  });
}
