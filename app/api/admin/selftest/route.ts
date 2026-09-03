import { requireAdmin, withAdminErrors } from "@/lib/api-admin";
import { COLLECTIONS } from "@/lib/schema";
import { NextResponse } from "next/server";

/**
 * Diagnostic : compteurs des collections.
 *
 * Protégé comme le reste de l'admin. Ne renvoie que des nombres, aucune
 * donnée personnelle — utile pour vérifier d'un coup d'œil que Firestore
 * répond et que les écritures arrivent.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleGET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;

  const [apps, users, posts, cats] = await Promise.all([
    db.collection(COLLECTIONS.applications).count().get(),
    db.collection(COLLECTIONS.users).count().get(),
    db.collection(COLLECTIONS.posts).count().get(),
    db.collection(COLLECTIONS.categories).count().get(),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      applications: apps.data().count,
      users: users.data().count,
      posts: posts.data().count,
      categories: cats.data().count,
    },
  });
}

// Les handlers sont enveloppés : une exception devient une réponse JSON
// exploitable au lieu d'un 500 opaque.
export const GET = withAdminErrors(handleGET);
