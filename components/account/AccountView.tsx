"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import type { Content, Lang } from "@/content/types";
import { ANCHORS, path } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useState } from "react";

/**
 * Tableau de bord du compte — MAQUETTE.
 *
 * Ce n'est PAS une route protégée : il n'y a pas de serveur d'authentification.
 * Sans session locale, la page affiche une invitation à se connecter plutôt
 * qu'une redirection, ce qui reflète honnêtement ce que fait le code.
 */
type Tab = "profile" | "orders" | "games";

export function AccountView({ lang, t }: { lang: Lang; t: Content }) {
  const { user, ready, signOut } = useSession();
  const [tab, setTab] = useState<Tab>("profile");

  // Le temps de lire le localStorage : ni « connecté » ni « invité ».
  // Le titre est rendu quand même — c'est l'état prérendu côté serveur, et
  // une page sans <h1> serait un défaut d'accessibilité dans le HTML statique.
  if (!ready) {
    return (
      <>
        <h1 className="display display-lg text-chalk">{t.account.title}</h1>
        <div className="h-64" aria-hidden="true" />
      </>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="sr-only">{t.account.title}</h1>
        <p className="display display-lg text-chalk">{t.account.guestTitle}</p>
        <p className="mt-5 text-[1.02rem] leading-[1.7] text-smoke">
          {t.account.guestBody}
        </p>
        <ButtonLink href={path("login", lang)} className="mt-8" size="lg">
          {t.nav.login}
        </ButtonLink>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: t.account.tabs.profile },
    { id: "orders", label: t.account.tabs.orders },
    { id: "games", label: t.account.tabs.games },
  ];

  return (
    <>
      <h1 className="display display-lg text-chalk">{t.account.title}</h1>
      <div className="mt-4 flex items-center gap-3">
        {/* Photo Google. <img> plutôt que next/image : l'URL vient d'un
            domaine externe variable (googleusercontent), et configurer
            remotePatterns pour un avatar de 40 px n'en vaut pas le coût. */}
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border border-slate"
            referrerPolicy="no-referrer"
          />
        )}
        <p className="text-[0.95rem] text-smoke">
          {t.account.signedInAs}{" "}
          <span className="font-medium text-chalk">{user.name}</span>
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t.account.title}
        className="mt-9 flex flex-wrap gap-1 rounded-xl border border-slate bg-carbon p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-5 py-2.5 text-[0.9rem] font-medium transition-all ${
              tab === item.id
                ? "bg-ash text-chalk shadow-[var(--shadow-soft)]"
                : "text-smoke hover:text-chalk"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "profile" && (
          <Panel id="profile">
            <dl className="space-y-5">
              <div>
                <dt className="text-[0.85rem] text-smoke">
                  {t.account.profileName}
                </dt>
                <dd className="mt-1 text-[1.05rem] text-chalk">{user.name}</dd>
              </div>
              <div>
                <dt className="text-[0.85rem] text-smoke">
                  {t.account.profileEmail}
                </dt>
                <dd className="mt-1 text-[1.05rem] text-chalk">{user.email}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="ghost"
              onClick={signOut}
              className="mt-8"
            >
              {t.nav.logout}
            </Button>
          </Panel>
        )}

        {tab === "orders" && (
          <Panel id="orders">
            <p className="text-[1.02rem] leading-[1.7] text-smoke">
              {t.account.noOrders}
            </p>
          </Panel>
        )}

        {tab === "games" && (
          <Panel id="games">
            <p className="text-[1.02rem] leading-[1.7] text-smoke">
              {t.account.noGames}
            </p>
            <ButtonLink
              href={`/${lang}#${ANCHORS.founding}`}
              className="mt-6"
            >
              {t.account.noGamesCta}
            </ButtonLink>
          </Panel>
        )}
      </div>
    </>
  );
}

function Panel({ id, children }: { id: Tab; children: React.ReactNode }) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="card p-7 sm:p-9"
    >
      {children}
    </div>
  );
}
