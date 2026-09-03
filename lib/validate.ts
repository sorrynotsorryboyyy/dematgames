/**
 * Validation partagée client + serveur.
 *
 * Le même module tourne dans le formulaire et dans la route API : les règles
 * ne peuvent pas diverger, et le serveur ne fait jamais confiance au client.
 */

export interface ApplicationInput {
  name: string;
  email: string;
  game: string;
  link: string;
  platform: string;
  message: string;
  /** Champ piège : rempli = bot. */
  website?: string;
  /** Horodatage d'ouverture du formulaire (ms epoch), pour détecter les soumissions instantanées. */
  startedAt?: number;
}

export type FieldName = "name" | "email" | "game" | "link" | "platform" | "message";

export type Errors = Partial<Record<FieldName, true>>;

export const LIMITS = {
  name: 80,
  email: 160,
  game: 120,
  link: 500,
  message: 2000,
} as const;

/** Délai minimal entre ouverture du formulaire et envoi. Un humain ne remplit pas 6 champs en 2 s. */
const MIN_FILL_MS = 2000;

// Volontairement permissif : la validation stricte d'un email se fait en l'envoyant.
// On rejette seulement ce qui est manifestement invalide.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Valide une candidature. Retourne les champs en erreur — vide si tout est bon.
 * `platform` doit faire partie des options proposées, contrôlées par l'appelant.
 */
export function validateApplication(
  input: Partial<ApplicationInput>,
  allowedPlatforms: readonly string[],
): Errors {
  const errors: Errors = {};
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const game = (input.game ?? "").trim();
  const link = (input.link ?? "").trim();
  const platform = (input.platform ?? "").trim();
  const message = (input.message ?? "").trim();

  if (!name || name.length > LIMITS.name) errors.name = true;
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) {
    errors.email = true;
  }
  if (!game || game.length > LIMITS.game) errors.game = true;
  if (!link || link.length > LIMITS.link || !isHttpUrl(link)) errors.link = true;
  if (!platform || !allowedPlatforms.includes(platform)) errors.platform = true;
  // Message optionnel : seule sa longueur est contrainte.
  if (message.length > LIMITS.message) errors.message = true;

  return errors;
}

export function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Heuristiques anti-bot, sans captcha : champ piège rempli, ou formulaire
 * envoyé trop vite pour avoir été lu.
 */
export function looksAutomated(input: Partial<ApplicationInput>): boolean {
  if (input.website && input.website.trim() !== "") return true;
  if (typeof input.startedAt === "number" && Number.isFinite(input.startedAt)) {
    const elapsed = Date.now() - input.startedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return true;
  }
  return false;
}
