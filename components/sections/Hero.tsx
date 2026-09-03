import { GameBox } from "@/components/box/GameBox";
import { ButtonLink } from "@/components/ui/Button";
import type { Content, Lang } from "@/content/types";
import { ANCHORS, path } from "@/lib/i18n";

/**
 * Hero — tout se joue ici : le test des 10 secondes.
 *
 * L'accroche (« Oubliez le téléchargement. / Gardez le jeu. ») vient de
 * l'ancienne section manifesto, remontée ici pour que la promesse arrive dès
 * le premier écran. Le badge est conservé sous elle : l'accroche porte
 * l'intention, le badge dit ce que fait concrètement le service.
 *
 * CTA principal vers la boutique (l'offre s'y découvre par l'exemple),
 * secondaire vers le formulaire des studios fondateurs.
 */
export function Hero({ t, lang }: { t: Content; lang: Lang }) {
  return (
    <section className="relative isolate overflow-hidden bg-void pt-[4.5rem]">
      {/* Grille technique — côté « digital » du contraste, estompée aux bords. */}
      <div
        aria-hidden="true"
        className="grid-tech fade-edges absolute inset-0 opacity-50"
      />
      {/* Halo chaud très diffus — remplace la lueur néon du thème sombre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full opacity-[0.10] blur-[130px]"
        style={{ background: "radial-gradient(circle, #c2410c, transparent 70%)" }}
      />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1240px] items-center gap-10 px-5 pb-20 pt-10 sm:px-8 md:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-12 lg:pb-28 lg:pt-14">
        <div>
          {/* Accroche — remontée de l'ancienne section manifesto. */}
          <p className="display display-md mb-6 text-smoke">
            {t.hero.tagline[0]}
            <br />
            <span className="text-chalk">{t.hero.tagline[1]}</span>
          </p>

          {/* Badge */}
          <p className="inline-flex items-center gap-2.5 rounded-full border border-slate bg-ash px-4 py-1.5 text-[0.78rem] font-medium text-smoke shadow-[var(--shadow-soft)]">
            <span
              aria-hidden="true"
              className="animate-pulse-dot inline-block size-1.5 rounded-full bg-ember"
            />
            {t.hero.badge}
          </p>

          {/* Titre — les sauts de ligne sont structurels.
              Plus de `uppercase` : les capitales intégrales tiraient le ton
              vers le gaming et excluaient les jeux familiaux. */}
          <h1 className="display display-xl mt-7 text-chalk">
            {t.hero.titleLines[0]}
            <br />
            {t.hero.titleLines[1]}
            <br />
            <span className="relative inline-block">
              {t.hero.titleLines[2]}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-ember"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-lg text-[1.08rem] leading-[1.7] text-smoke sm:text-[1.15rem]">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href={path("shop", lang)} variant="primary" size="lg">
              {t.hero.ctaPrimary}
            </ButtonLink>
            <ButtonLink href={`#${ANCHORS.opening}`} variant="ghost" size="lg">
              {t.hero.ctaSecondary}
              <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>

          {/* Réassurance : les trois objections levées avant qu'elles arrivent. */}
          <ul className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[0.9rem] text-smoke">
            {t.hero.reassurance.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="text-ember"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Le boîtier */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="py-8 lg:py-0">
            <GameBox
              title="Nocturne"
              studio="Pale Moth Studio"
              width="clamp(196px, 30vw, 320px)"
              pose="hero"
              hue={8}
            />
          </div>
        </div>
      </div>

      {/* Indicateur de scroll, discret. */}
      <div className="relative z-[2] hidden justify-center pb-10 md:flex">
        <span className="animate-scroll-hint flex flex-col items-center gap-2 text-[0.75rem] font-medium tracking-wide text-smoke">
          {t.hero.scrollHint}
          <span aria-hidden="true" className="block h-8 w-px bg-gradient-to-b from-smoke to-transparent" />
        </span>
      </div>
    </section>
  );
}
