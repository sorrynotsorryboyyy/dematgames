"use client";

import { adminFetch } from "@/lib/admin-client";
import {
  APPLICATION_STATUSES,
  type ApplicationDoc,
  type ApplicationStatus,
} from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";

/**
 * Candidatures reçues par le formulaire « Studios fondateurs ».
 *
 * C'est l'écran le plus utile de l'admin : c'est là qu'arrivent les studios,
 * et c'est le seul endroit où les lire depuis que le formulaire persiste
 * dans Firestore.
 */

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  accepted: "Acceptée",
  declined: "Refusée",
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: "border-ember/45 bg-[var(--color-ember-soft)] text-ember",
  contacted: "border-slate bg-carbon text-smoke",
  accepted: "border-[#15803d]/40 bg-[#15803d]/10 text-[#15803d]",
  declined: "border-slate bg-carbon text-smoke line-through",
};

export function AdminApplications({
  getToken,
}: {
  getToken: () => Promise<string | null>;
}) {
  const [items, setItems] = useState<ApplicationDoc[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState<string | null>(null);

  /** Récupération pure : aucun état touché ici. */
  const fetchItems = useCallback(
    () =>
      adminFetch<{ applications: ApplicationDoc[] }>("applications", getToken),
    [getToken],
  );

  /** Applique un résultat à l'état. Appelé depuis un callback, jamais
      directement dans le corps d'un effet. */
  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchItems>>) => {
      if (result.ok && result.data) {
        setItems(result.data.applications);
        setState("ready");
      } else {
        setState("error");
      }
    },
    [],
  );

  const load = useCallback(
    () => fetchItems().then(apply),
    [fetchItems, apply],
  );

  useEffect(() => {
    // `load` est async : son setState se produit dans une continuation, pas
    // dans le corps de l'effet. Le drapeau `cancelled` évite d'écrire sur un
    // composant démonté si l'admin change d'onglet pendant la requête.
    let cancelled = false;
    void load().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const setStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      // Mise à jour optimiste : l'écriture est déjà partie, attendre le
      // rechargement rendrait l'interface molle.
      setItems((list) =>
        list.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      await adminFetch("applications", getToken, {
        method: "PATCH",
        body: { id, status },
      });
    },
    [getToken],
  );

  if (state === "loading") return <Loading />;
  if (state === "error") return <LoadError onRetry={load} />;
  if (items.length === 0) {
    return (
      <Empty>
        Aucune candidature pour l&apos;instant. Elles arriveront ici dès qu&apos;un
        studio remplira le formulaire.
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[0.9rem] text-smoke">
        {items.length} candidature{items.length > 1 ? "s" : ""}
      </p>

      {items.map((app) => {
        const expanded = open === app.id;
        return (
          <article key={app.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="display text-[1.1rem] text-chalk">{app.game}</h3>
                <p className="mt-1 text-[0.9rem] text-smoke">
                  {app.name} ·{" "}
                  <a
                    href={`mailto:${app.email}`}
                    className="underline underline-offset-2 hover:text-chalk"
                  >
                    {app.email}
                  </a>
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-[0.78rem] font-medium ${STATUS_STYLES[app.status]}`}
              >
                {STATUS_LABELS[app.status]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(expanded ? null : app.id)}
              aria-expanded={expanded}
              className="mt-3 text-[0.85rem] text-smoke underline underline-offset-4 transition-colors hover:text-chalk"
            >
              {expanded ? "Masquer" : "Voir le détail"}
            </button>

            {/* Le détail reste monté quand il est replié : le contenu est
                court, et le démonter perdrait la position de défilement. */}
            <div hidden={!expanded} className="mt-4 space-y-3 border-t border-slate pt-4">
              <Row label="Plateforme" value={app.platform} />
              <Row
                label="Lien"
                value={
                  <a
                    href={app.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-ember underline underline-offset-2"
                  >
                    {app.link}
                  </a>
                }
              />
              {app.message && <Row label="Message" value={app.message} />}
              <Row
                label="Reçue le"
                value={new Date(app.createdAt).toLocaleString("fr-FR")}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                {APPLICATION_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(app.id, status)}
                    aria-pressed={app.status === status}
                    className={`rounded-lg border px-3 py-1.5 text-[0.82rem] transition-all ${
                      app.status === status
                        ? "border-ember bg-[var(--color-ember-soft)] text-chalk"
                        : "border-slate bg-ash text-smoke hover:border-smoke"
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_1fr]">
      <span className="text-[0.82rem] text-smoke">{label}</span>
      <span className="text-[0.95rem] leading-relaxed text-chalk">{value}</span>
    </div>
  );
}

export function Loading() {
  return (
    <p role="status" className="text-[0.95rem] text-smoke">
      Chargement…
    </p>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-ember/45 bg-[var(--color-ember-soft)] p-5">
      <p className="text-[0.95rem] text-chalk">
        Impossible de charger les données.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-[0.9rem] text-ember underline underline-offset-4"
      >
        Réessayer
      </button>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-slate bg-carbon p-6 text-[0.98rem] leading-relaxed text-smoke">
      {children}
    </p>
  );
}
