import { readJson, requireAdmin, slugify, str, withAdminErrors } from "@/lib/api-admin";
import {
  COLLECTIONS,
  POST_STATUSES,
  type PostDoc,
  type PostStatus,
  readPostLinks,
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
  // Plus larges que les repères affichés dans l'admin (60 / 155) : ces
  // repères disent où Google tronque, pas où la saisie devient invalide.
  seoTitle: 200,
  seoDescription: 400,
  coverAlt: 300,
  linkLabel: 120,
  /** Au-delà, ce n'est plus une bibliographie mais une ferme à liens. */
  links: 12,
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
        // Optionnels : les articles écrits avant ces champs n'en ont pas.
        seoTitle: typeof c.seoTitle === "string" ? c.seoTitle : undefined,
        seoDescription:
          typeof c.seoDescription === "string" ? c.seoDescription : undefined,
        coverAlt: typeof c.coverAlt === "string" ? c.coverAlt : undefined,
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
    links: readPostLinks(d.links),
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

async function handleGET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  let snapshot;
  try {
    snapshot = await guard
      .db!.collection(COLLECTIONS.posts)
      .orderBy("updatedAt", "desc")
      .limit(200)
      .get();
  } catch {
    // Collection vide ou champ absent : lecture simple, tri en mémoire.
    snapshot = await guard.db!.collection(COLLECTIONS.posts).limit(200).get();
  }

  const posts = snapshot.docs
    .map((doc) => toPost(doc.id, doc.data()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return NextResponse.json({ ok: true, posts });
}

interface PostInput {
  id?: string;
  slug?: string;
  status?: string;
  content?: Partial<
    Record<
      Lang,
      {
        title?: string;
        excerpt?: string;
        body?: string;
        seoTitle?: string;
        seoDescription?: string;
        coverAlt?: string;
      }
    >
  >;
  categoryId?: string | null;
  coverId?: string | null;
  links?: unknown;
  sponsored?: boolean;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
}

/**
 * Valide les liens sortants soumis par l'administration.
 *
 * Le formulaire est réservé aux administrateurs, mais la requête reste une
 * entrée réseau : elle est revalidée ici comme n'importe quelle autre. Seuls
 * http(s) passent — un `javascript:` dans un href serait une faille — et le
 * nombre est plafonné.
 */
function sanitizeLinks(raw: unknown): { label: string; url: string }[] {
  if (!Array.isArray(raw)) return [];

  const links: { label: string; url: string }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { label, url } = item as Record<string, unknown>;

    const cleanLabel = str(label, LIMITS.linkLabel);
    const cleanUrl = str(url, LIMITS.url);
    if (!cleanLabel || !cleanUrl) continue;

    try {
      const parsed = new URL(cleanUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") continue;
    } catch {
      continue;
    }

    links.push({ label: cleanLabel, url: cleanUrl });
    if (links.length >= LIMITS.links) break;
  }
  return links;
}

/** Crée ou met à jour un article. */
async function handlePOST(request: Request) {
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
      // Champs facultatifs : une chaîne vide est stockée comme absente,
      // sinon le repli sur le titre et le chapô ne se déclencherait pas.
      seoTitle: str(c?.seoTitle, LIMITS.seoTitle) || undefined,
      seoDescription:
        str(c?.seoDescription, LIMITS.seoDescription) || undefined,
      coverAlt: str(c?.coverAlt, LIMITS.coverAlt) || undefined,
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
    links: sanitizeLinks(input.links),
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

async function handleDELETE(request: Request) {
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

// Les handlers sont enveloppés : une exception devient une réponse JSON
// exploitable au lieu d'un 500 opaque.
export const GET = withAdminErrors(handleGET);
export const POST = withAdminErrors(handlePOST);
export const DELETE = withAdminErrors(handleDELETE);
