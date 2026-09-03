import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Détection des fichiers de marque déposés dans public/brand/.
 *
 * `import "server-only"` empêche ce module d'être tiré dans un bundle
 * client : `node:fs` n'existe pas dans un navigateur, et une importation
 * distraite depuis un composant "use client" ferait échouer le build.
 *
 * La détection a lieu au BUILD (composant serveur). Un fichier ajouté est
 * donc pris en compte au prochain build — comportement documenté dans
 * public/brand/README.md.
 */

const BRAND_DIR = join(process.cwd(), "public", "brand");

export interface BrandAssets {
  full: boolean;
  mark: boolean;
}

export function brandAssets(): BrandAssets {
  try {
    return {
      full: existsSync(join(BRAND_DIR, "logo-full.png")),
      mark: existsSync(join(BRAND_DIR, "logo-mark.png")),
    };
  } catch {
    // Système de fichiers inaccessible : on retombe sur le logo texte.
    return { full: false, mark: false };
  }
}
