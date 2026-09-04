import type { Lang } from "@/content/types";

/**
 * Schéma des collections Firestore.
 *
 * Ce fichier est la source unique de vérité sur la forme des données. Il est
 * importable côté client ET serveur (aucun secret, aucune dépendance
 * Firebase) : l'admin, les pages publiques et les routes API décrivent tous
 * les mêmes objets.
 *
 * Convention de dates : Firestore renvoie des Timestamp, mais les composants
 * client reçoivent des nombres (ms epoch) après sérialisation. D'où le type
 * `Millis` plutôt que `Date` ou `Timestamp` — un objet Date ne traverse pas
 * la frontière serveur/client d'un Server Component sans être sérialisé.
 */

/** Date en millisecondes depuis epoch. Sérialisable, comparable, triable. */
export type Millis = number;

export const COLLECTIONS = {
  users: "users",
  counters: "counters",
  posts: "posts",
  categories: "categories",
  applications: "applications",
  /** Adresses laissées pour être prévenu de l'ouverture de la boutique. */
  subscribers: "subscribers",
} as const;

/* ------------------------------------------------------------------
   Utilisateurs
   ------------------------------------------------------------------ */

export const ROLES = ["client", "dev", "admin"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Quel visuel affiche-t-on pour cet utilisateur ? */
export const AVATAR_SOURCES = ["member", "google"] as const;
export type AvatarSource = (typeof AVATAR_SOURCES)[number];

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  /** Photo fournie par Google. Peut être absente. */
  googlePhotoURL: string | null;
  /**
   * Numéro de membre, attribué une fois pour toutes à l'inscription via un
   * compteur atomique. Jamais réattribué, même si le compte est supprimé —
   * c'est ce qui permet de dire « je suis le #7 ».
   */
  memberNumber: number;
  /** `member` = avatar maison logo + numéro ; `google` = photo Google. */
  avatarSource: AvatarSource;
  role: Role;
  createdAt: Millis;
  lastSeenAt: Millis;
}

/* ------------------------------------------------------------------
   Blog
   ------------------------------------------------------------------ */

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

/**
 * Contenu d'un article dans une langue.
 *
 * Bilingue OPTIONNEL : un article peut n'exister qu'en français. Les pages
 * publiques ne listent que les articles disponibles dans leur langue, ce qui
 * préserve la règle de pureté linguistique (/fr 100 % français) sans obliger
 * à tout traduire.
 */
export interface PostContent {
  title: string;
  /** Chapô affiché dans les listes et les métadonnées. */
  excerpt: string;
  /** Corps de l'article, en Markdown. */
  body: string;
  /**
   * Titre destiné aux résultats de recherche.
   *
   * Optionnel : sans lui, `title` fait l'affaire. Il existe parce qu'un bon
   * titre de page et un bon titre pour Google ne sont pas toujours le même
   * texte — le second doit tenir en ~60 caractères, au-delà desquels il est
   * tronqué.
   */
  seoTitle?: string;
  /** Méta-description. Repli sur `excerpt`. ~155 caractères utiles. */
  seoDescription?: string;
  /**
   * Texte alternatif de l'image de couverture.
   *
   * Par langue : la description d'une image n'est pas la même en français et
   * en anglais. Sans lui, la couverture est traitée comme décorative
   * (`alt=""`) — jamais affublée d'un texte deviné.
   */
  coverAlt?: string;
}

/**
 * Lien sortant cité en fin d'article.
 *
 * Ces liens sont ÉDITORIAUX : ils sortent en `noopener noreferrer` mais
 * SANS `nofollow`. Un lien vers une source légitime est normal, et le
 * `nofollow` systématique envoie un signal de méfiance inutile. Le
 * `nofollow` reste réservé au sponsoring, où il est obligatoire.
 */
export interface PostLink {
  label: string;
  url: string;
}

export interface CategoryDoc {
  id: string;
  /** Segment d'URL, unique. Ex. « fabrication ». */
  slug: string;
  /** Libellé par langue. Une langue absente masque la catégorie côté public. */
  label: Partial<Record<Lang, string>>;
  /** Couleur d'accent, réutilise la palette de content/categories.ts. */
  color: string;
  order: number;
}

export interface PostDoc {
  id: string;
  slug: string;
  status: PostStatus;
  /** Contenu par langue. Au moins une langue doit être renseignée. */
  content: Partial<Record<Lang, PostContent>>;
  categoryId: string | null;
  /** Identifiant Cloudinary de l'image de couverture. */
  coverId: string | null;
  /** Sources et liens utiles, rendus en fin d'article. */
  links: PostLink[];
  /**
   * Article sponsorisé.
   *
   * Quand `true`, la mention « Sponsorisé » est affichée sur l'article ET
   * dans les listes. Ce n'est pas cosmétique : la loi française impose que
   * tout contenu publicitaire soit identifiable comme tel (art. 20 LCEN).
   * Le composant public ne doit jamais rendre un article sponsorisé sans son
   * étiquette.
   */
  sponsored: boolean;
  /** Annonceur, affiché avec la mention. Requis si `sponsored`. */
  sponsorName: string | null;
  /** Lien de l'annonceur. Rendu en `rel="sponsored nofollow"`. */
  sponsorUrl: string | null;
  authorUid: string;
  authorName: string;
  createdAt: Millis;
  updatedAt: Millis;
  /** Date de publication. `null` tant que l'article est en brouillon. */
  publishedAt: Millis | null;
}

/** Un article est-il visible publiquement dans cette langue ? */
/**
 * Lit la liste de liens d'un document Firestore.
 *
 * Défensif par principe : le document vient de la base, pas du code. Une
 * entrée sans libellé ou sans URL exploitable est écartée plutôt que rendue
 * à moitié, et seuls http(s) passent — un `javascript:` dans un href serait
 * une faille.
 */
export function readPostLinks(raw: unknown): PostLink[] {
  if (!Array.isArray(raw)) return [];
  const links: PostLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { label, url } = item as Record<string, unknown>;
    if (typeof label !== "string" || typeof url !== "string") continue;
    if (!/^https?:\/\//i.test(url.trim())) continue;
    if (!label.trim()) continue;
    links.push({ label: label.trim(), url: url.trim() });
  }
  return links;
}

export function isPostVisible(post: PostDoc, lang: Lang): boolean {
  if (post.status !== "published") return false;
  const content = post.content[lang];
  return Boolean(content?.title && content.body);
}

/* ------------------------------------------------------------------
   Candidatures (formulaire « studios fondateurs »)
   ------------------------------------------------------------------ */

export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "accepted",
  "declined",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationDoc {
  id: string;
  name: string;
  email: string;
  game: string;
  link: string;
  platform: string;
  message: string;
  status: ApplicationStatus;
  createdAt: Millis;
  /** Notes internes, jamais exposées publiquement. */
  notes: string;
}
