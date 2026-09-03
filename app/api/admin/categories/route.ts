import { readJson, requireAdmin, slugify, str, withAdminErrors } from "@/lib/api-admin";
import { COLLECTIONS, type CategoryDoc } from "@/lib/schema";
import { LANGS } from "@/content/types";
import { NextResponse } from "next/server";

/**
 * Catégories du blog.
 *
 * Lecture publique côté Firestore (les pages du blog en ont besoin), mais
 * écriture réservée au serveur : c'est ici qu'on garantit l'unicité du slug
 * et la validité de la couleur.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Couleur hexadécimale à 6 chiffres. */
const HEX = /^#[0-9a-fA-F]{6}$/;

function toCategory(id: string, d: Record<string, unknown>): CategoryDoc {
  const label: CategoryDoc["label"] = {};
  const raw = (d.label ?? {}) as Record<string, unknown>;
  for (const lang of LANGS) {
    if (typeof raw[lang] === "string" && raw[lang]) {
      label[lang] = raw[lang] as string;
    }
  }
  return {
    id,
    slug: typeof d.slug === "string" ? d.slug : id,
    label,
    color: typeof d.color === "string" && HEX.test(d.color) ? d.color : "#5b5b66",
    order: typeof d.order === "number" ? d.order : 0,
  };
}

async function handleGET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  let snapshot;
  try {
    snapshot = await guard
      .db!.collection(COLLECTIONS.categories)
      .orderBy("order", "asc")
      .get();
  } catch (e) {
    // Journalisé pour que les logs Vercel montrent la cause réelle
    // (règle Firestore, index manquant) plutôt qu'un échec silencieux.
    console.warn("[admin/categories] orderBy a échoué, lecture simple :", e);
    snapshot = await guard.db!.collection(COLLECTIONS.categories).get();
  }

  const categories = snapshot.docs
    .map((d) => toCategory(d.id, d.data()))
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({ ok: true, categories });
}

async function handlePOST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;

  const { data, error } = await readJson<{
    id?: string;
    slug?: string;
    label?: Record<string, string>;
    color?: string;
    order?: number;
  }>(request);
  if (error) return error;
  const input = data ?? {};

  const label: CategoryDoc["label"] = {};
  for (const lang of LANGS) {
    const value = str(input.label?.[lang], 80);
    if (value) label[lang] = value;
  }
  if (Object.keys(label).length === 0) {
    return NextResponse.json({ ok: false, error: "no_label" }, { status: 422 });
  }

  const color = str(input.color, 7);
  if (color && !HEX.test(color)) {
    return NextResponse.json(
      { ok: false, error: "invalid_color" },
      { status: 422 },
    );
  }

  const firstLabel = Object.values(label)[0]!;
  let slug = slugify(str(input.slug, 80) || firstLabel);
  if (!slug) slug = `categorie-${Date.now()}`;

  const collection = db.collection(COLLECTIONS.categories);
  const clash = await collection.where("slug", "==", slug).limit(2).get();
  if (clash.docs.some((d) => d.id !== input.id)) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const payload = {
    slug,
    label,
    color: color || "#5b5b66",
    order: typeof input.order === "number" ? input.order : 0,
  };

  if (input.id) {
    await collection.doc(input.id).set(payload, { merge: true });
    return NextResponse.json({ ok: true, id: input.id });
  }

  const created = await collection.add(payload);
  return NextResponse.json({ ok: true, id: created.id });
}

async function handleDELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;

  const { data, error } = await readJson<{ id?: string }>(request);
  if (error) return error;
  const id = str(data?.id, 128);
  if (!id) {
    return NextResponse.json({ ok: false, error: "no_id" }, { status: 422 });
  }

  // Les articles de cette catégorie ne sont pas supprimés : ils repassent en
  // « sans catégorie ». Supprimer du contenu publié parce qu'on range une
  // étagère serait une très mauvaise surprise.
  const posts = await db
    .collection(COLLECTIONS.posts)
    .where("categoryId", "==", id)
    .get();

  const batch = db.batch();
  posts.docs.forEach((doc) => batch.update(doc.ref, { categoryId: null }));
  batch.delete(db.collection(COLLECTIONS.categories).doc(id));
  await batch.commit();

  return NextResponse.json({ ok: true, orphaned: posts.size });
}

// Les handlers sont enveloppés : une exception devient une réponse JSON
// exploitable au lieu d'un 500 opaque.
export const GET = withAdminErrors(handleGET);
export const POST = withAdminErrors(handlePOST);
export const DELETE = withAdminErrors(handleDELETE);
