"use client";

import {
  getFirebaseAuth,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import type { AvatarSource, Role } from "@/lib/schema";
import { avatarUrl, ensureUserDoc, setAvatarSource } from "@/lib/users";
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
  /** Photo Google brute. `avatar` est ce qu'il faut afficher. */
  googlePhotoURL: string | null;
  /** URL de l'avatar à afficher, selon la préférence de l'utilisateur. */
  avatar: string;
  /** Numéro d'inscription, définitif. 0 si Firestore n'a pas répondu. */
  memberNumber: number;
  avatarSource: AvatarSource;
  /** Rôle applicatif, lu depuis Firestore — jamais depuis le jeton. */
  role: Role;
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
  /** Bascule entre l'avatar de membre et la photo Google. */
  chooseAvatar: (source: AvatarSource) => Promise<void>;
  /**
   * Jeton d'identité courant, pour authentifier les appels aux routes API.
   * Rafraîchi automatiquement par le SDK — ne jamais le mettre en cache.
   */
  getToken: () => Promise<string | null>;
}

const SessionContext = createContext<SessionValue | null>(null);

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

      // ensureUserDoc crée le document au premier passage (avec attribution
      // atomique du numéro de membre) ou rafraîchit le profil existant.
      const profile = await ensureUserDoc(fbUser);
      setUser({
        uid: profile.uid,
        name: profile.name || profile.email.split("@")[0] || "",
        email: profile.email,
        googlePhotoURL: profile.googlePhotoURL,
        avatar: avatarUrl(profile),
        memberNumber: profile.memberNumber,
        avatarSource: profile.avatarSource,
        role: profile.role,
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

  const chooseAvatar = useCallback(
    async (source: AvatarSource) => {
      if (!user) return;
      await setAvatarSource(user.uid, source);
      // Mise à jour optimiste : l'écriture Firestore est déjà partie, et
      // attendre onAuthStateChanged (qui ne se déclenche pas ici) laisserait
      // l'interface figée.
      setUser((current) =>
        current
          ? {
              ...current,
              avatarSource: source,
              avatar: avatarUrl({ ...current, avatarSource: source }),
            }
          : current,
      );
    },
    [user],
  );

  const getToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    // getIdToken rafraîchit le jeton s'il est expiré : on ne le met jamais
    // en cache côté appelant.
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      available: isFirebaseConfigured,
      error,
      signInWithGoogle,
      signOut,
      chooseAvatar,
      getToken,
    }),
    [user, ready, error, signInWithGoogle, signOut, chooseAvatar, getToken],
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
