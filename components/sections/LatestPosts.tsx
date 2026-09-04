import { PostCover } from "@/components/blog/PostCover";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import type { CategoryDoc, PostDoc } from "@/lib/schema";
import Link from "next/link";

/**
 * Les derniers articles, sur la page d'accueil.
 *
 * Composant serveur : les articles sont lus dans la page (lib/blog.ts) et
 * passés en props, ce qui évite d'embarquer Firestore côté navigateur.
 *
 * La section ne s'affiche PAS s'il n'y a aucun article : une rubrique vide
 * sur la page d'accueil donnerait l'impression d'un site inachevé.
 */
export function LatestPosts({
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
  if (posts.length === 0) return null;

  const byId = new Map(categories.map((c) => [c.id, c]));
  // Trois au maximum : au-delà, la section concurrence le formulaire, qui
  // reste l'objectif de la page.
  const latest = posts.slice(0, 3);

  return (
    <Section tone="carbon" labelledBy="latest-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="latest-title" className="display display-lg text-chalk">
            {t.blog.latestTitle}
          </h2>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-[1.7] text-smoke">
            {t.blog.latestIntro}
          </p>
        </div>

        <Link
          href={path("blog", lang)}
          className="text-[0.95rem] text-ember underline underline-offset-4 transition-colors hover:text-chalk"
        >
          {t.blog.seeAll}
        </Link>
      </div>

      <ul className="mt-12 grid gap-5 md:grid-cols-3">
        {latest.map((post, i) => {
          const content = post.content[lang]!;
          const category = post.categoryId
            ? byId.get(post.categoryId)
            : undefined;

          return (
            <Reveal as="li" key={post.id} delay={(i + 1) as 1 | 2 | 3}>
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
                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.76rem] font-medium"
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

                    {/* La mention suit l'article partout où il apparaît,
                        y compris ici : c'est une obligation légale, pas un
                        détail de la page blog. */}
                    {post.sponsored && (
                      <span className="rounded-full border border-ember/45 bg-[var(--color-ember-soft)] px-3 py-1 text-[0.76rem] font-medium text-ember">
                        {t.blog.sponsored}
                      </span>
                    )}
                  </div>

                  <h3 className="display mt-4 text-[1.15rem] leading-snug text-chalk">
                    {content.title}
                  </h3>

                  {content.excerpt && (
                    <p className="mt-3 flex-1 text-[0.95rem] leading-[1.6] text-smoke">
                      {content.excerpt}
                    </p>
                  )}

                  {post.publishedAt && (
                    <p className="numeric mt-5 text-[0.78rem] text-smoke">
                      {new Date(post.publishedAt).toLocaleDateString(
                        lang === "fr" ? "fr-FR" : "en-GB",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </p>
                  )}
                </Link>
              </TiltCard>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
