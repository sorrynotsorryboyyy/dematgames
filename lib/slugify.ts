/**
 * Transforme un titre en identifiant d'ancre lisible.
 *
 * Extrait de components/legal/LegalPage.tsx, où il servait déjà : les titres
 * d'articles de blog ont exactement le même besoin. Une seule
 * implémentation, sinon deux pages produiraient des ancres différentes pour
 * le même texte.
 *
 * Les accents sont retirés avant filtrage : sans `normalize("NFD")`,
 * « Propriété intellectuelle » donnerait « propri-t- ».
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
