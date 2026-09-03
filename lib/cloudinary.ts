import "server-only";

import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary — configuration SERVEUR uniquement.
 *
 * `import "server-only"` fait échouer la compilation si ce module est importé
 * depuis un composant client. C'est volontaire : CLOUDINARY_API_SECRET donne
 * un accès en écriture complet au compte, et une seule importation distraite
 * dans un fichier "use client" suffirait à le publier dans le bundle envoyé
 * au navigateur.
 *
 * Pour AFFICHER une image, aucun secret n'est nécessaire : voir `imageUrl()`
 * dans lib/images.ts, qui ne manipule que le cloud name (public).
 */

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

/**
 * Signature d'un upload direct depuis le navigateur.
 *
 * Le principe : le client n'a jamais le secret. Il demande une signature au
 * serveur pour un jeu de paramètres donné, puis envoie le fichier directement
 * à Cloudinary avec cette signature. Le fichier ne transite donc pas par notre
 * serveur, et le secret ne quitte jamais le serveur.
 *
 * `folder` est imposé côté serveur (jamais transmis par le client), sinon un
 * utilisateur pourrait écrire n'importe où dans le compte.
 */
export function signUpload(params: Record<string, string | number>) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary n'est pas configuré.");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { ...params, timestamp };

  return {
    timestamp,
    signature: cloudinary.utils.api_sign_request(toSign, apiSecret as string),
    apiKey: apiKey as string,
    cloudName: cloudName as string,
  };
}
