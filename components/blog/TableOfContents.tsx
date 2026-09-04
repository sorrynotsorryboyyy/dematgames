import { slugify } from "@/lib/slugify";

/** En deçà, un sommaire encombre plus qu'il n'aide. */
const MIN_HEADINGS = 3;

export interface Heading {
  id: string;
  text: string;
}

/**
 * Extrait les titres de niveau 2 d'un corps Markdown.
 *
 * Exporté à part : la page a besoin des mêmes identifiants que le rendu pour
 * que les ancres correspondent. Deux extractions divergentes produiraient
 * des liens morts.
 *
 * Les identifiants sont suffixés en cas de doublon — deux sections peuvent
 * légitimement porter le même titre, mais deux `id` identiques rendraient la
 * seconde inatteignable.
 */
export function extractHeadings(body: string): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];

  for (const line of body.split("\n")) {
    const match = line.match(/^##\s+(.+)$/);
    if (!match) continue;

    const text = match[1].trim();
    const base = slugify(text);
    if (!base) continue;

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count === 0 ? base : `${base}-${count + 1}`, text });
  }

  return headings;
}

/**
 * Sommaire d'un article.
 *
 * Chaque section devient citable par son URL : c'est ce qui permet à
 * quelqu'un de lier un passage précis plutôt que l'article entier.
 *
 * Rendu comme une vraie navigation (`<nav>` + liste) : un lecteur d'écran
 * l'annonce et peut l'atteindre directement.
 */
export function TableOfContents({
  headings,
  label,
}: {
  headings: Heading[];
  label: string;
}) {
  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav
      aria-labelledby="toc-title"
      className="mt-10 rounded-xl border border-slate bg-carbon p-5 sm:p-6"
    >
      <h2
        id="toc-title"
        className="font-mono text-[0.72rem] tracking-[0.16em] text-smoke uppercase"
      >
        {label}
      </h2>
      <ol className="mt-4 space-y-2">
        {headings.map((heading, i) => (
          <li key={heading.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className="numeric shrink-0 text-[0.85rem] text-smoke/60"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={`#${heading.id}`}
              className="text-[0.97rem] leading-[1.6] text-smoke underline-offset-4 transition-colors hover:text-chalk hover:underline"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
