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
  /**
   * Précision secondaire, rendue en plus petit et en gris.
   *
   * Sert notamment à nuancer le délai d'expédition : la fourchette annoncée
   * ne vaut que « selon le volume et la destination », et cette réserve doit
   * rester lisible sans alourdir le corps de l'étape.
   */
  note?: string;
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

/**
 * Groupe de choix exclusifs, rendu en boutons.
 *
 * Rendu par un vrai groupe de radios (fieldset + inputs masqués + labels
 * stylés) : c'est la seule façon d'obtenir des boutons soignés ET la
 * navigation clavier native aux flèches.
 */
export interface Choice {
  label: string;
  options: string[];
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
    blog: string;
    account: string;
    cart: string;
    login: string;
    logout: string;
    howItWorks: string;
    faq: string;
    contact: string;
    cta: string;
    /** Liens légaux, rendus dans le pied de page. */
    legal: string;
    privacy: string;
    terms: string;
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
  };

  how: {
    title: string;
    intro: string;
    /** Six étapes du parcours, affichées une à la fois. */
    steps: Step[];
    navPrev: string;
    navNext: string;
    /** « Étape {i} sur {n} » — gabarit, les deux jetons sont remplacés. */
    progress: string;
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
      /**
       * Groupes de qualification, tous OPTIONNELS.
       *
       * Un studio qui découvre le service n'a souvent aucune idée du volume :
       * rendre ces champs obligatoires ferait abandonner au moment précis où
       * l'on veut le contraire. Chacun propose une échappatoire (« Je ne sais
       * pas encore », « À définir ensemble »).
       */
      qualification: {
        legend: string;
        stage: Choice;
        volume: Choice;
        edition: Choice;
        team: Choice;
      };
      /** Titres des blocs du formulaire. */
      sectionGame: string;
      sectionYou: string;
      /** Navigation du formulaire multi-écrans. */
      stepBack: string;
      stepSkip: string;
      /** « 2 sur 5 » — gabarit, les deux jetons sont remplacés. */
      stepProgress: string;
      /** Titre du dernier écran, qui regroupe les coordonnées. */
      lastStepTitle: string;
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

  /**
   * Bloc « la boutique ouvre bientôt », sur l'accueil.
   *
   * Le site s'adresse aux joueurs, mais la boutique n'encaisse pas encore :
   * plutôt que de le masquer, on l'annonce et on propose d'être prévenu.
   */
  opening: {
    eyebrow: string;
    title: string;
    body: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailError: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    errorTitle: string;
    errorBody: string;
    /** Mention RGPD sous le champ : à quoi sert l'adresse. */
    privacyNote: string;
    /** Champ piège anti-bot, masqué visuellement. */
    honeypotLabel: string;
  };

  /** Aperçu du catalogue sur l'accueil. */
  preview: {
    eyebrow: string;
    title: string;
    /**
     * Mention affichée AU-DESSUS de la grille.
     *
     * Le catalogue mêle un titre réel et des exemples de format : la
     * distinction doit être lue avant les cartes, pas après.
     */
    notice: string;
    cta: string;
  };

  /** Page dédiée aux studios — sortie de l'accueil. */
  submit: {
    title: string;
    intro: string;
    metaDescription: string;
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
    /** Puces de nature de produit. */
    kindHardware: string;
    kindBundle: string;
    /** Titre du bloc « accessoires et packs » dans le catalogue. */
    productsTitle: string;
    /**
     * Bandeau porté par les jaquettes des titres pas encore commandables.
     *
     * Du TEXTE, jamais une simple désaturation : la couleur ne porte jamais
     * seule l'information, et un lecteur d'écran doit annoncer le statut.
     */
    upcoming: string;
    /** Sélecteur de jeu sur la fiche d'un pack. */
    pickGame: string;
    pickGamePlaceholder: string;
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
    /** « Membre » — précède le numéro d'inscription. */
    memberSince: string;
    avatarLabel: string;
    avatarMember: string;
    avatarGoogle: string;
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

  blog: {
    title: string;
    intro: string;
    empty: string;
    /** Mention légale des contenus publicitaires (art. 20 LCEN). */
    sponsored: string;
    /** « En partenariat avec X » sur la fiche d'un article sponsorisé. */
    sponsoredBy: string;
    backToBlog: string;
    /** Section « derniers articles » sur la page d'accueil. */
    latestTitle: string;
    latestIntro: string;
    seeAll: string;
    readMore: string;
    /** Titre du sommaire d'un article. */
    tocTitle: string;
    /** Titre du bloc de sources et liens utiles, en fin d'article. */
    sourcesTitle: string;
    /** Titre du bloc « à lire ensuite ». */
    relatedTitle: string;
  };

  faq: {
    title: string;
    items: Item[];
  };

  /** Page 404. */
  notFound: {
    code: string;
    title: string;
    body: string;
    home: string;
  };

  footer: {
    tagline: string;
    navTitle: string;
    socialTitle: string;
    legalTitle: string;
    social: { label: string; href: string }[];
    signature: string;
    rights: string;
  };
}
