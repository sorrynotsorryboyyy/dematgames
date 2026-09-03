import { requireAdmin, readJson, str } from "@/lib/api-admin";
import { COLLECTIONS, isRole, type Role, type UserDoc } from "@/lib/schema";
import { NextResponse } from "next/server";

/**
 * Utilisateurs — lecture et changement de rôle.
 *
 * Toutes les écritures de rôle passent OBLIGATOIREMENT par ici : les règles
 * Firestore interdisent au navigateur de modifier ce champ. Sans ce
 * verrouillage, n'importe qui pourrait s'attribuer « admin » en rejouant une
 * requête depuis la console du navigateur.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Convertit les Timestamp Firestore en millisecondes sérialisables. */
function millis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;

  const snapshot = await db
    .collection(COLLECTIONS.users)
    .orderBy("memberNumber", "asc")
    .limit(200)
    .get();

  const users: UserDoc[] = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      uid: doc.id,
      email: typeof d.email === "string" ? d.email : "",
      name: typeof d.name === "string" ? d.name : "",
      googlePhotoURL:
        typeof d.googlePhotoURL === "string" ? d.googlePhotoURL : null,
      memberNumber: typeof d.memberNumber === "number" ? d.memberNumber : 0,
      avatarSource: d.avatarSource === "google" ? "google" : "member",
      role: isRole(d.role) ? d.role : "client",
      createdAt: millis(d.createdAt),
      lastSeenAt: millis(d.lastSeenAt),
    };
  });

  return NextResponse.json({ ok: true, users });
}

/** Change le rôle d'un utilisateur. */
export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;
  const me = guard.user!;

  const { data, error } = await readJson<{ uid?: string; role?: string }>(
    request,
  );
  if (error) return error;

  const uid = str(data?.uid, 128);
  const role = data?.role;

  if (!uid || !isRole(role)) {
    return NextResponse.json(
      { ok: false, error: "invalid_input" },
      { status: 422 },
    );
  }

  // Un admin ne peut pas se retirer ses propres droits : sans cette garde,
  // une fausse manœuvre laisserait le site sans aucun administrateur, et il
  // faudrait repasser par la console Firebase pour se rétablir.
  if (uid === me.uid && role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "cannot_demote_self" },
      { status: 409 },
    );
  }

  const ref = db.collection(COLLECTIONS.users).doc(uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await ref.update({ role: role as Role });
  return NextResponse.json({ ok: true });
}
