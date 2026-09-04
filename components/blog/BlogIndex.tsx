import { PostCover } from "@/components/blog/PostCover";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import type { CategoryDoc, PostDoc } from "@/lib/schema";
import Link from "next/link";

/**
 * Liste des articles publiés.
 *
 * Ne reçoit que les articles disponibles dans la langue courante (le filtre
 * est fait par lib/blog.ts) : la règle de pureté linguistique tient, sans
 * obliger à traduire chaque article.
 */
export function BlogIndex({
  lang,
  t,
  posts,
  categories,
}: {
  lang: Lang;
  t: Content;
  posts: PostDoc[];
  categories: CategoryDoc[];
}) {
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <h1 className="display display-lg text-chalk">{t.blog.title}</h1>
      <p className="mt-5 max-w-2xl text-[1.08rem] leading-[1.7] text-smoke">
        {t.blog.intro}
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-xl border border-slate bg-carbon p-6 text-[1rem] text-smoke">
          {t.blog.empty}
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {posts.map((post) => {
            const content = post.content[lang]!;
            const category = post.categoryId
              ? byId.get(post.categoryId)
              : undefined;

            return (
              <li key={post.id}>
                <TiltCard subtle as="article" className="card h-full">
                  <Link
                    href={path("blog", lang, post.slug)}
                    className="flex h-full flex-col rounded-[inherit] p-6"
                  >
                    <PostCover
                      post={post}
                      lang={lang}
                      size="card"
                      className="mb-5"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {category && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.78rem] font-medium"
                          style={{
                            color: category.color,
                            borderColor: `${category.color}40`,
                            backgroundColor: `${category.color}0F`,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.label[lang] ?? category.slug}
                        </span>
                      )}

                      {/* Mention obligatoire : un contenu publicitaire doit
                          être identifiable comme tel, y compris dans les
                          listes — pas seulement sur l'article. */}
                      {post.sponsored && (
                        <span className="rounded-full border border-ember/45 bg-[var(--color-ember-soft)] px-3 py-1 text-[0.78rem] font-medium text-ember">
                          {t.blog.sponsored}
                        </span>
                      )}
                    </div>

                    <h2 className="display mt-4 text-[1.25rem] leading-snug text-chalk">
                      {content.title}
                    </h2>

                    {content.excerpt && (
                      <p className="mt-3 flex-1 text-[0.98rem] leading-[1.65] text-smoke">
                        {content.excerpt}
                      </p>
                    )}

                    {post.publishedAt && (
                      <p className="numeric mt-5 text-[0.8rem] text-smoke">
                        {new Date(post.publishedAt).toLocaleDateString(
                          lang === "fr" ? "fr-FR" : "en-GB",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </p>
                    )}
                  </Link>
                </TiltCard>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
