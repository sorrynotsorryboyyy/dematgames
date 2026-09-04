"use client";

import { AdminApplications } from "@/components/admin/AdminApplications";
import { AdminSubscribers } from "@/components/admin/AdminSubscribers";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminPosts } from "@/components/admin/AdminPosts";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { ButtonLink } from "@/components/ui/Button";
import type { Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useState } from "react";

/**
 * Console d'administration.
 *
 * DEUX NIVEAUX DE PROTECTION
 *
 * 1. Ici, côté client : on n'affiche rien à qui n'est pas admin. C'est du
 *    confort, pas de la sécurité — le code d'une page est toujours lisible.
 * 2. Côté serveur, dans chaque route /api/admin/* : le jeton est vérifié et
 *    le rôle relu depuis Firestore. C'est la seule barrière qui compte.
 *
 * Autrement dit, un curieux peut voir la coquille de l'admin ; il n'en
 * obtiendra aucune donnée.
 */

type Tab =
  | "applications"
  | "subscribers"
  | "posts"
  | "categories"
  | "users";

const TABS: { id: Tab; label: string }[] = [
  { id: "applications", label: "Candidatures" },
  { id: "subscribers", label: "Inscrits" },
  { id: "posts", label: "Articles" },
  { id: "categories", label: "Catégories" },
  { id: "users", label: "Utilisateurs" },
];

export function AdminShell({ lang }: { lang: Lang }) {
  const { user, ready, getToken } = useSession();
  const [tab, setTab] = useState<Tab>("applications");

  // Tant que Firebase n'a pas répondu, on n'affiche ni « accès refusé » ni
  // le contenu : un flash de refus serait déroutant pour un vrai admin.
  if (!ready) {
    return <div className="h-64" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Blocked
        title="Connexion requise"
        body="Cette page est réservée aux administrateurs."
        action={
          <ButtonLink href={path("login", lang)} size="lg">
            Se connecter
          </ButtonLink>
        }
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Blocked
        title="Accès refusé"
        body={`Votre compte (${user.email}) n'a pas les droits d'administration.`}
        action={
          <ButtonLink href={`/${lang}`} variant="ghost" size="lg">
            Retour au site
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="display display-lg text-chalk">Administration</h1>
        <p className="text-[0.9rem] text-smoke">
          {user.name} · <span className="text-ember">admin</span>
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Sections de l'administration"
        className="mt-8 flex flex-wrap gap-1 rounded-xl border border-slate bg-carbon p-1"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            id={`admin-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`admin-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2.5 text-[0.9rem] font-medium transition-all ${
              tab === item.id
                ? "bg-ash text-chalk shadow-[var(--shadow-soft)]"
                : "text-smoke hover:text-chalk"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`admin-panel-${tab}`}
        aria-labelledby={`admin-tab-${tab}`}
        tabIndex={0}
        className="mt-8 outline-none"
      >
        {tab === "applications" && <AdminApplications getToken={getToken} />}
        {tab === "subscribers" && <AdminSubscribers getToken={getToken} />}
        {tab === "posts" && <AdminPosts getToken={getToken} />}
        {tab === "categories" && <AdminCategories getToken={getToken} />}
        {tab === "users" && (
          <AdminUsers getToken={getToken} currentUid={user.uid} />
        )}
      </div>
    </>
  );
}

function Blocked({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="display display-lg text-chalk">{title}</h1>
      <p className="mt-5 text-[1.02rem] leading-[1.7] text-smoke">{body}</p>
      <div className="mt-8">{action}</div>
    </div>
  );
}
