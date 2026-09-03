import type { Lang } from "./types";

/**
 * Catégories de jeux.
 *
 * dematgames.com doit accueillir aussi bien un FPS nerveux qu'un jeu pour
 * enfants. L'interface reste neutre ; c'est la catégorie qui apporte la
 * couleur, jamais le site lui-même.
 *
 * ACCESSIBILITÉ — la couleur ne porte jamais seule l'information : chaque
 * puce affiche systématiquement son libellé. Un daltonien doit pouvoir
 * filtrer aussi bien qu'un autre.
 *
 * Toutes les couleurs sont vérifiées AA dans leurs deux usages :
 * blanc sur fond plein, et couleur en texte sur le fond clair du site.
 */
export const CATEGORIES = [
  { id: "action", color: "#c2410c", label: { fr: "Action / FPS", en: "Action / FPS" } },
  { id: "adventure", color: "#4338ca", label: { fr: "Aventure", en: "Adventure" } },
  { id: "family", color: "#15803d", label: { fr: "Enfants & famille", en: "Kids & family" } },
  { id: "chill", color: "#0f766e", label: { fr: "Chill & cosy", en: "Chill & cosy" } },
  { id: "puzzle", color: "#6d28d9", label: { fr: "Réflexion", en: "Puzzle" } },
  { id: "story", color: "#be185d", label: { fr: "Narratif", en: "Narrative" } },
  { id: "retro", color: "#b45309", label: { fr: "Rétro / Arcade", en: "Retro / Arcade" } },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function categoryLabel(id: CategoryId, lang: Lang): string {
  return getCategory(id).label[lang];
}
