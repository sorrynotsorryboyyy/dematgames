import "server-only";

/**
 * Limitation de débit en mémoire, partagée par les routes publiques.
 *
 * Extrait de `app/api/apply/route.ts` quand une deuxième route publique
 * (l'alerte d'ouverture) en a eu besoin : deux compteurs indépendants
 * auraient laissé un attaquant cumuler les quotas.
 *
 * ATTENTION — limites connues et assumées à ce stade :
 *
 * - L'état vit dans la mémoire de l'instance. Il est perdu au redémarrage et
 *   n'est pas partagé entre instances : en serverless, chaque instance a son
 *   propre compteur, donc le quota réel est un multiple de `max`.
 * - Un attaquant distribué (plusieurs IP) n'est pas ralenti.
 *
 * Cela suffit à écarter le script naïf qui martèle une route. Pour une
 * vraie protection, passer à un compteur partagé (Vercel KV, Upstash).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

/** Un seau par couple (espace de nom, IP) : les routes ne se marchent pas dessus. */
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Nombre d'appels autorisés dans la fenêtre. */
  max: number;
  /** Durée de la fenêtre, en millisecondes. */
  windowMs: number;
}

/** Purge les seaux expirés : sans cela, la Map grossirait indéfiniment. */
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Retourne `true` si l'appel doit être refusé.
 *
 * `namespace` sépare les quotas par route : dépasser sur le formulaire de
 * candidature ne doit pas bloquer l'inscription à l'alerte d'ouverture.
 */
export function rateLimited(
  namespace: string,
  ip: string,
  { max, windowMs }: RateLimitOptions,
): boolean {
  const now = Date.now();
  sweep(now);

  const key = `${namespace}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > max;
}

/**
 * Adresse IP de l'appelant, telle que la transmet le proxy.
 *
 * `x-forwarded-for` peut contenir une chaîne de relais : le client d'origine
 * est le premier élément. La valeur est falsifiable par nature — elle ne sert
 * qu'à limiter le débit, jamais à autoriser quoi que ce soit.
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
