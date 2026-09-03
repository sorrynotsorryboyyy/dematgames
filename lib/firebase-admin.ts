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

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
/**
 * La clé privée contient des retours à la ligne. Les variables
 * d'environnement (Vercel comme .env) les stockent échappés en `\n` : il faut
 * les restaurer, sinon la signature échoue avec une erreur peu parlante.
 */
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n",
);

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
