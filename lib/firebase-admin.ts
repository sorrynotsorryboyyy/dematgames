import "server-only";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { COLLECTIONS, isRole, type Role } from "@/lib/schema";

/**
 * Firebase Admin — STRICTEMENT serveur.
 *
 * `import "server-only"` fait échouer la compilation si ce module est importé
 * depuis un composant client. C'est vital : la clé de service contourne
 * toutes les règles Firestore et donne un accès total au projet.
 *
 * Sert à deux choses :
 *   1. vérifier un jeton d'authentification côté serveur (`requireAdmin`) ;
 *   2. lire et écrire en ignorant les règles, pour l'admin.
 *
 * Configuration : voir README. Trois variables sont attendues, issues du
 * fichier JSON de compte de service généré dans la console Firebase.
 */

const projectId = unquote(process.env.FIREBASE_ADMIN_PROJECT_ID);
const clientEmail = unquote(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
/**
 * Normalise la clé privée du compte de service.
 *
 * Trois pièges, chacun produisant la même erreur illisible
 * (`ERR_OSSL_UNSUPPORTED`, « DECODER routines::unsupported ») :
 *
 * 1. GUILLEMETS ENGLOBANTS. Un fichier `.env` écrit souvent
 *    `KEY="-----BEGIN..."`, et la valeur lue conserve les guillemets. Le PEM
 *    commence alors par `"-----BEGIN`, qu'OpenSSL refuse. C'était la cause
 *    des 500 en production : le module échouait AU CHARGEMENT, avant même
 *    d'exécuter la moindre ligne du handler — d'où un 500 au corps vide,
 *    que le try/catch des routes ne pouvait pas rattraper.
 * 2. RETOURS À LA LIGNE ÉCHAPPÉS. La clé est multiligne ; les variables
 *    d'environnement la stockent avec des `\n` littéraux à restaurer.
 * 3. ESPACES DE BORD, ajoutés au copier-coller.
 *
 * Le base64 est également accepté : certains guides recommandent d'encoder
 * la clé pour contourner ces problèmes.
 */
function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();

  // 1. Guillemets englobants, simples ou doubles.
  const quoted =
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"));
  if (quoted) key = key.slice(1, -1);

  // 2. Retours à la ligne échappés.
  //
  // On boucle jusqu'à stabilisation car l'échappement peut être DOUBLE
  // (\\\\n au lieu de \\n) : un fichier .env réécrit par un script, ou
  // une valeur copiée depuis un JSON déjà échappé, produit ce cas. Un simple
  // replace laisserait des \\n littéraux dans le PEM, qu'OpenSSL refuse
  // avec un message parfaitement opaque (ERR_OSSL_UNSUPPORTED).
  let previous: string;
  do {
    previous = key;
    key = key
      .replace(/\\\\n/g, "\n")
      .replace(/\\n/g, "\n");
  } while (key !== previous);

  // 3. Clé fournie en base64 (aucun marqueur PEM visible) : on décode.
  if (!key.includes("BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("BEGIN")) key = decoded;
    } catch {
      // Pas du base64 exploitable : on garde la valeur telle quelle.
    }
  }

  key = key.trim();
  return key || undefined;
}

const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

/** Retire d'éventuels guillemets autour d'une variable simple. */
function unquote(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  const quoted =
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"));
  return (quoted ? v.slice(1, -1) : v) || undefined;
}

export const isAdminConfigured = Boolean(
  projectId && clientEmail && privateKey,
);

let app: App | null = null;

function ensureApp(): App | null {
  if (!isAdminConfigured) return null;
  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: projectId as string,
            clientEmail: clientEmail as string,
            privateKey: privateKey as string,
          }),
        });
  }
  return app;
}

/** Firestore avec les droits administrateur. Ignore les règles de sécurité. */
export function adminDb(): Firestore | null {
  const instance = ensureApp();
  return instance ? getFirestore(instance) : null;
}

export interface VerifiedUser {
  uid: string;
  email: string;
  role: Role;
}

/**
 * Vérifie un jeton d'identité Firebase et retourne l'utilisateur.
 *
 * Le rôle est lu depuis Firestore, JAMAIS depuis le jeton : un jeton peut
 * porter des claims obsolètes, et surtout le client n'a aucun moyen d'écrire
 * le rôle (les règles l'interdisent). Firestore est donc la seule autorité.
 *
 * Retourne `null` si le jeton est absent, invalide, expiré, ou si le compte
 * n'existe pas. Ne lève jamais : l'appelant décide quoi répondre.
 */
export async function verifyToken(
  idToken: string | undefined | null,
): Promise<VerifiedUser | null> {
  if (!idToken) return null;
  const instance = ensureApp();
  if (!instance) return null;

  try {
    const decoded = await getAuth(instance).verifyIdToken(idToken);
    const db = getFirestore(instance);
    const snapshot = await db
      .collection(COLLECTIONS.users)
      .doc(decoded.uid)
      .get();

    if (!snapshot.exists) return null;
    const data = snapshot.data();
    const role = isRole(data?.role) ? data.role : "client";

    return { uid: decoded.uid, email: decoded.email ?? "", role };
  } catch {
    // Jeton expiré, signature invalide, projet mal configuré : dans tous les
    // cas l'appelant n'est pas authentifié.
    return null;
  }
}

/** Comme `verifyToken`, mais exige le rôle `admin`. */
export async function verifyAdmin(
  idToken: string | undefined | null,
): Promise<VerifiedUser | null> {
  const user = await verifyToken(idToken);
  return user?.role === "admin" ? user : null;
}

/**
 * Extrait le jeton d'un en-tête `Authorization: Bearer <token>`.
 *
 * On passe le jeton en en-tête plutôt qu'en cookie : les cookies de session
 * demanderaient une gestion de rafraîchissement et exposeraient au CSRF,
 * alors que le SDK client fournit déjà un jeton court à la demande.
 */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}
