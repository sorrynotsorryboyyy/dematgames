"use client";

import {
  getFirebaseAuth,
  getDb,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Session utilisateur — authentification Google via Firebase.
 *
 * Remplace la maquette qui écrivait un pseudo dans le localStorage. Le
 * contrat `useSession()` est volontairement resté le même : les composants
 * qui le consomment (Header, AccountView, AuthView) n'ont pas eu à changer.
 *
 * Aucun mot de passe ne transite ici, ni ailleurs dans le code : Google seul
 * authentifie, et Firebase ne nous transmet qu'un jeton. C'est aussi ce qui
 * nous évite de stocker et protéger des mots de passe.
 *
 * Le site reste utilisable sans configuration Firebase (`isFirebaseConfigured`
 * à false) : la boutique se parcourt sans compte, seule la connexion est
 * alors indisponible.
 */

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  /** Rôle applicatif, lu depuis Firestore. Prépare le futur /admin. */
  role: "client" | "dev" | "admin";
}

interface SessionValue {
  user: SessionUser | null;
  /** `false` tant que Firebase n'a pas répondu (évite un flash « déconnecté »). */
  ready: boolean;
  /** `false` si les variables d'environnement manquent. */
  available: boolean;
  /** Erreur de la dernière tentative de connexion, à afficher à l'utilisateur. */
  error: "popup-closed" | "network" | "unknown" | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Crée le document utilisateur à la première connexion, ou le met à jour.
 *
 * Le rôle n'est JAMAIS écrit depuis le client au-delà de la création : un
 * utilisateur pourrait sinon s'attribuer `admin` en rejouant la requête. Les
 * règles Firestore doivent interdire toute modification du champ `role`
 * depuis le navigateur (voir README).
 */
async function syncUserDoc(fbUser: User): Promise<SessionUser["role"]> {
  const db = getDb();
  if (!db) return "client";

  const ref = doc(db, "users", fbUser.uid);

  try {
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, {
        email: fbUser.email ?? "",
        name: fbUser.displayName ?? "",
        photoURL: fbUser.photoURL ?? null,
        role: "client",
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      });
      return "client";
    }

    // On rafraîchit le profil (le nom ou l'avatar Google peuvent changer)
    // sans jamais toucher au rôle.
    await setDoc(
      ref,
      {
        name: fbUser.displayName ?? "",
        photoURL: fbUser.photoURL ?? null,
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    );

    const role = snapshot.data()?.role;
    return role === "admin" || role === "dev" ? role : "client";
  } catch {
    // Firestore indisponible ou règles restrictives : on n'empêche pas la
    // connexion pour autant, l'utilisateur est simplement « client ».
    return "client";
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(!isFirebaseConfigured);
  const [error, setError] = useState<SessionValue["error"]>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    // onAuthStateChanged restaure la session au chargement ET réagit aux
    // connexions/déconnexions, y compris depuis un autre onglet.
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setReady(true);
        return;
      }

      const role = await syncUserDoc(fbUser);
      setUser({
        uid: fbUser.uid,
        name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "",
        email: fbUser.email ?? "",
        photoURL: fbUser.photoURL,
        role,
      });
      setReady(true);
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider());
      // Pas de setUser ici : onAuthStateChanged s'en charge, ce qui évite
      // deux sources de vérité pour le même état.
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        // L'utilisateur a fermé la fenêtre : ce n'est pas une erreur à
        // signaler bruyamment.
        setError("popup-closed");
      } else if (code === "auth/network-request-failed") {
        setError("network");
      } else {
        setError("unknown");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      available: isFirebaseConfigured,
      error,
      signInWithGoogle,
      signOut,
    }),
    [user, ready, error, signInWithGoogle, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession doit être utilisé dans un <SessionProvider>.");
  }
  return context;
}
