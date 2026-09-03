import "server-only";

import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import {
  COLLECTIONS,
  isPostVisible,
  type CategoryDoc,
  type PostDoc,
} from "@/lib/schema";
import { LANGS, type Lang } from "@/content/types";

/**
 * Lecture publique du blog, côté serveur.
 *
 * Passe par firebase-admin plutôt que par le SDK client : les pages du blog
 * sont rendues côté serveur, et cela évite d'embarquer Firestore dans le
 * bundle du navigateur (159 Ko gzip qu'on a justement retirés).
 *
 * Toutes les fonctions retournent des tableaux vides si Firebase n'est pas
 * configuré : le blog s'affiche alors vide plutôt que de faire échouer le
 * build.
 */

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

/** Articles publiés et disponibles dans la langue demandée. */
export async function listPosts(lang: Lang): Promise<PostDoc[]> {
  if (!isAdminConfigured) return [];
  const db = adminDb();
  if (!db) return [];

  try {
    const snapshot = await db
      .collection(COLLECTIONS.posts)
      .where("status", "==", "published")
      .limit(100)
      .get();

    return snapshot.docs
      .map((doc) => toPost(doc.id, doc.data()))
      // Le filtre par langue se fait ici plutôt qu'en requête : Firestore ne
      // sait pas interroger un champ imbriqué optionnel comme content.fr.
      .filter((post) => isPostVisible(post, lang))
      .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  } catch {
    return [];
  }
}

/** Un article par son slug, s'il est publié et disponible dans la langue. */
export async function getPost(
  slug: string,
  lang: Lang,
): Promise<PostDoc | null> {
  if (!isAdminConfigured) return null;
  const db = adminDb();
  if (!db) return null;

  try {
    const snapshot = await db
      .collection(COLLECTIONS.posts)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const post = toPost(snapshot.docs[0].id, snapshot.docs[0].data());
    return isPostVisible(post, lang) ? post : null;
  } catch {
    return null;
  }
}

export async function listCategories(): Promise<CategoryDoc[]> {
  if (!isAdminConfigured) return [];
  const db = adminDb();
  if (!db) return [];

  try {
    const snapshot = await db.collection(COLLECTIONS.categories).get();
    return snapshot.docs
      .map((doc) => {
        const d = doc.data();
        const label: CategoryDoc["label"] = {};
        const raw = (d.label ?? {}) as Record<string, unknown>;
        for (const lang of LANGS) {
          if (typeof raw[lang] === "string") label[lang] = raw[lang] as string;
        }
        return {
          id: doc.id,
          slug: typeof d.slug === "string" ? d.slug : doc.id,
          label,
          color: typeof d.color === "string" ? d.color : "#5b5b66",
          order: typeof d.order === "number" ? d.order : 0,
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}
