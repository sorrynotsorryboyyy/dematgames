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
  /**
   * Réponses de qualification, toutes OPTIONNELLES.
   *
   * Un studio qui découvre le service n'a souvent aucune idée du volume :
   * les rendre obligatoires ferait abandonner au moment précis où l'on veut
   * le contraire. Mais si une valeur est fournie, elle doit appartenir à la
   * liste des options — sinon un client pourrait injecter n'importe quoi.
   */
  stage?: string;
  volume?: string;
  edition?: string;
  team?: string;
  /** Champ piège : rempli = bot. */
  website?: string;
  /** Horodatage d'ouverture du formulaire (ms epoch), pour détecter les soumissions instantanées. */
  startedAt?: number;
}

export type FieldName =
  | "name"
  | "email"
  | "game"
  | "link"
  | "platform"
  | "message"
  | "stage"
  | "volume"
  | "edition"
  | "team";

/** Listes d'options autorisées pour les champs de qualification. */
export interface AllowedChoices {
  stage: readonly string[];
  volume: readonly string[];
  edition: readonly string[];
  team: readonly string[];
}

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
  allowedChoices?: AllowedChoices,
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

  // Qualification : vide est valide, mais une valeur hors liste ne l'est pas.
  if (allowedChoices) {
    for (const field of ["stage", "volume", "edition", "team"] as const) {
      const value = (input[field] ?? "").trim();
      if (value && !allowedChoices[field].includes(value)) {
        errors[field] = true;
      }
    }
  }

  return errors;
}

export function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Valide une inscription à l'alerte d'ouverture.
 *
 * Un seul champ, donc un simple booléen plutôt qu'un objet d'erreurs. On
 * réutilise volontairement `EMAIL_RE` et `LIMITS.email` : deux règles de
 * validation d'e-mail dans le même projet finiraient par diverger.
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const email = value.trim();
  return (
    email.length > 0 && email.length <= LIMITS.email && EMAIL_RE.test(email)
  );
}

/**
 * Champs communs à tous les formulaires publics, utilisés pour la détection
 * de robots. Volontairement dissocié de `ApplicationInput` : l'alerte
 * d'ouverture n'a qu'un champ e-mail mais porte les mêmes pièges.
 */
export interface BotSignals {
  /** Champ piège : rempli = bot. */
  website?: string;
  /** Horodatage d'ouverture du formulaire (ms epoch). */
  startedAt?: number;
}

/**
 * Heuristiques anti-bot, sans captcha : champ piège rempli, ou formulaire
 * envoyé trop vite pour avoir été lu.
 */
export function looksAutomated(input: BotSignals): boolean {
  if (input.website && input.website.trim() !== "") return true;
  if (typeof input.startedAt === "number" && Number.isFinite(input.startedAt)) {
    const elapsed = Date.now() - input.startedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return true;
  }
  return false;
}
