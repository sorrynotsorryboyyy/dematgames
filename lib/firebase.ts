import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Initialisation Firebase (côté client).
 *
 * Les clés NEXT_PUBLIC_* sont publiques par conception : elles identifient
 * le projet, elles ne l'autorisent pas. La sécurité repose sur les règles
 * Firestore et sur la liste des domaines autorisés dans la console — jamais
 * sur le secret de ces valeurs.
 *
 * Le site doit rester utilisable SANS configuration Firebase : un visiteur
 * qui parcourt la boutique n'a pas besoin d'être connecté. `isConfigured`
 * permet aux composants d'afficher un état dégradé plutôt que de planter.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** `true` si les variables minimales sont présentes. */
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/**
 * Initialisation paresseuse et idempotente.
 *
 * `getApps()` évite de réinitialiser à chaque Fast Refresh en développement,
 * ce qui lèverait une erreur « app already exists ».
 */
function ensureApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp(config as Required<typeof config>);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const instance = ensureApp();
  if (!instance) return null;
  if (!authInstance) authInstance = getAuth(instance);
  return authInstance;
}

export function getDb(): Firestore | null {
  const instance = ensureApp();
  if (!instance) return null;
  if (!dbInstance) dbInstance = getFirestore(instance);
  return dbInstance;
}

/**
 * Fournisseur Google.
 *
 * `prompt: "select_account"` force le choix du compte à chaque connexion :
 * sans cela, un utilisateur déjà connecté à Google est reconnecté
 * silencieusement, sans jamais pouvoir changer de compte.
 */
export function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}
