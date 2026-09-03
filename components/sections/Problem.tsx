import { Reveal } from "@/components/ui/Reveal";
import { Band, Section } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";

export function Problem({ t }: { t: Content }) {
  return (
    <>
      <Section id={ANCHORS.problem} tone="carbon" labelledBy="problem-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <h2 id="problem-title" className="display display-lg text-chalk">
              {t.problem.titleLines[0]}
              <br />
              <span className="text-smoke">{t.problem.titleLines[1]}</span>
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <p className="max-w-xl text-[1.05rem] leading-[1.75] text-smoke lg:mt-3 lg:text-[1.15rem]">
              {t.problem.body}
            </p>
          </Reveal>
        </div>

        {/* Grille de cartes. L'étagère en bois a été retirée : la métaphore
            alourdissait la section sans rien ajouter au propos. */}
        <ul className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3">
          {t.problem.cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={(i + 1) as 1 | 2 | 3}>
              <TiltCard className="card p-8 lg:p-9">
                <span
                  aria-hidden="true"
                  className="numeric inline-flex size-8 items-center justify-center rounded-lg bg-[var(--color-ember-soft)] text-[0.8rem] font-semibold text-ember"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-5 text-xl text-chalk lg:text-[1.35rem]">
                  {card.title}
                </h3>
                <p className="mt-3.5 text-[1.02rem] leading-[1.7] text-smoke">
                  {card.body}
                </p>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Transition — la bascule du problème vers la solution. */}
      <Band>
        <Reveal>
          <p className="display display-md text-center text-smoke">
            <span className="text-chalk">dematgames.gg</span>{" "}
            {/* Le nom de marque est fixe ; seule la suite est traduite. */}
            {t.problem.transition.replace("dematgames.gg ", "")}
          </p>
        </Reveal>
      </Band>
    </>
  );
}
