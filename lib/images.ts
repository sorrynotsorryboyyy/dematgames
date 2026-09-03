/**
 * URLs d'images Cloudinary — utilisable côté client comme serveur.
 *
 * Aucun secret ici : seul le cloud name intervient, et il est public par
 * conception (il apparaît dans chaque URL d'image). La signature des uploads
 * vit dans lib/cloudinary.ts, strictement serveur.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const hasCloudinary = Boolean(CLOUD);

export interface ImageOptions {
  /** Largeur cible en pixels. Cloudinary redimensionne à la volée. */
  width?: number;
  height?: number;
  /** `fill` recadre, `fit` conserve le ratio sans rogner. */
  crop?: "fill" | "fit";
}

/**
 * Construit l'URL d'une image à partir de son identifiant Cloudinary.
 *
 * `f_auto,q_auto` laisse Cloudinary choisir le format (AVIF/WebP selon le
 * navigateur) et le niveau de compression : c'est l'essentiel du gain de
 * poids, sans avoir à générer les variantes nous-mêmes.
 *
 * Retourne `null` si Cloudinary n'est pas configuré ou si l'identifiant est
 * vide — l'appelant affiche alors son visuel de repli (par exemple la
 * jaquette CSS de GameBox).
 */
export function imageUrl(
  publicId: string | null | undefined,
  options: ImageOptions = {},
): string | null {
  if (!CLOUD || !publicId) return null;

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${Math.round(options.width)}`);
  if (options.height) transforms.push(`h_${Math.round(options.height)}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  // dpr_auto sert les écrans à haute densité sans doubler le poids partout.
  transforms.push("dpr_auto");

  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms.join(",")}/${publicId}`;
}
