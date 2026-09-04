import type { CategoryId } from "./categories";
import type { Lang } from "./types";

/**
 * Catalogue de démonstration.
 *
 * Les cinq jeux sont FICTIFS — ce sont ceux déjà inventés pour l'étagère de
 * la landing (components/box/BoxShelf.tsx). Utiliser de vrais titres indés
 * reviendrait à afficher des produits que dematgames.com ne distribue pas,
 * et à usurper l'identité de studios réels.
 *
 * Les teintes (`hue`) alimentent la jaquette générée par GameBox : chaque
 * jeu a sa couleur de boîtier sans qu'aucune image ne soit nécessaire.
 */

/**
 * Les tarifs affichés sont des ORDRES DE GRANDEUR, pas une grille arrêtée.
 * La landing annonce en plusieurs endroits que les prix se construisent avec
 * les premiers développeurs partenaires : la boutique doit le refléter, sans
 * quoi les deux discours se contredisent.
 *
 * Passer à `false` le jour où la grille est fixée : la mention disparaît
 * partout d'un coup.
 */
export const PRICING_IS_INDICATIVE = true;

export type EditionTier = "standard" | "deluxe" | "collector";

export interface GameEdition {
  tier: EditionTier;
  /** Prix indicatif en euros — voir PRICING_IS_INDICATIVE. */
  priceEUR: number;
  includes: Record<Lang, string[]>;
  /** Tirage limité, pour les éditions collector. */
  limited?: number;
}

export interface Game {
  slug: string;
  title: string;
  studio: string;
  /** Teinte de jaquette (0-360), reprise par GameBox. */
  hue: number;
  /**
   * Identifiant Cloudinary de la jaquette (ex. "dematgames/covers/nocturne").
   *
   * Optionnel : sans lui, GameBox affiche sa jaquette générée en CSS. C'est
   * ce qui permet au catalogue de fonctionner avant d'avoir les visuels
   * réels des studios.
   */
  coverId?: string;
  category: CategoryId;
  year: number;
  tagline: Record<Lang, string>;
  description: Record<Lang, string>;
  editions: GameEdition[];

  /**
   * Sous-titre, rendu sous le titre.
   *
   * Séparé de `title` à dessein : ce dernier alimente aussi la jaquette
   * générée et les lignes du panier, où « LoopTape | Elevator » serait trop
   * long et se couperait mal.
   */
  subtitle?: Record<Lang, string>;

  /**
   * Le visuel est-il une PHOTO PRODUIT déjà finie, plutôt qu'une jaquette
   * à plat ?
   *
   * LoopTape est fourni comme un rendu 3D du boîtier, disque compris.
   * L'insérer dans `GameBox` donnerait une boîte dans une boîte : on
   * l'affiche donc tel quel, sans boîtier autour.
   *
   * À retirer le jour où une jaquette à plat (ratio 135:190, sans boîtier
   * ni fond) est disponible : le jeu retrouvera alors le boîtier 3D animé
   * des autres, sans rien changer au code.
   */
  productShot?: boolean;

  /**
   * Prix ferme, échappant à la mention « tarifs indicatifs ».
   *
   * `PRICING_IS_INDICATIVE` couvre le catalogue de démonstration, dont les
   * prix sont des ordres de grandeur. Un titre réel dont le prix est arrêté
   * ne doit pas hériter de cette réserve.
   */
  firmPrice?: boolean;

  /**
   * Titre édité par DematGames, par opposition aux exemples de format.
   *
   * Distinct de `featured` : plusieurs jeux peuvent être nos éditions, un
   * seul occupe la vitrine de l'accueil.
   */
  ownEdition?: boolean;

  /** Titre mis en avant sur l'accueil. Un seul à la fois. */
  featured?: boolean;

