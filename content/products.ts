import type { Lang } from "./types";

/**
 * Produits qui ne sont pas des jeux : matériel et packs.
 *
 * `content/games.ts` décrit des jeux avec leurs éditions ; un lecteur CD et
 * un pack sont d'une autre nature (pas de studio, pas d'éditions, pas de
 * jaquette). D'où un type distinct plutôt qu'un champ optionnel de plus sur
 * `Game`, qui rendrait ce type confus pour tous ses usages.
 *
 * Les prix suivent la même règle que les jeux : indicatifs tant que
 * `PRICING_IS_INDICATIVE` vaut `true` dans games.ts.
 */

export const PRODUCT_KINDS = ["hardware", "bundle"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export interface Product {
  slug: string;
  kind: ProductKind;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Prix indicatif en euros. */
  priceEUR: number;
  includes: Record<Lang, string[]>;
  /** Identifiant Cloudinary de la photo produit. */
  imageId?: string;
  /**
   * Le pack laisse choisir un jeu du catalogue.
   *
   * `true` pour DematKiller : l'acheteur sélectionne son jeu sur la fiche.
   */
  picksGame?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "lecteur-externe",
    kind: "hardware",
    name: {
      fr: "Lecteur CD/DVD externe",
      en: "External CD/DVD drive",
    },
    tagline: {
      fr: "Parce que votre portable n'en a plus.",
      en: "Because your laptop doesn't have one any more.",
    },
    description: {
      fr: "Un lecteur USB compact, alimenté par le port lui-même : rien à brancher au secteur. Il lit et grave CD comme DVD, et fonctionne sur Windows, macOS et Linux sans pilote à installer. C'est l'accessoire qui rend une édition physique utilisable sur une machine récente.",
      en: "A compact USB drive, powered by the port itself: nothing to plug into the mains. It reads and burns both CDs and DVDs, and works on Windows, macOS and Linux with no driver to install. This is the accessory that makes a physical edition usable on a modern machine.",
    },
    priceEUR: 34,
    includes: {
      fr: [
        "Lecteur-graveur CD/DVD",
        "Câble USB-A intégré",
        "Adaptateur USB-C fourni",
        "Compatible Windows, macOS, Linux",
      ],
      en: [
        "CD/DVD reader and burner",
        "Built-in USB-A cable",
        "USB-C adapter included",
        "Works with Windows, macOS, Linux",
      ],
    },
  },
  {
    slug: "dematkiller",
    kind: "bundle",
    picksGame: true,
    name: {
      fr: "Pack DematKiller",
      en: "DematKiller bundle",
    },
    tagline: {
      fr: "De quoi commencer une collection.",
      en: "Everything you need to start a collection.",
    },
    description: {
      fr: "Le pack qui règle la question du lecteur en même temps que celle du jeu. Vous choisissez un titre du catalogue en édition Standard, il arrive avec le lecteur externe et un goodie du studio. Et une remise de 10 % sur votre commande suivante, pour la suite de l'étagère.",
      en: "The bundle that solves the drive problem at the same time as the game problem. You pick a title from the catalogue in its Standard edition; it arrives with the external drive and a goodie from the studio. Plus 10% off your next order, for the rest of the shelf.",
    },
    priceEUR: 59,
    includes: {
      fr: [
        "1 jeu au choix — édition Standard",
        "Lecteur CD/DVD externe",
        "Un goodie du studio",
        "10 % sur la commande suivante",
      ],
      en: [
        "1 game of your choice — Standard edition",
        "External CD/DVD drive",
        "A goodie from the studio",
        "10% off your next order",
      ],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
