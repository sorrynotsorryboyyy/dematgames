import { readJson, requireAdmin, slugify, str } from "@/lib/api-admin";
import {
  COLLECTIONS,
  POST_STATUSES,
  type PostDoc,
  type PostStatus,
} from "@/lib/schema";
import { LANGS, type Lang } from "@/content/types";
import { NextResponse } from "next/server";

/**
 * Articles du blog — liste, création, modification, suppression.
 *
 * Toutes les écritures passent par ici : les règles Firestore refusent
 * l'écriture directe sur `posts`, y compris à un admin connecté. C'est ce qui
 * garantit que le slug reste unique et que `sponsored` ne peut pas être posé
 * sans annonceur.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = {
  title: 160,
  excerpt: 320,
  body: 60_000,
  sponsor: 120,
  url: 500,
};

function millis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function toPost(id: string, d: Record<string, unknown>): PostDoc {
  const content: PostDoc["content"] = {};
  const raw = (d.content ?? {}) as Record<string, unknown>;
  for (const lang of LANGS) {
    const c = raw[lang] as Record<string, unknown> | undefined;
    if (c && typeof c.title === "string" && c.title.trim()) {
      content[lang] = {
        title: String(c.title),
        excerpt: typeof c.excerpt === "string" ? c.excerpt : "",
        body: typeof c.body === "string" ? c.body : "",
      };
    }
  }

  return {
    id,
    slug: typeof d.slug === "string" ? d.slug : id,
    status: d.status === "published" ? "published" : "draft",
    content,
    categoryId: typeof d.categoryId === "string" ? d.categoryId : null,
    coverId: typeof d.coverId === "string" ? d.coverId : null,
    sponsored: d.sponsored === true,
    sponsorName: typeof d.sponsorName === "string" ? d.sponsorName : null,
    sponsorUrl: typeof d.sponsorUrl === "string" ? d.sponsorUrl : null,
    authorUid: typeof d.authorUid === "string" ? d.authorUid : "",
    authorName: typeof d.authorName === "string" ? d.authorName : "",
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
    publishedAt: d.publishedAt ? millis(d.publishedAt) : null,
  };
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const snapshot = await guard
    .db!.collection(COLLECTIONS.posts)
    .orderBy("updatedAt", "desc")
    .limit(200)
    .get();

  return NextResponse.json({
    ok: true,
    posts: snapshot.docs.map((doc) => toPost(doc.id, doc.data())),
  });
}

interface PostInput {
  id?: string;
  slug?: string;
  status?: string;
  content?: Partial<Record<Lang, { title?: string; excerpt?: string; body?: string }>>;
  categoryId?: string | null;
  coverId?: string | null;
  sponsored?: boolean;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
}

/** Crée ou met à jour un article. */
export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;
  const db = guard.db!;
  const me = guard.user!;

  const { data, error } = await readJson<PostInput>(request);
  if (error) return error;
  const input = data ?? {};

  // --- Contenu : au moins une langue doit être renseignée ---
  const content: PostDoc["content"] = {};
  for (const lang of LANGS) {
    const c = input.content?.[lang];
    const title = str(c?.title, LIMITS.title);
    if (!title) continue;
    content[lang] = {
      title,
      excerpt: str(c?.excerpt, LIMITS.excerpt),
      body: str(c?.body, LIMITS.body),
    };
  }
  if (Object.keys(content).length === 0) {
    return NextResponse.json(
      { ok: false, error: "no_content" },
      { status: 422 },
    );
  }

  const status: PostStatus =
    typeof input.status === "string" &&
    (POST_STATUSES as readonly string[]).includes(input.status)
      ? (input.status as PostStatus)
      : "draft";

  // --- Article sponsorisé : l'annonceur est OBLIGATOIRE ---
  //
  // La loi française impose que tout contenu publicitaire soit identifiable
  // comme tel (art. 20 LCEN). Un article marqué sponsorisé sans annonceur
  // afficherait une mention creuse, ce qui ne remplit pas cette obligation.
  const sponsored = input.sponsored === true;
  const sponsorName = str(input.sponsorName, LIMITS.sponsor);
  if (sponsored && !sponsorName) {
    return NextResponse.json(
      { ok: false, error: "sponsor_required" },
      { status: 422 },
    );
  }

  const sponsorUrl = str(input.sponsorUrl, LIMITS.url);
  if (sponsorUrl && !/^https?:\/\//.test(sponsorUrl)) {
    return NextResponse.json(
      { ok: false, error: "invalid_sponsor_url" },
      { status: 422 },
    );
  }

  // --- Slug : dérivé du titre s'il n'est pas fourni, et unique ---
  const firstTitle = Object.values(content)[0]!.title;
  let slug = slugify(str(input.slug, 120) || firstTitle);
  if (!slug) slug = `article-${Date.now()}`;

  const collection = db.collection(COLLECTIONS.posts);
  const clash = await collection.where("slug", "==", slug).limit(2).get();
  const taken = clash.docs.some((d) => d.id !== input.id);
  if (taken) {
    // Suffixe court plutôt qu'un refus : on ne bloque pas la publication
    // pour un titre proche d'un autre.
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const now = Date.now();
  const payload = {
    slug,
    status,
    content,
    categoryId: str(input.categoryId, 128) || null,
    coverId: str(input.coverId, 200) || null,
    sponsored,
    sponsorName: sponsored ? sponsorName : null,
    sponsorUrl: sponsored && sponsorUrl ? sponsorUrl : null,
    updatedAt: now,
  };

  if (input.id) {
    const ref = collection.doc(input.id);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }
    // La date de publication est posée une seule fois, au premier passage
    // en « published » : la republication ne doit pas remonter l'article
    // en tête du blog.
    const wasPublished = existing.data()?.publishedAt;
    await ref.update({
      ...payload,
      publishedAt:
        status === "published" ? (wasPublished ?? now) : (wasPublished ?? null),
    });
    return NextResponse.json({ ok: true, id: input.id, slug });
  }

  const created = await collection.add({
    ...payload,
    authorUid: me.uid,
    authorName: me.email.split("@")[0],
    createdAt: now,
    publishedAt: status === "published" ? now : null,
  });

  return NextResponse.json({ ok: true, id: created.id, slug });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const { data, error } = await readJson<{ id?: string }>(request);
  if (error) return error;

  const id = str(data?.id, 128);
  if (!id) {
    return NextResponse.json({ ok: false, error: "no_id" }, { status: 422 });
  }

  await guard.db!.collection(COLLECTIONS.posts).doc(id).delete();
  return NextResponse.json({ ok: true });
}
