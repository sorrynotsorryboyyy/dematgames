import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * `firebase-admin` est laissé EXTERNE au bundle serveur.
   *
   * Ce paquet charge ses dépendances dynamiquement et lit des fichiers à
   * l'exécution ; le laisser résoudre par Node évite que le bundler ne
   * réécrive ces chemins.
   *
   * À noter : ce réglage seul NE corrigeait PAS le 500 de production. La
   * cause réelle était `jose` — voir le champ `overrides` du package.json.
   */
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
