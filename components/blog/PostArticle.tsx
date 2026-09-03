import type { Content, Lang } from "@/content/types";
import type { CategoryDoc, PostDoc } from "@/lib/schema";

/**
 * Un article de blog.
 *
 * Le corps est du Markdown rendu de façon minimale : titres, paragraphes,
 * listes, liens, gras et italique. Pas de bibliothèque — le sous-ensemble
 * utile tient en quelques règles, et une dépendance de rendu Markdown
 * (~40 Ko) sur chaque article serait disproportionnée.
 *
 * SÉCURITÉ — aucun HTML brut n'est interprété. Le contenu vient de l'admin,
 * donc d'une source de confiance, mais rendre du HTML arbitraire ouvrirait
 * une porte inutile : le rendu produit des éléments React, jamais
 * dangerouslySetInnerHTML.
 */
export function PostArticle({
  post,
  category,
  lang,
  t,
}: {
  post: PostDoc;
  category?: CategoryDoc;
  lang: Lang;
  t: Content;
}) {
  const content = post.content[lang]!;

  return (
    <article className="mx-auto max-w-[46rem]">
      <div className="flex flex-wrap items-center gap-2">
        {category && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8rem] font-medium"
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

        {post.sponsored && (
          <span className="rounded-full border border-ember/45 bg-[var(--color-ember-soft)] px-3 py-1 text-[0.8rem] font-medium text-ember">
            {t.blog.sponsored}
          </span>
        )}
      </div>

      <h1 className="display display-lg mt-5 text-chalk">{content.title}</h1>

      {post.publishedAt && (
        <p className="numeric mt-4 text-[0.85rem] text-smoke">
          {new Date(post.publishedAt).toLocaleDateString(
            lang === "fr" ? "fr-FR" : "en-GB",
            { day: "numeric", month: "long", year: "numeric" },
          )}
        </p>
      )}

      {/* Mention de partenariat, en tête d'article et non en pied : elle doit
          être lue AVANT le contenu qu'elle qualifie. */}
      {post.sponsored && post.sponsorName && (
        <p className="mt-6 rounded-xl border border-ember/35 bg-[var(--color-ember-soft)] p-4 text-[0.92rem] text-chalk">
          {t.blog.sponsoredBy}{" "}
          {post.sponsorUrl ? (
            <a
              href={post.sponsorUrl}
              target="_blank"
              // `sponsored nofollow` : c'est ce que Google attend d'un lien
              // rémunéré, et l'omettre expose à une pénalité.
              rel="sponsored nofollow noopener noreferrer"
              className="font-medium text-ember underline underline-offset-2"
            >
              {post.sponsorName}
            </a>
          ) : (
            <span className="font-medium">{post.sponsorName}</span>
          )}
        </p>
      )}

      {content.excerpt && (
        <p className="mt-8 text-[1.15rem] leading-[1.7] text-smoke">
          {content.excerpt}
        </p>
      )}

      <div className="mt-10 space-y-5">
        <Markdown source={content.body} />
      </div>
    </article>
  );
}

/**
 * Rendu Markdown minimal : titres, listes, paragraphes, gras, italique,
 * liens et code en ligne. Suffisant pour un blog, sans dépendance.
 */
function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/).filter((b) => b.trim());

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="display pt-4 text-[1.2rem] text-chalk">
              {inline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="display pt-6 text-[1.5rem] text-chalk">
              {inline(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-ember pl-5 text-[1.05rem] italic leading-[1.7] text-chalk"
            >
              {inline(trimmed.replace(/^> ?/gm, ""))}
            </blockquote>
          );
        }
        if (/^[-*] /.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => /^[-*] /.test(l));
          return (
            <ul key={i} className="space-y-2 pl-1">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-baseline gap-3 text-[1.02rem] leading-[1.7] text-smoke"
                >
                  <span aria-hidden="true" className="text-ember">
                    •
                  </span>
                  <span>{inline(item.replace(/^[-*] /, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-[1.05rem] leading-[1.8] text-smoke">
            {inline(trimmed)}
          </p>
        );
      })}
    </>
  );
}

/** Gras, italique, code et liens — rendus en éléments React, jamais en HTML. */
function inline(text: string): React.ReactNode[] {
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-chalk">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-carbon px-1.5 py-0.5 font-mono text-[0.9em] text-chalk"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={i}
          href={link[2]}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-ember underline underline-offset-2"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
