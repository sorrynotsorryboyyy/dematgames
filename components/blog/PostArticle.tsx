import { PostCover } from "@/components/blog/PostCover";
import {
  extractHeadings,
  TableOfContents,
} from "@/components/blog/TableOfContents";
import type { Content, Lang } from "@/content/types";
import type { CategoryDoc, PostDoc } from "@/lib/schema";
import { slugify } from "@/lib/slugify";

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

      <PostCover post={post} lang={lang} size="article" className="mt-8" />

      <TableOfContents
        headings={extractHeadings(content.body)}
        label={t.blog.tocTitle}
      />

      <div className="mt-10 space-y-5">
        <Markdown source={content.body} />
      </div>

      {/* Sources : des liens ÉDITORIAUX, donc sans `nofollow`. Citer une
          source légitime est normal ; le `nofollow` systématique envoie un
          signal de méfiance inutile. Il reste réservé au sponsoring, où il
          est obligatoire. */}
      {post.links.length > 0 && (
        <section
          aria-labelledby="sources-title"
          className="mt-14 rounded-xl border border-slate bg-carbon p-5 sm:p-6"
        >
          <h2
            id="sources-title"
            className="font-mono text-[0.72rem] tracking-[0.16em] text-smoke uppercase"
          >
            {t.blog.sourcesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {post.links.map((link) => (
              <li key={link.url} className="flex items-baseline gap-3">
                <span aria-hidden="true" className="text-ember">
                  ↗
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.97rem] leading-[1.6] text-ember underline underline-offset-4 transition-colors hover:text-chalk"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

/**
 * Rendu Markdown minimal : titres, listes, paragraphes, gras, italique,
 * liens et code en ligne. Suffisant pour un blog, sans dépendance.
 */
function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/).filter((b) => b.trim());

  // Compteur de doublons : deux sections peuvent porter le même titre, mais
  // deux `id` identiques rendraient la seconde inatteignable. La règle doit
  // rester celle d'extractHeadings, sans quoi le sommaire pointerait à côté.
  const seen = new Map<string, number>();
  const anchorFor = (text: string) => {
    const base = slugify(text);
    if (!base) return undefined;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        // Image seule sur sa ligne : ![texte alternatif](url)
        const image = trimmed.match(IMAGE_RE);
        if (image) {
          return <BodyImage key={i} alt={image[1]} src={image[2]} />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="display pt-4 text-[1.2rem] text-chalk">
              {inline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3);
          return (
            <h2
              key={i}
              // L'ancre rend la section citable par son URL : on peut lier
              // un passage précis plutôt que l'article entier.
              id={anchorFor(text)}
              className="display scroll-mt-24 pt-6 text-[1.5rem] text-chalk"
            >
              {inline(text)}
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

/**
 * Image dans le corps d'un article : ![texte alternatif](url)
 *
 * Seules les URL http(s) sont acceptées : un `javascript:` dans un src
 * serait une faille, et le contenu vient de la base plutôt que du code.
 */
const IMAGE_RE =
  /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/;

function BodyImage({ alt, src }: { alt: string; src: string }) {
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- les
          visuels d'articles sont servis par Cloudinary, qui applique
          déjà format, qualité et densité. */}
      <img
        src={src}
        // Un alt vide rend l'image DÉCORATIVE. On n'invente jamais de
        // texte alternatif : une description fausse est pire qu'aucune.
        alt={alt.trim()}
        // Dimensions indicatives : sans elles, la page saute au
        // chargement (CLS), que Google prend en compte au classement.
        width={1200}
        height={750}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full rounded-xl border border-slate"
      />
      {alt.trim() && (
        <figcaption className="mt-3 text-center text-[0.85rem] text-smoke">
          {alt.trim()}
        </figcaption>
      )}
    </figure>
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
