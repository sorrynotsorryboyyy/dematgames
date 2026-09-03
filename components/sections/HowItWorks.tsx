import { JourneySteps } from "@/components/journey/JourneySteps";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";

/**
 * ⚠️ COMPOSANT CONSERVÉ MAIS PLUS RENDU.
 *
 * Le parcours en six étapes s'adresse aux studios et détaille le modèle
 * économique (financement de la production, pourcentage reversé). Il a été
 * retiré de la page d'accueil, qui s'adresse désormais aux joueurs : ces
 * conditions se discutent en privé avec chaque studio.
 *
 * Le composant et son contenu (`content/*.ts`, bloc `how`) sont gardés
 * intacts pour une éventuelle page partenaires, protégée par authentification.
 * Ne pas le remonter sur une page publique sans revoir les étapes 02 et 04.
 */
/**
 * Le parcours, du premier message à la boîte.
 *
 * Les quatre cartes d'étapes ont été remplacées par un parcours en six
 * étapes affichées une à la fois : le récit décrit désormais un service
 * (qui commence par une conversation) plutôt qu'une chaîne de production.
 */
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

      <Reveal delay={1}>
        <JourneySteps
          steps={t.how.steps}
          labels={{
            prev: t.how.navPrev,
            next: t.how.navNext,
            progress: t.how.progress,
          }}
        />
      </Reveal>
    </Section>
  );
}
