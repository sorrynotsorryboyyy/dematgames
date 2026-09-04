import type { Content } from "./types";

/**
 * Version française — 100 % en français.
 *
 * Ligne éditoriale :
 * - On s'adresse au développeur (« vous »), jamais au joueur.
 * - Phrases courtes. Un verbe d'action par étape.
 * - Aucun chiffre inventé : seuls 50 (minimum réel) et 20 (places ouvertes).
 * - On dit ce qu'on ne sait pas encore plutôt que de le masquer — c'est ce qui
 *   rend crédible tout le reste auprès d'un studio.
 *
 * La version anglaise vit dans en.ts, intégralement en anglais.
 */
export const fr: Content = {
  meta: {
    title: "dematgames.com — Des jeux indés qu'on peut vraiment posséder",
    description:
      "Éditions physiques de jeux indépendants : boîtier, jaquette, livret. Fabriquées à la demande en Europe, expédiées chez vous. Un jeu qui vous appartient vraiment.",
    keywords: [
      "édition physique jeu vidéo",
      "jeu indé physique",
      "acheter jeu indé en boîte",
      "boîtier jeu PC",
      "collection jeux vidéo",
      "édition collector indie",
      "dematgames",
    ],
    ogAlt: "dematgames.com — Éditions physiques de jeux indépendants",
  },

  nav: {
    shop: "Boutique",
    blog: "Blog",
    account: "Mon compte",
    cart: "Panier",
    login: "Connexion",
    logout: "Se déconnecter",
    howItWorks: "Comment ça marche",
    faq: "Questions",
    contact: "Contact",
    cta: "Proposer mon jeu",
    legal: "Mentions légales",
    privacy: "Confidentialité",
    terms: "CGV",
    skipToContent: "Aller au contenu principal",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
    switchTo: "Switch to English",
  },

  hero: {
    // Remontée depuis l'ancienne section manifesto : la promesse arrive
    // désormais dès le premier écran, au-dessus du badge.
    tagline: ["Oubliez le téléchargement.", "Gardez le jeu."],
    badge: "Éditions physiques, fabriquées à la demande",
    // Plus de capitales : le composant ne force plus l'uppercase, et une
    // phrase en casse normale porte mieux le ton « startup » voulu.
    titleLines: ["Des jeux indés", "qu'on peut", "vraiment posséder."],
    subtitle:
      "Des éditions physiques de jeux indépendants : boîtier, jaquette, livret. Fabriquées à la demande en Europe, expédiées chez vous — et à vous pour de bon.",
    ctaPrimary: "Voir le catalogue",
    ctaSecondary: "Me prévenir de l'ouverture",
    reassurance: [
      "Fabriqué en Europe",
      "À la demande, sans surstock",
      "Expédition suivie",
    ],
  },

  how: {
    title: "Du premier message à la boîte.",
    intro:
      "Six étapes entre votre premier message et une boîte posée sur l'étagère d'un joueur.",
    steps: [
      {
        n: "01",
        title: "Contact",
        body: "Vous nous écrivez avec votre jeu et ce que vous avez en tête. Nous répondons sous quelques jours, sans engagement.",
      },
      {
        n: "02",
        title: "Définition du besoin",
        body: "On cadre ensemble : format d'édition, volume, calendrier. C'est le moment où l'on vous dit ce qui est faisable et à quel coût.",
      },
      {
        n: "03",
        title: "Préparation",
        body: "Build du jeu, jaquette, livret, sérigraphie du disque : nous préparons les fichiers d'impression à partir de vos visuels.",
      },
      {
        n: "04",
        title: "Pressage à la demande",
        body: "Vous n'avancez rien. Ni pressage, ni impression, ni stock : nous finançons la production, et chaque exemplaire est fabriqué quand il est commandé.",
        note: "Vous touchez un pourcentage sur chaque vente. Le détail se définit ensemble, selon le format et le volume.",
      },
      {
        n: "05",
        title: "Expédition",
        body: "Le colis part sous 1 à 4 jours ouvrés, emballé et suivi.",
        note: "Selon le volume commandé et la destination.",
      },
      {
        n: "06",
        title: "Entre les mains du joueur",
        body: "Il déballe un objet, pas un code de téléchargement. Et il le garde.",
      },
    ],
    navPrev: "Étape précédente",
    navNext: "Étape suivante",
    progress: "Étape {i} sur {n}",
  },

  whyNow: {
    eyebrow: "Pourquoi maintenant ?",
    lineDigital: "Vos jeux ne vous appartiennent pas.",
    linePhysical: "Une boîte, si.",
    quote:
      "Une boutique ferme, un compte est suspendu, une licence expire — et une bibliothèque entière disparaît. Personne ne peut effacer un objet posé sur une étagère.",
    body: "Acheter un jeu en ligne, c'est acheter un droit d'accès : révocable, non transmissible, dépendant d'un service qui doit rester ouvert. Un exemplaire physique appartient à celui qui l'a acheté. Il se prête, s'offre, se revend, et survit à la plateforme qui l'a vendu.",
    shelfCaption: "Une étagère de jeux indépendants en édition physique.",
  },

  founding: {
    eyebrow: "Studios fondateurs",
    title: "Nous ne cherchons pas un nombre.",
    body: "Nous cherchons des jeux qu'on a envie de tenir en main. Peu importe la taille de votre communauté : ce qui compte, c'est que l'objet ait du sens pour elle. Parlez-nous du vôtre — nous répondons à chacun.",
    ctaNote: "Gratuit · Sans engagement · Réponse sous quelques jours",
    form: {
      name: {
        label: "Nom / pseudo",
        placeholder: "Comment doit-on vous appeler ?",
        error: "Indiquez votre nom ou votre pseudo.",
      },
      email: {
        label: "Email",
        placeholder: "vous@studio.com",
        error: "Indiquez une adresse email valide.",
      },
      game: {
        label: "Nom du jeu",
        placeholder: "Le titre de votre jeu",
        error: "Indiquez le nom de votre jeu.",
      },
      link: {
        label: "Lien vers le jeu",
        placeholder: "https://store.steampowered.com/app/…",
        error: "Indiquez un lien valide, commençant par https://",
      },
      platform: {
        label: "Plateforme",
        placeholder: "Sélectionnez une plateforme",
        error: "Sélectionnez une plateforme.",
        options: [
          "PC (Windows)",
          "Steam",
          "itch.io",
          "Epic Games Store",
          "Autre",
        ],
      },
      message: {
        label: "Message",
        placeholder:
          "Parlez-nous de votre jeu, de votre communauté, de l'édition que vous imaginez…",
        error: "Message trop long (2000 caractères maximum).",
      },
      qualification: {
        legend: "Pour cadrer votre demande",
        stage: {
          label: "Où en est votre jeu ?",
          options: [
            "En développement",
            "En accès anticipé",
            "Sortie imminente",
            "Déjà sorti",
          ],
        },
        volume: {
          label: "Combien d'exemplaires envisagez-vous ?",
          options: [
            "Environ 50",
            "50 à 100",
            "100 à 500",
            "Plus de 500",
            "Je ne sais pas encore",
          ],
        },
        edition: {
          label: "Quelle édition vous intéresse ?",
          options: ["Standard", "Deluxe", "Collector", "À définir ensemble"],
        },
        team: {
          label: "Combien êtes-vous dans l'équipe ?",
          options: ["Solo", "2 à 5", "6 à 15", "Plus de 15"],
        },
      },
      sectionGame: "Votre jeu",
      sectionYou: "Vous",
      stepBack: "Retour",
      stepSkip: "Passer",
      stepProgress: "{i} sur {n}",
      lastStepTitle: "Où vous joindre ?",
      submit: "Proposer mon jeu",
      submitting: "Envoi en cours…",
      required: "obligatoire",
      optional: "optionnel",
      successTitle: "Bien reçu.",
      successBody:
        "Merci — nous revenons vers vous sous quelques jours pour parler de votre jeu et de l'édition qui lui irait.",
      errorTitle: "L'envoi a échoué.",
      errorBody:
        "Le problème vient de chez nous. Réessayez dans un instant, ou écrivez-nous directement à hello@dematgames.com.",
      retry: "Réessayer",
      honeypotLabel: "Laissez ce champ vide",
    },
  },

  opening: {
    eyebrow: "Bientôt",
    title: "La boutique ouvre bientôt.",
    body: "Nous préparons les premières éditions avec les studios partenaires. Laissez votre adresse pour être prévenu le jour de l'ouverture — c'est tout ce que nous en ferons.",
    emailLabel: "Votre adresse e-mail",
    emailPlaceholder: "vous@exemple.com",
    emailError: "Cette adresse ne semble pas valide.",
    submit: "Me prévenir",
    submitting: "Envoi…",
    successTitle: "C'est noté.",
    successBody: "Vous recevrez un message le jour de l'ouverture. Pas de newsletter, pas de relance.",
    errorTitle: "L'envoi a échoué.",
    errorBody: "Réessayez dans un instant, ou écrivez-nous à hello@dematgames.com.",
    privacyNote:
      "Votre adresse sert uniquement à vous prévenir de l'ouverture. Vous pouvez demander son retrait à tout moment.",
    honeypotLabel: "Ne pas remplir",
  },

  preview: {
    eyebrow: "Le catalogue",
    title: "Nos éditions physiques.",
    notice:
      "Chaque titre est pressé, imprimé et expédié par nos soins. La boutique ouvre bientôt : les éditions ci-dessous ne sont pas encore commandables.",
    cta: "Voir tout le catalogue",
  },

  submit: {
    title: "Proposer mon jeu",
    intro:
      "Vous développez un jeu et vous aimeriez le voir en boîte ? Parlez-nous-en. Nous lisons chaque message et répondons à chacun.",
    metaDescription:
      "Proposez votre jeu indépendant pour une édition physique : boîtier, jaquette, livret, fabrication et expédition prises en charge.",
  },

  shop: {
    title: "La boutique",
    intro:
      "Les éditions physiques de nos studios partenaires. Chaque exemplaire est fabriqué à la commande et expédié depuis la France.",
    pricingNotice:
      "La boutique n'est pas encore ouverte : aucun titre n'est commandable pour l'instant. Les prix affichés sont fermes.",
    priceFrom: "à partir de",
    filterAll: "Tous les jeux",
    filterLabel: "Filtrer par catégorie",
    empty: "Aucun jeu dans cette catégorie pour le moment.",
    resultsOne: "1 jeu",
    resultsMany: "{n} jeux",
    backToShop: "Retour à la boutique",
    chooseEdition: "Choisissez votre édition",
    addToCart: "Ajouter au panier",
    added: "Ajouté au panier",
    limitedRun: "Tirage limité",
    includes: "Dans la boîte",
    byStudio: "Par",
    releasedIn: "Sorti en",
    kindHardware: "Matériel",
    kindBundle: "Pack",
    productsTitle: "Accessoires et packs",
    upcoming: "Bientôt disponible",
    pickGame: "Choisissez votre jeu",
    pickGamePlaceholder: "Sélectionnez un titre du catalogue",
  },

  cart: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    emptyCta: "Parcourir la boutique",
    quantity: "Quantité",
    remove: "Retirer",
    subtotal: "Sous-total",
    shippingNote: "Frais de port calculés à la commande.",
    closedTitle: "La boutique n'est pas encore ouverte.",
    closedBody:
      "Ce parcours est une démonstration : aucun paiement n'est possible et aucune commande ne sera enregistrée. Laissez-nous votre adresse et vous serez prévenu dès que la boutique ouvrira.",
    closedCta: "Me prévenir de l'ouverture",
    checkoutDisabled: "Paiement bientôt disponible",
  },

  account: {
    title: "Mon compte",
    signedInAs: "Connecté en tant que",
    guestTitle: "Vous n'êtes pas connecté.",
    guestBody:
      "Connectez-vous pour retrouver vos commandes et suivre vos jeux publiés.",
    tabs: { profile: "Profil", orders: "Commandes", games: "Mes jeux" },
    profileName: "Nom",
    profileEmail: "Email",
    memberSince: "Membre",
    avatarLabel: "Photo de profil",
    avatarMember: "Mon badge",
    avatarGoogle: "Photo Google",
    noOrders:
      "Aucune commande pour l'instant. La boutique ouvrira avec les premiers jeux produits.",
    noGames:
      "Vous n'avez pas encore de jeu chez nous. Nous sélectionnons en continu de nouveaux studios partenaires.",
    noGamesCta: "Proposer mon jeu",
    auth: {
      loginTitle: "Connexion",
      intro:
        "Un seul bouton, pas de mot de passe à retenir. Votre première connexion crée votre compte.",
      google: "Continuer avec Google",
      privacy:
        "Nous récupérons votre nom, votre email et votre photo de profil Google. Rien d'autre, et jamais votre mot de passe.",
      unavailable:
        "La connexion est momentanément indisponible. Réessayez dans quelques minutes, ou écrivez-nous à hello@dematgames.com.",
      errorNetwork:
        "Connexion au réseau impossible. Vérifiez votre connexion et réessayez.",
      errorUnknown:
        "La connexion a échoué. Réessayez, ou écrivez-nous à hello@dematgames.com.",
    },
  },

  blog: {
    title: "Le blog",
    intro:
      "Ce qu'on apprend en fabriquant des éditions physiques : coulisses d'atelier, retours de studios, et l'état d'un marché qu'on découvre en le construisant.",
    empty: "Aucun article pour le moment. Revenez bientôt.",
    sponsored: "Sponsorisé",
    sponsoredBy: "En partenariat avec",
    backToBlog: "Retour au blog",
    latestTitle: "Derniers articles",
    latestIntro:
      "Coulisses d'atelier, retours de studios, et ce qu'on apprend en fabriquant des objets.",
    seeAll: "Tous les articles →",
    readMore: "Lire l'article",
    tocTitle: "Sommaire",
    sourcesTitle: "Sources et liens utiles",
    relatedTitle: "À lire ensuite",
  },

  faq: {
    title: "Questions fréquentes",
    items: [
      {
        title: "Qu'est-ce que je reçois exactement ?",
        body: "Une vraie édition physique : le jeu sur disque, dans un boîtier, avec sa jaquette et son livret. Selon l'édition choisie, s'y ajoutent des contenus imprimés ou des goodies. Le détail figure sur chaque fiche produit.",
      },
      {
        title: "Le jeu fonctionne-t-il sans connexion ?",
        body: "C'est tout l'intérêt. Le disque contient le jeu, installable et jouable sans compte ni téléchargement. Aucune plateforme ne peut vous le retirer.",
      },
      {
        title: "Et si mon ordinateur n'a pas de lecteur ?",
        body: "C'est le cas de la plupart des portables récents. Nous proposons un lecteur CD/DVD externe USB dans la boutique : il se branche sans installation et sert pour toute votre collection.",
      },
      {
        title: "Quand la boutique ouvre-t-elle ?",
        body: "Nous préparons les premières éditions avec les studios partenaires. Laissez votre adresse dans le bloc « ouverture » de l'accueil : vous serez prévenu le jour même, et rien d'autre ne vous sera envoyé.",
      },
      {
        title: "Vers quels pays expédiez-vous ?",
        body: "Nous démarrons depuis la France, avec l'Union européenne comme premier périmètre. Le reste du monde suivra une fois la logistique rodée.",
      },
      {
        title: "Les tirages sont-ils limités ?",
        body: "Chaque édition est fabriquée à la demande, donc sans surstock ni destruction d'invendus. Certaines éditions spéciales sont limitées dans le temps ou en quantité — c'est indiqué sur la fiche quand c'est le cas.",
      },
      {
        title: "Puis-je revendre ou offrir mon exemplaire ?",
        body: "Oui. C'est un objet qui vous appartient : vous pouvez le prêter, l'offrir, le revendre. Contrairement à une licence numérique, il ne dépend d'aucun compte.",
      },
      {
        title: "Je développe un jeu, comment vous le proposer ?",
        body: "Par la page « proposer mon jeu ». Nous étudions chaque proposition et répondons à tout le monde, sous quelques jours.",
      },
    ],
  },

  notFound: {
    code: "404",
    title: "Cette page n'existe pas.",
    body: "Le lien est peut-être ancien, ou l'adresse comporte une erreur. Voici par où reprendre.",
    home: "Retour à l'accueil",
  },

  footer: {
    tagline:
      "Éditions physiques pour jeux indépendants. Fabriquées en Europe, à la demande.",
    navTitle: "Navigation",
    socialTitle: "Nous suivre",
    legalTitle: "Informations",
    social: [
      { label: "Discord", href: "#" },
      { label: "Bluesky", href: "#" },
      { label: "itch.io", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
    signature: "Conçu pour les jeux indés. Fait pour être gardé.",
    rights: "Tous droits réservés.",
  },
};
