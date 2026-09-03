import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";

/**
 * FAQ — <details>/<summary> natifs : accessibles au clavier, fonctionnels
 * sans JavaScript, et indexables. Aucune librairie d'accordéon nécessaire.
 */
export function Faq({ t }: { t: Content }) {
  return (
    <Section id={ANCHORS.faq} tone="void" labelledBy="faq-title">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <h2 id="faq-title" className="display display-md text-chalk">
            {t.faq.title}
          </h2>
        </Reveal>

        <div className="divide-y divide-slate border-y border-slate">
          {t.faq.items.map((item, i) => (
            <Reveal key={item.title} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-7 text-[1.12rem] font-medium text-chalk transition-colors hover:text-ember [&::-webkit-details-marker]:hidden">
                  {item.title}
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-ember transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 text-[1.05rem] leading-[1.8] text-smoke">
                  {item.body}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
