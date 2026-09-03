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
    title: "dematgames.gg — Votre jeu mérite une boîte",
    description:
      "Transformez votre jeu indépendant en édition physique : boîtier, jaquette, livret, goodies. Fabrication à la demande dès 50 exemplaires, sans stock ni logistique à gérer.",
    keywords: [
      "édition physique jeu vidéo",
      "jeu indé physique",
      "boîtier jeu PC",
      "fabrication à la demande",
      "développeur indépendant",
      "édition collector indie",
      "dematgames",
    ],
    ogAlt: "dematgames.gg — Votre jeu mérite une boîte",
  },

  nav: {
    shop: "Boutique",
    account: "Mon compte",
    cart: "Panier",
    login: "Connexion",
    logout: "Se déconnecter",
    howItWorks: "Comment ça marche",
    faq: "Questions",
    contact: "Contact",
    cta: "Proposer mon jeu",
    skipToContent: "Aller au contenu principal",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
    switchTo: "Switch to English",
  },

  hero: {
    // Remontée depuis l'ancienne section manifesto : la promesse arrive
    // désormais dès le premier écran, au-dessus du badge.
    tagline: ["Oubliez le téléchargement.", "Gardez le jeu."],
    badge: "Éditions physiques pour jeux indépendants",
    // Plus de capitales : le composant ne force plus l'uppercase, et une
    // phrase en casse normale porte mieux le ton « startup » voulu.
    titleLines: ["Votre jeu", "mérite", "une boîte."],
    subtitle:
      "Offrez à votre jeu une vraie édition physique : boîtier, jaquette, livret. Vous gardez la main sur la direction artistique, nous prenons en charge la fabrication et l'expédition.",
    ctaPrimary: "Voir la boutique",
    ctaSecondary: "Proposer mon jeu",
    reassurance: [
      "Dès 50 exemplaires",
      "Aucun stock à avancer",
      "Expédition prise en charge",
    ],
    scrollHint: "Découvrir",
  },

  problem: {
    titleLines: ["Les jeux indés sont partout.", "Sauf sur nos étagères."],
    body: "Une équipe de trois personnes peut aujourd'hui toucher des dizaines de milliers de joueurs. Mais dès qu'il s'agit d'une édition physique, elle se heurte aux mêmes murs : des minimums de production calibrés pour de gros éditeurs, une trésorerie à immobiliser, et un métier logistique qu'elle n'a jamais choisi d'exercer.",
    cards: [
      {
        title: "Des minimums démesurés",
        body: "Les presses traditionnelles démarrent à plusieurs centaines d'exemplaires. C'est plusieurs milliers d'euros avancés avant la première vente.",
      },
      {
        title: "Un second métier",
        body: "Stocker des cartons, imprimer des bordereaux, gérer les retours : autant d'heures qui ne vont pas dans votre jeu.",
      },
      {
        title: "Le mauvais calcul",
        body: "Votre communauté est fidèle sans être immense. Sur ce volume, une édition physique classique n'est jamais rentable.",
      },
    ],
    transition: "dematgames.gg lève ces trois obstacles.",
  },

  how: {
    title: "Du fichier à la boîte.",
    intro:
      "Quatre étapes entre votre exécutable et une boîte posée sur l'étagère d'un joueur.",
    steps: [
      {
        n: "01",
        title: "Envoyez votre jeu",
        body: "Vous nous transmettez le build final. Nous vérifions qu'il tourne et qu'il tient sur le support.",
      },
      {
        n: "02",
        title: "Composez l'édition",
        body: "Jaquette, livret, disque, goodies : vous choisissez le format et fournissez vos visuels.",
      },
      {
        n: "03",
        title: "Nous fabriquons",
        body: "Chaque exemplaire est produit à la commande. Aucun stock dormant, aucune avance de votre part.",
      },
      {
        n: "04",
        title: "Le joueur reçoit",
        body: "Nous emballons et expédions. Votre joueur déballe un objet, pas un code de téléchargement.",
      },
    ],
    pipeline: {
      labels: ["Votre build", "Disque pressé", "Colis expédié", "Entre ses mains"],
      caption: "Le fichier devient un objet.",
    },
  },

  whyNow: {
    eyebrow: "Pourquoi maintenant ?",
    lineDigital: "Le numérique est pratique.",
    linePhysical: "Le physique se transmet.",
    quote:
      "Un téléchargement se perd dans une bibliothèque de six cents titres. Une boîte reste sur une étagère, à hauteur de regard.",
    body: "Le vinyle et le livre papier n'ont pas disparu face au streaming : ils sont devenus des objets qu'on choisit d'acheter. Nous pensons que les jeux indépendants méritent le même statut — une expérience numérique, et un objet qu'on offre, qu'on prête et qu'on garde.",
    shelfCaption: "Une étagère de jeux indépendants en édition physique.",
  },

  founding: {
    eyebrow: "Studios fondateurs",
    title: "Nous cherchons les 20 premiers jeux.",
    body: "dematgames.gg démarre. Nous ouvrons vingt places à des studios indépendants qui veulent construire ce service avec nous : formats, tarifs, calendrier. Vos retours façonneront ce que devient la plateforme.",
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
      submit: "Proposer mon jeu",
      submitting: "Envoi en cours…",
      required: "obligatoire",
      optional: "optionnel",
      successTitle: "Bien reçu.",
      successBody:
        "Merci — nous revenons vers vous sous quelques jours pour parler de votre jeu et de l'édition qui lui irait.",
      errorTitle: "L'envoi a échoué.",
      errorBody:
        "Le problème vient de chez nous. Réessayez dans un instant, ou écrivez-nous directement à hello@dematgames.gg.",
      retry: "Réessayer",
      honeypotLabel: "Laissez ce champ vide",
    },
  },

  shop: {
    title: "La boutique",
    intro:
      "Les éditions physiques de nos studios partenaires. Chaque exemplaire est fabriqué à la commande et expédié depuis la France.",
    pricingNotice:
      "Aperçu : la boutique n'est pas encore ouverte et les prix affichés sont indicatifs.",
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
      "Ce parcours est une démonstration : aucun paiement n'est possible et aucune commande ne sera enregistrée. Nous cherchons les vingt premiers jeux à produire — si vous en développez un, c'est le moment de nous écrire.",
    closedCta: "Proposer mon jeu",
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
    noOrders:
      "Aucune commande pour l'instant. La boutique ouvrira avec les premiers jeux produits.",
    noGames:
      "Vous n'avez pas encore de jeu chez nous. Vingt places sont ouvertes aux studios fondateurs.",
    noGamesCta: "Proposer mon jeu",
    auth: {
      loginTitle: "Connexion",
      intro:
        "Un seul bouton, pas de mot de passe à retenir. Votre première connexion crée votre compte.",
      google: "Continuer avec Google",
      privacy:
        "Nous récupérons votre nom, votre email et votre photo de profil Google. Rien d'autre, et jamais votre mot de passe.",
      unavailable:
        "La connexion est momentanément indisponible. Réessayez dans quelques minutes, ou écrivez-nous à hello@dematgames.gg.",
      errorNetwork:
        "Connexion au réseau impossible. Vérifiez votre connexion et réessayez.",
      errorUnknown:
        "La connexion a échoué. Réessayez, ou écrivez-nous à hello@dematgames.gg.",
    },
  },

  faq: {
    title: "Questions fréquentes",
    items: [
      {
        title: "Combien d'exemplaires dois-je commander au minimum ?",
        body: "Cinquante. C'est le seuil à partir duquel un pressage a du sens ; les usines traditionnelles en demandent souvent cinq cents. Au-delà de ce premier tirage, la fabrication se fait à la commande : vous ne stockez rien.",
      },
      {
        title: "Qui gère la fabrication et l'expédition ?",
        body: "Nous, de bout en bout. Pressage, impression, emballage, envoi au joueur et suivi du colis. Vous n'avez ni carton à manipuler ni bordereau à imprimer.",
      },
      {
        title: "Combien ça coûte ?",
        body: "Nous ne le fixons pas seuls : la grille se construit avec les premiers studios partenaires, en fonction des formats et des volumes réels. C'est l'une des raisons pour lesquelles nous cherchons vingt jeux avant d'ouvrir.",
      },
      {
        title: "Vers quels pays expédiez-vous ?",
        body: "Nous démarrons depuis la France, avec l'Union européenne comme premier périmètre. Le reste du monde suivra une fois la logistique rodée.",
      },
      {
        title: "Mon jeu doit-il être déjà sorti ?",
        body: "Non. Sorti, en accès anticipé ou à quelques mois de sa sortie : les trois cas nous intéressent. Une édition physique se prépare souvent en amont du lancement.",
      },
      {
        title: "Est-ce que je garde le contrôle du visuel ?",
        body: "Entièrement. Jaquette, livret, sérigraphie du disque, goodies : vous fournissez la direction artistique, nous fabriquons. Aucun logo ni bandeau ne s'ajoute à votre packaging sans votre accord.",
      },
      {
        title: "Et les droits sur mon jeu ?",
        body: "Ils restent les vôtres, sans exclusivité. Vous continuez à vendre en numérique où vous voulez, y compris pendant la production physique.",
      },
    ],
  },

  footer: {
    tagline:
      "Éditions physiques pour jeux indépendants. Fabriquées en Europe, à la demande.",
    navTitle: "Navigation",
    socialTitle: "Nous suivre",
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
