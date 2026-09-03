import { ApplyForm } from "@/components/sections/ApplyForm";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Section";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";

/**
 * Section la plus importante de la page : tout le reste sert à amener ici.
 *
 * Traitement visuel distinct (liseré ember, surface plus claire) pour qu'elle
 * se détache immédiatement lors d'un scroll rapide.
 */
export function Founding({ t }: { t: Content }) {
  return (
    <section
      id={ANCHORS.founding}
      aria-labelledby="founding-title"
      className="relative isolate overflow-hidden bg-carbon"
    >
      {/* Halo chaud : signale le point d'arrivée de la page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-[0.10] blur-[100px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, #c2410c, transparent 70%)",
        }}
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 md:py-24 lg:px-12 lg:py-28">
        <div className="rounded-2xl border border-slate border-t-2 border-t-ember bg-ash p-8 shadow-[var(--shadow-lift)] sm:p-12 lg:p-16">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow withDot>{t.founding.eyebrow}</Eyebrow>
              </Reveal>

              <Reveal delay={1}>
                <h2
                  id="founding-title"
                  className="display mt-7 text-[clamp(1.75rem,3.9vw,2.9rem)] text-chalk"
                >
                  {t.founding.title}
                </h2>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-7 max-w-md text-[1.05rem] leading-[1.75] text-smoke lg:text-[1.12rem]">
                  {t.founding.body}
                </p>
              </Reveal>

            </div>

            <Reveal delay={2}>
              <ApplyForm t={t} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
