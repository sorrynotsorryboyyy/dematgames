import { BoxShelf } from "@/components/box/BoxShelf";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, Section } from "@/components/ui/Section";
import type { Content } from "@/content/types";

/**
 * Section émotionnelle — le cœur du contraste DIGITAL / PHYSICAL.
 *
 * Les deux lignes du titre sont traitées différemment : la « digitale » en gris
 * plat et monospace, la « physique » en blanc, avec relief et grain. La forme
 * dit la même chose que le texte.
 */
export function WhyNow({ t }: { t: Content }) {
  return (
    <Section tone="void" grain labelledBy="why-title">
      <Reveal>
        <Eyebrow>{t.whyNow.eyebrow}</Eyebrow>
      </Reveal>

      <h2 id="why-title" className="mt-8">
        <Reveal>
          <span className="display display-lg block text-smoke">
            {t.whyNow.lineDigital}
          </span>
        </Reveal>
        <Reveal delay={1}>
          <span className="display display-lg mt-2 block text-chalk">
            {t.whyNow.linePhysical}
          </span>
        </Reveal>
      </h2>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal delay={2}>
          <blockquote className="border-l-2 border-ember pl-6">
            <p className="text-[1.2rem] leading-[1.55] text-chalk sm:text-[1.4rem]">
              {t.whyNow.quote}
            </p>
          </blockquote>
        </Reveal>
        <Reveal delay={3}>
          <p className="text-[1.05rem] leading-[1.75] text-smoke lg:text-[1.15rem]">
            {t.whyNow.body}
          </p>
        </Reveal>
      </div>

      <Reveal delay={2} className="mt-16 md:mt-20">
        <BoxShelf caption={t.whyNow.shelfCaption} />
      </Reveal>
    </Section>
  );
}
