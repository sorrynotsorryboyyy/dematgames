import { ProblemShelf } from "@/components/box/ProblemShelf";
import { Reveal } from "@/components/ui/Reveal";
import { Band, Section } from "@/components/ui/Section";
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

        {/* Les trois obstacles, rangés sur une étagère vide de jeux —
            c'est le propos du titre juste au-dessus. */}
        <ProblemShelf cards={t.problem.cards} />

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
