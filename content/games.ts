import type { CategoryId } from "./categories";
import type { Lang } from "./types";

/**
 * Catalogue — uniquement des titres RÉELS.
 *
 * Le fichier a longtemps contenu cinq jeux inventés, qui remplissaient la
 * grille et l'étagère de l'accueil avant qu'un vrai titre existe. Ils ont
 * été retirés : afficher des produits que dematgames.com ne distribue pas
 * trompait le visiteur, et le décor concurrençait les éditions réelles.
 *
 * N'ajouter ici qu'un jeu réellement édité ou distribué. Pour une maquette,
 * préférer un composant dédié, jamais une entrée de ce tableau.
 *
 * Les teintes (`hue`) alimentent la jaquette générée par GameBox : elles
 * servent de repli quand aucune image n'est disponible.
 */

/**
 * Tarifs donnés comme ORDRES DE GRANDEUR, et non comme une grille arrêtée.
 *
 * Ne s'applique plus à aucun JEU : les deux titres du catalogue portent
 * `firmPrice`, leurs prix étant fixés. Le drapeau reste actif pour les
 * accessoires et packs de `content/products.ts`, dont les tarifs ne le sont
 * pas encore.
 *
 * Passer à `false` le jour où tout est arrêté : la mention disparaît
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
   * Le jeu est-il commandable ?
   *
   * Absent vaut `upcoming` : le défaut sûr est « pas encore en vente »,
   * jamais l'inverse — un oubli ne doit pas laisser croire qu'un titre est
   * disponible. Tant que la boutique n'encaisse pas, tout l'est.
   *
   * Permettra de lever le statut titre par titre à l'ouverture, sans
   * toucher au code.
   */
  releaseStatus?: "upcoming" | "available";

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
