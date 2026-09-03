import { DeliveryScene } from "@/components/box/DeliveryScene";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";

export function HowItWorks({ t }: { t: Content }) {
  return (
    <Section id={ANCHORS.how} tone="void" labelledBy="how-title">
      <Reveal className="max-w-2xl">
        <h2 id="how-title" className="display display-lg text-chalk">
          {t.how.title}
        </h2>
        <p className="mt-6 text-[1.05rem] leading-[1.75] text-smoke lg:text-[1.15rem]">
          {t.how.intro}
        </p>
      </Reveal>

      {/* Étapes en cartes : plus lisibles qu'une timeline filaire sur fond
          clair, et cohérentes avec le reste des surfaces « objet ». */}
      <ol className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
        {t.how.steps.map((step, i) => (
          <Reveal as="li" key={step.n} delay={(i + 1) as 1 | 2 | 3 | 4}>
            <TiltCard subtle className="card p-7">
              <span className="numeric inline-flex size-8 items-center justify-center rounded-lg bg-[var(--color-ember-soft)] text-[0.8rem] font-semibold text-ember">
                {step.n}
              </span>
              <h3 className="display mt-5 text-[1.15rem] text-chalk lg:text-[1.25rem]">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[0.98rem] leading-[1.65] text-smoke">
                {step.body}
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </ol>

      <DeliveryScene
        labels={t.how.pipeline.labels}
        caption={t.how.pipeline.caption}
      />
    </Section>
  );
}
