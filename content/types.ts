/**
 * Contrat de contenu partagé par toutes les langues.
 *
 * fr.ts et en.ts sont tous deux typés `Content`. Si une clé manque ou change
 * dans une seule des deux langues, `npm run typecheck` échoue. C'est la
 * garantie que les traductions ne divergent jamais silencieusement.
 *
 * Règle : aucune chaîne de texte visible ne doit vivre dans un composant.
 * Tout passe par ce fichier — c'est ce qui rend la landing modifiable
 * sans toucher au code.
 */

export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "fr";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Élément titre + description, réutilisé dans plusieurs sections. */
export interface Item {
  title: string;
  body: string;
}

/** Étape numérotée de la timeline « From build to box ». */
export interface Step {
  n: string;
  title: string;
  body: string;
}

/** Carte d'édition (Standard / Deluxe / Collector). */
export interface Edition {
  name: string;
  tagline: string;
  features: string[];
  /** Une seule édition est mise en avant visuellement. */
  featured?: boolean;
  badge?: string;
}

export interface Field {
  label: string;
  placeholder: string;
  /** Message affiché quand la validation échoue sur ce champ. */
  error: string;
}

export interface Content {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogAlt: string;
  };

  nav: {
    shop: string;
    account: string;
    cart: string;
    login: string;
    logout: string;
    howItWorks: string;
    faq: string;
    contact: string;
    cta: string;
    /** Lien d'évitement pour lecteurs d'écran et navigation clavier. */
    skipToContent: string;
    menuOpen: string;
    menuClose: string;
    switchTo: string;
  };

  hero: {
    /** Accroche manifesto, au-dessus du badge. Deux lignes. */
    tagline: [string, string];
    badge: string;
    /** Trois lignes distinctes : les sauts sont voulus, pas cosmétiques. */
    titleLines: [string, string, string];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    reassurance: string[];
    scrollHint: string;
  };

  problem: {
    titleLines: [string, string];
    body: string;
    cards: Item[];
    transition: string;
  };

  how: {
    title: string;
    intro: string;
    steps: Step[];
    pipeline: {
      /** Libellés accessibles des maillons .EXE → 💿 → 📦 → PLAYER */
      labels: [string, string, string, string];
      caption: string;
    };
  };

  whyNow: {
    eyebrow: string;
    lineDigital: string;
    linePhysical: string;
    quote: string;
    body: string;
    shelfCaption: string;
  };

  founding: {
    eyebrow: string;
    title: string;
    body: string;
    ctaNote: string;
    form: {
      name: Field;
      email: Field;
      game: Field;
      link: Field;
      platform: Field & { options: string[] };
      message: Field;
      submit: string;
      submitting: string;
      required: string;
      optional: string;
      successTitle: string;
      successBody: string;
      errorTitle: string;
      errorBody: string;
      retry: string;
      /** Champ piège anti-bot, masqué visuellement. */
      honeypotLabel: string;
    };
  };

  shop: {
    title: string;
    intro: string;
    /** Mention de tarifs indicatifs — voir PRICING_IS_INDICATIVE. */
    pricingNotice: string;
    priceFrom: string;
    filterAll: string;
    filterLabel: string;
    empty: string;
    resultsOne: string;
    /** Gabarit avec {n} — remplacé par le nombre de jeux. */
    resultsMany: string;
    backToShop: string;
    chooseEdition: string;
    addToCart: string;
    added: string;
    limitedRun: string;
    includes: string;
    byStudio: string;
    releasedIn: string;
  };

  cart: {
    title: string;
    empty: string;
    emptyCta: string;
    quantity: string;
    remove: string;
    subtotal: string;
    shippingNote: string;
    /** Fin de tunnel : la boutique n'ouvre pas encore. */
    closedTitle: string;
    closedBody: string;
    closedCta: string;
    checkoutDisabled: string;
  };

  account: {
    title: string;
    signedInAs: string;
    guestTitle: string;
    guestBody: string;
    tabs: { profile: string; orders: string; games: string };
    profileName: string;
    profileEmail: string;
    noOrders: string;
    noGames: string;
    noGamesCta: string;
    auth: {
      loginTitle: string;
      /** Sous-titre de la page de connexion. */
      intro: string;
      /** Libellé du bouton Google. */
      google: string;
      /** Ce que le site récupère du compte Google — affiché sous le bouton. */
      privacy: string;
      /** Connexion indisponible (Firebase non configuré). */
      unavailable: string;
      errorNetwork: string;
      errorUnknown: string;
    };
  };

  faq: {
    title: string;
    items: Item[];
  };

  footer: {
    tagline: string;
    navTitle: string;
    socialTitle: string;
    social: { label: string; href: string }[];
    signature: string;
    rights: string;
  };
}
