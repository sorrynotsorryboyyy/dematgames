import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * `firebase-admin` est laissé EXTERNE au bundle serveur.
   *
   * Sans cela, le déploiement échouait avec :
   *
   *   ERR_REQUIRE_ESM: require() of ES Module jose/dist/webapi/index.js
   *   from jwks-rsa/src/utils.js not supported
   *
   * En cause, une incompatibilité en amont : `jwks-rsa` (dépendance de
   * firebase-admin) charge `jose` avec `require()`, alors que `jose` 6.x est
   * devenu ESM seulement. Le bundler transformait l'import en require ; en
   * laissant le paquet externe, Node le résout nativement et la chaîne
   * fonctionne.
   *
   * Symptôme trompeur : la route renvoyait un 500 au corps VIDE, car le
   * module échouait à l'import — avant que le moindre try/catch applicatif
   * puisse intervenir.
   */
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
