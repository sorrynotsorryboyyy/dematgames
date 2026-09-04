import { FloatingCover } from "@/components/box/FloatingCover";
import { GameBox } from "@/components/box/GameBox";
import { GAMES } from "@/content/games";
import { imageUrl } from "@/lib/images";
import Link from "next/link";
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
  // Le titre en vitrine d'abord, puis les autres éditions maison. Deux au
  // maximum : à trois, la composition en éventail devient illisible sur un
  // écran de téléphone.
  const shown = [
    ...GAMES.filter((g) => g.featured),
    ...GAMES.filter((g) => g.ownEdition && !g.featured),
  ].slice(0, 2);

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

        {/* Les jaquettes du catalogue, cliquables vers leur fiche.
            Auparavant un boîtier générique codé en dur ; l'accueil montre
            désormais les éditions réelles. */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="py-8 lg:py-0">
            {shown.length > 0 ? (
              <div className="flex items-center justify-center -space-x-10 sm:-space-x-14 lg:-space-x-16">
                {shown.map((game, i) => {
                  const cover = imageUrl(game.coverId, { width: 640 });
                  if (!cover) return null;
                  return (
                    <Link
                      key={game.slug}
                      href={path("shop", lang, game.slug)}
                      aria-label={`${game.title} — ${game.studio}`}
                      // Le survol passe la jaquette au-dessus de sa voisine :
                      // sans cela, celle de derrière resterait tronquée
                      // pendant qu'on la regarde.
                      className="rounded-[6px] transition-[z-index] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember hover:z-20"
                      style={{ zIndex: shown.length - i }}
                    >
                      <FloatingCover
                        src={cover}
                        // La première jaquette domine ; la seconde est en
                        // retrait, ce qui donne la profondeur.
                        width={i === 0 ? 250 : 210}
                        rotate={i === 0 ? -4 : 6}
                        // Déphasage : à l'unisson, la boucle CSS se voit.
                        delay={i * 1200}
                        priority={i === 0}
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <GameBox
                title="dematgames"
                studio="Édition physique"
                width="clamp(196px, 30vw, 320px)"
                pose="hero"
                hue={8}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
