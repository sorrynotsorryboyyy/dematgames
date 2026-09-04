import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import type { PostDoc } from "@/lib/schema";
import Link from "next/link";

/** Deux suffisent : au-delà, le bloc concurrence l'article qu'on vient de lire. */
const MAX = 2;

/**
 * Sélectionne les articles à proposer après celui-ci.
 *
 * Même catégorie d'abord, puis les plus récents. Sans ce maillage, chaque
 * article est une impasse : le lecteur repart, et les liens internes qui
 * aident un moteur à comprendre la structure du site n'existent pas.
 */
export function pickRelated(posts: PostDoc[], current: PostDoc): PostDoc[] {
  const others = posts.filter((p) => p.id !== current.id);

  const sameCategory = current.categoryId
    ? others.filter((p) => p.categoryId === current.categoryId)
    : [];
  const rest = others.filter((p) => !sameCategory.includes(p));

  return [...sameCategory, ...rest].slice(0, MAX);
}

export function RelatedPosts({
  posts,
  lang,
  t,
}: {
  posts: PostDoc[];
  lang: Lang;
  t: Content;
}) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="related-title"
      className="mt-16 border-t border-slate pt-10"
    >
      <h2
        id="related-title"
        className="font-mono text-[0.72rem] tracking-[0.16em] text-smoke uppercase"
      >
        {t.blog.relatedTitle}
      </h2>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => {
          const content = post.content[lang]!;
          return (
            <li key={post.id}>
              <Link
                href={path("blog", lang, post.slug)}
                className="block h-full rounded-xl border border-slate bg-carbon p-5 transition-colors hover:border-smoke"
              >
                <h3 className="display text-[1.05rem] leading-snug text-chalk">
                  {content.title}
                </h3>
                {content.excerpt && (
                  <p className="mt-2 line-clamp-2 text-[0.92rem] leading-[1.6] text-smoke">
                    {content.excerpt}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
