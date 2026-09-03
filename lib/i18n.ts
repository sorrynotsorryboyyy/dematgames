import { en } from "@/content/en";
import { fr } from "@/content/fr";
import { DEFAULT_LANG, type Content, type Lang } from "@/content/types";

const DICT: Record<Lang, Content> = { fr, en };

/** Contenu complet pour une langue. */
export function getContent(lang: Lang): Content {
  return DICT[lang] ?? DICT[DEFAULT_LANG];
}

/** L'autre langue — utilisé par le switch, qui n'a que deux états. */
export function otherLang(lang: Lang): Lang {
  return lang === "fr" ? "en" : "fr";
}

/**
 * Ancres partagées entre le header, le footer et les sections.
 *
 * `how` et `founding` ne sont plus rendues sur l'accueil : le parcours en six
 * étapes et l'appel aux studios ont migré vers la page « proposer mon jeu ».
 * Elles restent définies car la page dédiée les utilise.
 */
export const ANCHORS = {
  how: "how-it-works",
  faq: "faq",
  founding: "founding",
  /** Bloc « prévenez-moi de l'ouverture », sur l'accueil. */
  opening: "opening",
} as const;

/**
 * Segments d'URL localisés.
 *
 * `/fr/boutique` et `/en/shop` : la cohérence linguistique stricte du site
 * s'applique jusque dans les chemins. Un `/fr/shop` mélangerait les langues
 * dans la barre d'adresse.
 */
export const ROUTES = {
  shop: { fr: "boutique", en: "shop" },
  cart: { fr: "panier", en: "cart" },
  account: { fr: "compte", en: "account" },
  login: { fr: "connexion", en: "login" },
  blog: { fr: "blog", en: "blog" },
  admin: { fr: "admin", en: "admin" },
  /** Appel aux studios : sorti de l'accueil, qui s'adresse aux joueurs. */
  submit: { fr: "proposer-mon-jeu", en: "submit-your-game" },
  legal: { fr: "mentions-legales", en: "legal-notice" },
  privacy: { fr: "confidentialite", en: "privacy" },
  terms: { fr: "cgv", en: "terms" },
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Chemin absolu d'une route, dans la langue donnée. */
export function path(key: RouteKey, lang: Lang, ...segments: string[]): string {
  const base = `/${lang}/${ROUTES[key][lang]}`;
  return segments.length ? `${base}/${segments.join("/")}` : base;
}

/**
 * Équivalent du chemin courant dans l'autre langue.
 *
 * Sans cela, le switch de langue renvoyait toujours vers l'accueil : depuis
 * /fr/boutique/nocturne on atterrissait sur /en, en perdant à la fois la page
 * et la position de lecture. On traduit donc le segment de route et on
 * conserve la fin du chemin (le slug d'un jeu est identique dans les deux
 * langues).
 */
export function translatePath(pathname: string, to: Lang): string {
  const parts = pathname.split("/").filter(Boolean);

  // "/" ou "/fr" : rien à traduire au-delà de la langue.
  if (parts.length <= 1) return `/${to}`;

  const [, section, ...rest] = parts;

  // Le segment de section est localisé : on cherche à quelle route il
  // correspond, pour reprendre son équivalent dans la langue cible.
  for (const [key, paths] of Object.entries(ROUTES)) {
    // `as const` sur ROUTES fige les valeurs en types littéraux ; on élargit
    // en string[] pour comparer à un segment d'URL quelconque.
    const localized: readonly string[] = Object.values(paths);
    if (localized.includes(section)) {
      return path(key as RouteKey, to, ...rest);
    }
  }

  // Segment inconnu : on retombe sur l'accueil de la langue cible plutôt que
  // de fabriquer une URL qui n'existe pas.
  return `/${to}`;
}

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // `??` ne se déclenche que sur null/undefined : une variable définie mais
  // VIDE (cas courant sur Vercel) passait au travers et produisait `new
  // URL("")`, qui lève ERR_INVALID_URL et fait échouer tout le build.
  // On traite donc la chaîne vide comme une absence.
  if (configured) {
    const candidate = /^https?:\/\//.test(configured)
      ? configured
      : `https://${configured}`;
    try {
      // Valide la forme avant de la propager : une URL malformée ferait
      // échouer le prerender de chaque page, loin d'ici.
      new URL(candidate);
      return candidate.replace(/\/$/, "");
    } catch {
      // Valeur inexploitable : on retombe sur les valeurs par défaut.
    }
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://dematgames.com";
}

/**
 * URL publique du site.
 *
 * Sert de base aux URLs canoniques, aux alternates hreflang, au sitemap et
 * aux métadonnées Open Graph. En local, on retombe sur localhost plutôt que
 * sur le domaine de production : sans cela, un `npm run dev` génèrerait des
 * canonicals pointant vers le site en ligne.
 */
export const SITE_URL = resolveSiteUrl();

export const CONTACT_EMAIL = "hello@dematgames.com";
