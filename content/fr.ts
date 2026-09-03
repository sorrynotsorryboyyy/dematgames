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
    title: "dematgames.com — Votre jeu mérite une boîte",
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
    ogAlt: "dematgames.com — Votre jeu mérite une boîte",
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
    kindHardware: "Matériel",
    kindBundle: "Pack",
    productsTitle: "Accessoires et packs",
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
      "Ce parcours est une démonstration : aucun paiement n'est possible et aucune commande ne sera enregistrée. Nous sélectionnons en ce moment les premiers studios partenaires — si vous développez un jeu, c'est le moment de nous écrire.",
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
        title: "Combien ça me coûte ?",
        body: "Rien à l'avance. Nous finançons le pressage, l'impression et le stock ; vous touchez un pourcentage sur chaque exemplaire vendu. Le détail se fixe ensemble, selon le format et le volume — nous préférons en discuter plutôt que d'afficher une grille qui ne collerait à personne.",
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
