"use client";

import { getDb } from "@/lib/firebase";
import {
  COLLECTIONS,
  isRole,
  type AvatarSource,
  type Role,
  type UserDoc,
} from "@/lib/schema";
import type { User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

/**
 * Création et lecture du document utilisateur.
 *
 * Le point délicat est le NUMÉRO DE MEMBRE. Il doit être unique et croissant,
 * or deux inscriptions simultanées liraient le même compteur et obtiendraient
 * le même numéro. Compter les documents existants a le même défaut, en pire
 * (une suppression décale tout le monde).
 *
 * D'où une transaction Firestore sur un compteur dédié : Firestore rejoue
 * automatiquement la transaction en cas de conflit, ce qui garantit que deux
 * inscriptions concurrentes obtiennent deux numéros différents.
 */

const COUNTER_DOC = "users";

/**
 * Convertit un Timestamp Firestore en millisecondes sérialisables.
 *
 * On teste la présence de `toMillis` plutôt que `instanceof Timestamp` :
 * la classe n'est pas importée statiquement (Firestore est chargé à la
 * demande), et un `instanceof` sur un module chargé dynamiquement est
 * fragile.
 */
function toMillis(value: unknown): number {
  if (typeof value === "number") return value;
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

/** Charge Firestore et ses fonctions à la demande. */
async function firestore(): Promise<{
  db: Firestore;
  api: typeof import("firebase/firestore");
} | null> {
  const db = await getDb();
  if (!db) return null;
  return { db, api: await import("firebase/firestore") };
}

/**
 * Crée le document du nouvel utilisateur, ou met à jour le profil existant.
 *
 * Retourne toujours un `UserDoc` complet : l'appelant n'a pas à gérer le cas
 * « document absent ».
 */
export async function ensureUserDoc(fbUser: User): Promise<UserDoc> {
  const fs = await firestore();

  // Firestore indisponible (config absente, réseau) : on renvoie un profil
  // dégradé plutôt que d'empêcher la connexion. L'utilisateur est connecté,
  // simplement sans numéro de membre.
  if (!fs) {
    return fallbackDoc(fbUser);
  }

  const { db, api } = fs;
  const { doc, runTransaction, serverTimestamp } = api;
  const userRef = doc(db, COLLECTIONS.users, fbUser.uid);
  const counterRef = doc(db, COLLECTIONS.counters, COUNTER_DOC);

  try {
    const result = await runTransaction(db, async (tx) => {
      const userSnap = await tx.get(userRef);

      // --- Utilisateur déjà connu : on rafraîchit, sans toucher au rôle
      //     ni au numéro de membre, tous deux définitifs.
      if (userSnap.exists()) {
        const data = userSnap.data();
        tx.update(userRef, {
          name: fbUser.displayName ?? data.name ?? "",
          googlePhotoURL: fbUser.photoURL ?? null,
          lastSeenAt: serverTimestamp(),
        });
        return {
          memberNumber: typeof data.memberNumber === "number" ? data.memberNumber : 0,
          role: isRole(data.role) ? data.role : ("client" as Role),
          avatarSource: (data.avatarSource === "google"
            ? "google"
            : "member") as AvatarSource,
          createdAt: toMillis(data.createdAt),
        };
      }

      // --- Nouvelle inscription : on incrémente le compteur dans la même
      //     transaction que la création du document. Si deux personnes
      //     s'inscrivent en même temps, Firestore rejoue l'une des deux et
      //     elle obtient le numéro suivant.
      const counterSnap = await tx.get(counterRef);
      const previous =
        counterSnap.exists() && typeof counterSnap.data().count === "number"
          ? counterSnap.data().count
          : 0;
      const memberNumber = previous + 1;

      tx.set(counterRef, { count: memberNumber }, { merge: true });
      tx.set(userRef, {
        email: fbUser.email ?? "",
        name: fbUser.displayName ?? "",
        googlePhotoURL: fbUser.photoURL ?? null,
        memberNumber,
        // Avatar maison par défaut : l'identité du site primer, et le numéro
        // de membre n'aurait aucun sens s'il n'était jamais affiché.
        avatarSource: "member" as AvatarSource,
        role: "client" as Role,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      });

      return {
        memberNumber,
        role: "client" as Role,
        avatarSource: "member" as AvatarSource,
        createdAt: Date.now(),
      };
    });

    return {
      uid: fbUser.uid,
      email: fbUser.email ?? "",
      name: fbUser.displayName ?? "",
      googlePhotoURL: fbUser.photoURL ?? null,
      memberNumber: result.memberNumber,
      avatarSource: result.avatarSource,
      role: result.role,
      createdAt: result.createdAt,
      lastSeenAt: Date.now(),
    };
  } catch {
    // Transaction refusée (règles) ou hors ligne : profil dégradé.
    return fallbackDoc(fbUser);
  }
}

/** Change la source d'avatar de l'utilisateur courant. */
export async function setAvatarSource(
  uid: string,
  source: AvatarSource,
): Promise<void> {
  const fs = await firestore();
  if (!fs) return;
  const { doc, updateDoc } = fs.api;
  await updateDoc(doc(fs.db, COLLECTIONS.users, uid), { avatarSource: source });
}

/** Relit le document utilisateur, par exemple après un changement de rôle. */
export async function readUserDoc(uid: string): Promise<UserDoc | null> {
  const fs = await firestore();
  if (!fs) return null;
  const { doc, getDoc } = fs.api;
  const snapshot = await getDoc(doc(fs.db, COLLECTIONS.users, uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    name: typeof data.name === "string" ? data.name : "",
    googlePhotoURL:
      typeof data.googlePhotoURL === "string" ? data.googlePhotoURL : null,
    memberNumber: typeof data.memberNumber === "number" ? data.memberNumber : 0,
    avatarSource: data.avatarSource === "google" ? "google" : "member",
    role: isRole(data.role) ? data.role : "client",
    createdAt: toMillis(data.createdAt),
    lastSeenAt: toMillis(data.lastSeenAt),
  };
}

/** Profil minimal quand Firestore n'a pas pu répondre. */
function fallbackDoc(fbUser: User): UserDoc {
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? "",
    name: fbUser.displayName ?? "",
    googlePhotoURL: fbUser.photoURL ?? null,
    // 0 signale « numéro inconnu » : l'avatar affiche « #— » plutôt qu'un
    // numéro faux, qui serait pire.
    memberNumber: 0,
    avatarSource: "member",
    role: "client",
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
  };
}

/** URL de l'avatar à afficher, selon la préférence de l'utilisateur. */
export function avatarUrl(user: {
  memberNumber: number;
  avatarSource: AvatarSource;
  googlePhotoURL: string | null;
}): string {
  if (user.avatarSource === "google" && user.googlePhotoURL) {
    return user.googlePhotoURL;
  }
  return `/api/avatar/${user.memberNumber}`;
}