  /**
   * Tranche d'âge conseillée, telle qu'imprimée sur la jaquette.
   *
   * C'est le critère d'achat d'un parent : il doit être lisible dès la
   * carte de catalogue, sans avoir à ouvrir la fiche ni à scruter le visuel.
   *
   * Chaîne libre et bilingue plutôt qu'un intervalle numérique : les
   * classifications varient (« 3-6 ans », « PEGI 3 », « 7+ ») et une
   * structure rigide obligerait à la refondre au premier cas particulier.
   */
  ageRating?: Record<Lang, string>;
}

export const GAMES: Game[] = [
  /**
   * LoopTape | Elevator — PREMIER TITRE RÉEL du catalogue.
   *
   * Les autres entrées de ce fichier sont fictives (voir l'avertissement en
   * tête). Celle-ci ne l'est pas : le jeu, le studio, les prix et le tirage
   * sont réels et fournis par l'éditeur.
   *
   * La description reste un marqueur visible tant qu'elle n'a pas été
   * écrite : inventer le pitch du jeu de quelqu'un d'autre serait pire
   * qu'un champ manifestement vide.
   */
  {
    slug: "looptape-elevator",
    title: "LoopTape",
    subtitle: { fr: "Elevator", en: "Elevator" },
    studio: "DematGames",
    // Le rouge de la jaquette : sert au repli CSS si Cloudinary est absent.
    hue: 356,
    coverId: "dematgames/covers/looptape-elevator",
    productShot: true,
    firmPrice: true,
    ownEdition: true,
    featured: true,
    category: "story",
    year: 2026,
    tagline: {
      fr: "Found footage. 3 h 17 du matin. L'ascenseur ne s'arrête plus.",
      en: "Found footage. 3:17 in the morning. The elevator won't stop.",
    },
    description: {
      fr: "[À COMPLÉTER : description du jeu]",
      en: "[TO COMPLETE: game description]",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 16.99,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée"],
          en: ["Game DVD", "Standard case", "Printed cover"],
        },
      },
      {
        tier: "collector",
        priceEUR: 49,
        limited: 50,
        includes: {
          fr: [
            "DVD du jeu",
            "Boîtier collector",
            "Jaquette imprimée",
            "Édition numérotée sur 50",
          ],
          en: [
            "Game DVD",
            "Collector case",
            "Printed cover",
            "Numbered edition out of 50",
          ],
        },
      },
    ],
  },
  /**
   * LudiLand | Noël — deuxième titre RÉEL du catalogue.
   *
   * Comme LoopTape, le visuel fourni est un rendu du boîtier fini : d'où
   * `productShot`. La description reprend uniquement ce que la jaquette
   * affiche (3-6 ans, plusieurs niveaux, activités ludiques, thème de Noël) ;
   * aucune mécanique de jeu n'est inventée.
   */
  {
    slug: "ludiland-noel",
    title: "LudiLand",
    subtitle: { fr: "Noël", en: "Christmas" },
    studio: "DematGames",
    // Le bleu nuit de la jaquette : sert au repli CSS sans Cloudinary.
    hue: 214,
    coverId: "dematgames/covers/ludiland-noel",
    productShot: true,
    firmPrice: true,
    ownEdition: true,
    category: "family",
    year: 2026,
    ageRating: { fr: "3-6 ans", en: "Ages 3-6" },
    tagline: {
      fr: "Un Noël à explorer, à toucher, à recommencer autant qu'on veut.",
      en: "A Christmas to explore, to touch, to start over as often as you like.",
    },
    description: {
      fr: "LudiLand emmène les 3-6 ans dans un village enneigé où chaque cadeau ouvre une activité. Plusieurs niveaux de difficulté accompagnent l'enfant à son rythme, et les jeux mêlent découverte et apprentissage — on avance parce qu'on s'amuse, pas parce qu'on est chronométré. Aucun compte, aucune connexion : le disque suffit.",
      en: "LudiLand takes 3-to-6-year-olds into a snowy village where every present opens an activity. Several difficulty levels follow the child at their own pace, and the games blend discovery with learning — you progress because it is fun, not because a timer says so. No account, no connection: the disc is all you need.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 16.99,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée"],
          en: ["Game DVD", "Standard case", "Printed cover"],
        },
      },
      {
        tier: "collector",
        priceEUR: 49,
        limited: 50,
        includes: {
          fr: [
            "DVD du jeu",
            "Boîtier collector",
            "Jaquette imprimée",
            "Édition numérotée sur 50",
          ],
          en: [
            "Game DVD",
            "Collector case",
            "Printed cover",
            "Numbered edition out of 50",
          ],
        },
      },
    ],
  },
  {
    slug: "nocturne",
    title: "Nocturne",
    studio: "Pale Moth",
    hue: 8,
    category: "action",
    year: 2024,
    tagline: {
      fr: "Une enquête de nuit dans une ville qui ne dort jamais.",
      en: "A night-shift investigation in a city that never sleeps.",
    },
    description: {
      fr: "Vous suivez une inspectrice de nuit dans une métropole détrempée. Infiltration, filatures, et une bande-son qui ne relâche jamais la pression. Huit heures de campagne solo, calibrées pour tenir d'une seule traite.",
      en: "You follow a night-shift detective through a rain-soaked metropolis. Stealth, tailing, and a score that never lets the pressure drop. Eight hours of solo campaign, built to hold in a single sitting.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 29,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée"],
          en: ["Game DVD", "Standard case", "Printed cover"],
        },
      },
      {
        tier: "deluxe",
        priceEUR: 44,
        includes: {
          fr: ["DVD du jeu", "Boîtier premium", "Livret 24 pages", "Planche de stickers"],
          en: ["Game DVD", "Premium case", "24-page booklet", "Sticker sheet"],
        },
      },
      {
        tier: "collector",
        priceEUR: 79,
        limited: 200,
        includes: {
          fr: ["Édition numérotée", "Boîtier rigide", "Artbook", "Bande-son sur CD", "Poster"],
          en: ["Numbered edition", "Rigid case", "Artbook", "Soundtrack CD", "Poster"],
        },
      },
    ],
  },
  {
    slug: "driftwood",
    title: "Driftwood",
    studio: "Two Hands",
    hue: 196,
    category: "chill",
    year: 2023,
    tagline: {
      fr: "Relevez un phare, une planche à la fois.",
      en: "Rebuild a lighthouse, one plank at a time.",
    },
    description: {
      fr: "Ni échec, ni chronomètre, ni score. On ramasse le bois que la mer rejette, on répare, on écoute le vent tourner. Driftwood se joue vingt minutes avant de dormir ou six heures un dimanche — le jeu ne vous en tiendra pas rigueur.",
      en: "No failure state, no timer, no score. You gather what the sea throws back, repair, and listen to the wind turn. Driftwood works for twenty minutes before bed or six hours on a Sunday — it won't hold either against you.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 26,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée"],
          en: ["Game DVD", "Standard case", "Printed cover"],
        },
      },
      {
        tier: "deluxe",
        priceEUR: 39,
        includes: {
          fr: ["DVD du jeu", "Boîtier premium", "Carnet de croquis", "Marque-page en bois"],
          en: ["Game DVD", "Premium case", "Sketch journal", "Wooden bookmark"],
        },
      },
    ],
  },
  {
    slug: "ashfall",
    title: "Ashfall",
    studio: "Ember Lab",
    hue: 24,
    category: "adventure",
    year: 2024,
    tagline: {
      fr: "Traversez une vallée que la cendre recouvre peu à peu.",
      en: "Cross a valley the ash is slowly burying.",
    },
    description: {
      fr: "Le paysage se transforme à chaque chapitre, et ne redevient jamais ce qu'il était. Aucun combat : il n'y a que la marche, les gens croisés en route, et les choix qui décident de qui arrive au bout.",
      en: "The landscape shifts with every chapter and never returns to what it was. No combat: only the walk, the people you meet along the way, and the choices that decide who makes it out.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 32,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée", "Carte de la vallée"],
          en: ["Game DVD", "Standard case", "Printed cover", "Valley map"],
        },
      },
      {
        tier: "collector",
        priceEUR: 89,
        limited: 150,
        includes: {
          fr: ["Édition numérotée", "Coffret toilé", "Artbook relié", "Carte en tissu", "Pin's émaillé"],
          en: ["Numbered edition", "Cloth slipcase", "Bound artbook", "Fabric map", "Enamel pin"],
        },
      },
    ],
  },
  {
    slug: "signal",
    title: "Signal",
    studio: "Null Div",
    hue: 152,
    category: "puzzle",
    year: 2025,
    tagline: {
      fr: "Une énigme radiophonique, à décoder station par station.",
      en: "A radio mystery, decoded station by station.",
    },
    description: {
      fr: "Vous héritez d'un poste et d'un carnet de fréquences griffonné. Chaque émission dissimule une énigme, chaque énigme ouvre une nouvelle bande. Aucun système d'indices : le jeu part du principe que vous prenez des notes.",
      en: "You inherit a radio set and a scrawled notebook of frequencies. Every broadcast hides a puzzle, every puzzle opens a new band. There is no hint system: the game assumes you are taking notes.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 24,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Carnet de fréquences"],
          en: ["Game DVD", "Standard case", "Frequency notebook"],
        },
      },
      {
        tier: "deluxe",
        priceEUR: 42,
        includes: {
          fr: ["DVD du jeu", "Boîtier premium", "Carnet d'enquête", "Feuillets d'indices scellés"],
          en: ["Game DVD", "Premium case", "Case notebook", "Sealed clue inserts"],
        },
      },
    ],
  },
  {
    slug: "vela",
    title: "Vela",
    studio: "Kite Works",
    hue: 268,
    category: "family",
    year: 2023,
    tagline: {
      fr: "Un cerf-volant, un été, toute une côte à explorer.",
      en: "One kite, one summer, a whole coastline to explore.",
    },
    description: {
      fr: "À deux sur le même écran, ou seul. On apprend à lire le vent, on rend service aux habitants d'un village de bord de mer, et on ne perd jamais — il n'y a rien à rater. Pensé pour tenir aussi bien à côté d'un enfant de six ans que tout seul un soir.",
      en: "Local co-op on one screen, or solo. You learn to read the wind, help the people of a seaside village, and never lose — there is nothing to fail. Built to work sitting next to a six-year-old or alone on a quiet evening.",
    },
    editions: [
      {
        tier: "standard",
        priceEUR: 27,
        includes: {
          fr: ["DVD du jeu", "Boîtier standard", "Jaquette imprimée", "Planche d'autocollants"],
          en: ["Game DVD", "Standard case", "Printed cover", "Sticker sheet"],
        },
      },
      {
        tier: "deluxe",
        priceEUR: 45,
        includes: {
          fr: ["DVD du jeu", "Boîtier premium", "Livre illustré", "Cerf-volant en papier à monter"],
          en: ["Game DVD", "Premium case", "Picture book", "Fold-your-own paper kite"],
        },
      },
    ],
  },
];

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Prix le plus bas d'un jeu — affiché sur la carte catalogue (« à partir de »). */
export function lowestPrice(game: Game): number {
  return Math.min(...game.editions.map((e) => e.priceEUR));
}

/** Formatage monétaire localisé. */
/**
 * Formate un prix en euros.
 *
 * Les centimes ne sont affichés QUE s'il y en a : « 49 € » reste plus lisible
 * que « 49,00 € » dans une grille, mais 16,99 doit s'écrire « 16,99 € ».
 *
 * Sans `maximumFractionDigits`, Intl arrondit à l'entier par défaut ici et
 * 16,99 s'affichait « 17 € » — un prix faux, à la hausse, sur une boutique.
 */
export function formatPrice(amount: number, lang: Lang): string {
  const hasCents = !Number.isInteger(amount);
  return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}
