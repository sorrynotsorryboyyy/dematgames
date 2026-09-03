"use client";

import { Empty, LoadError, Loading } from "@/components/admin/AdminApplications";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/admin-client";
import type { CategoryDoc } from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";

/**
 * Catégories du blog.
 *
 * Supprimer une catégorie ne supprime PAS ses articles : ils repassent en
 * « sans catégorie » (le serveur s'en charge dans un batch). Effacer du
 * contenu publié parce qu'on range une étagère serait une très mauvaise
 * surprise.
 */

const EMPTY = { fr: "", en: "", color: "#c2410c" };

export function AdminCategories({
  getToken,
}: {
  getToken: () => Promise<string | null>;
}) {
  const [items, setItems] = useState<CategoryDoc[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [draft, setDraft] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchCats = useCallback(
    () => adminFetch<{ categories: CategoryDoc[] }>("categories", getToken),
    [getToken],
  );

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchCats>>) => {
      if (result.ok && result.data) {
        setItems(result.data.categories);
        setState("ready");
      } else {
        setState("error");
      }
    },
    [],
  );

  const load = useCallback(() => fetchCats().then(apply), [fetchCats, apply]);

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

  const save = useCallback(async () => {
    if (!draft.fr.trim() && !draft.en.trim()) return;
    setBusy(true);
    await adminFetch("categories", getToken, {
      method: "POST",
      body: {
        id: editing ?? undefined,
        label: { fr: draft.fr, en: draft.en },
        color: draft.color,
        order: items.length,
      },
    });
    setDraft(EMPTY);
    setEditing(null);
    setBusy(false);
    await load();
  }, [draft, editing, items.length, getToken, load]);

  const remove = useCallback(
    async (id: string) => {
      // Confirmation explicite : la suppression détache des articles publiés.
      if (
        !window.confirm(
          "Supprimer cette catégorie ? Les articles associés seront conservés, mais deviendront « sans catégorie ».",
        )
      ) {
        return;
      }
      await adminFetch("categories", getToken, {
        method: "DELETE",
        body: { id },
      });
      await load();
    },
    [getToken, load],
  );

  if (state === "loading") return <Loading />;
  if (state === "error") return <LoadError onRetry={load} />;

  return (
    <div className="space-y-8">
      {/* Formulaire de création / édition */}
      <div className="card p-5">
        <h3 className="display text-[1.05rem] text-chalk">
          {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field
            label="Libellé (FR)"
            value={draft.fr}
            onChange={(v) => setDraft((d) => ({ ...d, fr: v }))}
          />
          <Field
            label="Libellé (EN)"
            value={draft.en}
            onChange={(v) => setDraft((d) => ({ ...d, en: v }))}
          />
          <div>
            <label
              htmlFor="cat-color"
              className="text-[0.85rem] font-medium text-chalk"
            >
              Couleur
            </label>
            <input
              id="cat-color"
              type="color"
              value={draft.color}
              onChange={(e) =>
                setDraft((d) => ({ ...d, color: e.target.value }))
              }
              className="mt-2 h-11 w-16 cursor-pointer rounded-lg border border-slate bg-ash"
            />
          </div>
        </div>

        <p className="mt-3 text-[0.82rem] text-smoke">
          Une seule langue suffit : la catégorie n&apos;apparaîtra que dans
          celle-ci.
        </p>

        <div className="mt-4 flex gap-3">
          <Button type="button" onClick={save} disabled={busy}>
            {editing ? "Enregistrer" : "Créer"}
          </Button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDraft(EMPTY);
              }}
              className="text-[0.9rem] text-smoke underline underline-offset-4"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Empty>Aucune catégorie. Créez-en une ci-dessus.</Empty>
      ) : (
        <ul className="space-y-2">
          {items.map((cat) => (
            <li
              key={cat.id}
              className="card flex flex-wrap items-center gap-4 p-4"
            >
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.98rem] text-chalk">
                  {cat.label.fr ?? "—"}
                  {cat.label.en && (
                    <span className="text-smoke"> · {cat.label.en}</span>
                  )}
                </p>
                <p className="text-[0.82rem] text-smoke">/{cat.slug}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(cat.id);
                    setDraft({
                      fr: cat.label.fr ?? "",
                      en: cat.label.en ?? "",
                      color: cat.color,
                    });
                  }}
                  className="text-[0.85rem] text-smoke underline underline-offset-4 hover:text-chalk"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => remove(cat.id)}
                  className="text-[0.85rem] text-ember underline underline-offset-4"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[0.85rem] font-medium text-chalk">
        {label}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-slate bg-ash px-3 text-[0.95rem] text-chalk transition-colors hover:border-smoke"
        />
      </label>
    </div>
  );
}
