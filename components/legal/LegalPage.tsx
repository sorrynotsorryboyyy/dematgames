import type { LegalDoc } from "@/content/legal";
import type { Lang } from "@/content/types";

/**
 * Mise en page commune aux documents légaux.
 *
 * Colonne étroite (~68 caractères) et interlignage généreux : ces pages sont
 * longues et se lisent rarement en entier, mais quand on y vient c'est pour
 * chercher une information précise. Les titres portent des `id` afin qu'un
 * paragraphe puisse être cité par son ancre.
 */
export function LegalPage({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const formatted = new Date(doc.updated).toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="mx-auto max-w-[46rem]">
      <h1 className="display display-lg text-chalk">{doc.title}</h1>

      <p className="mt-5 text-[1.05rem] leading-[1.75] text-smoke">
        {doc.intro}
      </p>

      <p className="mt-4 font-mono text-[0.75rem] tracking-[0.1em] text-smoke/70 uppercase">
        {doc.updatedLabel} : <time dateTime={doc.updated}>{formatted}</time>
      </p>

      <div className="mt-12 space-y-12">
        {doc.blocks.map((block) => {
          const id = slugify(block.heading);
          return (
            <section key={id} aria-labelledby={id}>
              <h2
                id={id}
                className="display text-[1.35rem] text-chalk sm:text-[1.5rem]"
              >
                {block.heading}
              </h2>

              {block.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-[0.98rem] leading-[1.8] text-smoke"
                >
                  {paragraph}
                </p>
              ))}

              {block.bullets && (
                <ul className="mt-4 space-y-2.5">
                  {block.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative pl-5 text-[0.98rem] leading-[1.8] text-smoke before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-ember/70"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}

/**
 * Ancre lisible à partir d'un titre.
 *
 * Les titres sont en français ou en anglais : on retire les accents avant de
 * filtrer, sinon « Propriété intellectuelle » donnerait « propri-t- ».
 */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
