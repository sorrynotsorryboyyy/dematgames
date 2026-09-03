"use client";

import { Empty, LoadError, Loading } from "@/components/admin/AdminApplications";
import { Button } from "@/components/ui/Button";
import { LANGS, type Lang } from "@/content/types";
import { adminFetch } from "@/lib/admin-client";
import type { CategoryDoc, PostDoc } from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";

/**
 * Articles du blog.
 *
 * Bilingue OPTIONNEL : un article peut n'exister qu'en français. Les pages
 * publiques ne le listent alors que dans cette langue, ce qui préserve la
 * règle de pureté linguistique sans obliger à tout traduire.
 *
 * ARTICLE SPONSORISÉ — le nom de l'annonceur est obligatoire, et le serveur
 * le refuse s'il manque. La loi française impose que tout contenu
 * publicitaire soit identifiable comme tel : une mention « Sponsorisé » sans
 * annonceur ne remplirait pas cette obligation.
 */

interface Draft {
  id?: string;
  slug: string;
  status: "draft" | "published";
  categoryId: string;
  coverId: string;
  sponsored: boolean;
  sponsorName: string;
  sponsorUrl: string;
  content: Record<Lang, { title: string; excerpt: string; body: string }>;
}

const EMPTY_DRAFT: Draft = {
  slug: "",
  status: "draft",
  categoryId: "",
  coverId: "",
  sponsored: false,
  sponsorName: "",
  sponsorUrl: "",
  content: {
    fr: { title: "", excerpt: "", body: "" },
    en: { title: "", excerpt: "", body: "" },
  },
};

export function AdminPosts({
  getToken,
}: {
  getToken: () => Promise<string | null>;
}) {
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchAll = useCallback(
    () =>
      Promise.all([
        adminFetch<{ posts: PostDoc[] }>("posts", getToken),
        adminFetch<{ categories: CategoryDoc[] }>("categories", getToken),
      ]),
    [getToken],
  );

  const apply = useCallback(
    ([p, c]: Awaited<ReturnType<typeof fetchAll>>) => {
      if (p.ok && p.data) {
        setPosts(p.data.posts);
        if (c.ok && c.data) setCategories(c.data.categories);
        setState("ready");
      } else {
        setState("error");
      }
    },
    [],
  );

  const load = useCallback(() => fetchAll().then(apply), [fetchAll, apply]);

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
    if (!draft) return;
    setNotice("");
    setBusy(true);

    const result = await adminFetch<{ id: string }>("posts", getToken, {
      method: "POST",
      body: draft,
    });
    setBusy(false);

    if (!result.ok) {
      setNotice(
        result.error === "sponsor_required"
          ? "Un article sponsorisé doit indiquer le nom de l'annonceur."
          : result.error === "no_content"
            ? "Renseignez au moins un titre, dans une langue."
            : "L'enregistrement a échoué.",
      );
      return;
    }
    setDraft(null);
    await load();
  }, [draft, getToken, load]);

  const remove = useCallback(
    async (id: string) => {
      if (!window.confirm("Supprimer définitivement cet article ?")) return;
      await adminFetch("posts", getToken, { method: "DELETE", body: { id } });
      await load();
    },
    [getToken, load],
  );

  const edit = useCallback((post: PostDoc) => {
    setDraft({
      id: post.id,
      slug: post.slug,
      status: post.status,
      categoryId: post.categoryId ?? "",
      coverId: post.coverId ?? "",
      sponsored: post.sponsored,
      sponsorName: post.sponsorName ?? "",
      sponsorUrl: post.sponsorUrl ?? "",
      content: {
        fr: post.content.fr ?? { title: "", excerpt: "", body: "" },
        en: post.content.en ?? { title: "", excerpt: "", body: "" },
      },
    });
  }, []);

  if (state === "loading") return <Loading />;
  if (state === "error") return <LoadError onRetry={load} />;

  // --- Éditeur ---
  if (draft) {
    const c = draft.content[lang];
    const setContent = (field: "title" | "excerpt" | "body", value: string) =>
      setDraft((d) =>
        d
          ? {
              ...d,
              content: {
                ...d.content,
                [lang]: { ...d.content[lang], [field]: value },
              },
            }
          : d,
      );

    return (
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="display text-[1.15rem] text-chalk">
            {draft.id ? "Modifier l'article" : "Nouvel article"}
          </h3>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="text-[0.9rem] text-smoke underline underline-offset-4"
          >
            Fermer
          </button>
        </div>

        {notice && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-3 text-[0.9rem] text-chalk"
          >
            {notice}
          </p>
        )}

        {/* Bascule de langue : les deux versions coexistent dans le même
            brouillon, on n'en édite qu'une à la fois. */}
        <div className="mt-5 flex gap-1 rounded-lg border border-slate bg-carbon p-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded px-4 py-1.5 text-[0.85rem] font-medium uppercase transition-all ${
                lang === l ? "bg-ash text-chalk" : "text-smoke hover:text-chalk"
              }`}
            >
              {l}
              {draft.content[l].title && (
                <span className="ml-1.5 text-ember">•</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <Input
            label="Titre"
            value={c.title}
            onChange={(v) => setContent("title", v)}
          />
          <Input
            label="Chapô"
            value={c.excerpt}
            onChange={(v) => setContent("excerpt", v)}
          />
          <div>
            <label className="text-[0.85rem] font-medium text-chalk">
              Contenu (Markdown)
              <textarea
                rows={14}
                value={c.body}
                onChange={(e) => setContent("body", e.target.value)}
                className="mt-2 w-full resize-y rounded-lg border border-slate bg-ash px-3 py-2.5 font-mono text-[0.88rem] leading-relaxed text-chalk transition-colors hover:border-smoke"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate pt-6 sm:grid-cols-2">
          <div>
            <label className="text-[0.85rem] font-medium text-chalk">
              Catégorie
              <select
                value={draft.categoryId}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, categoryId: e.target.value } : d))
                }
                className="mt-2 h-11 w-full appearance-none rounded-lg border border-slate bg-ash px-3 text-[0.95rem] text-chalk"
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label.fr ?? cat.label.en ?? cat.slug}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="text-[0.85rem] font-medium text-chalk">
              État
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) =>
                    d
                      ? { ...d, status: e.target.value as Draft["status"] }
                      : d,
                  )
                }
                className="mt-2 h-11 w-full appearance-none rounded-lg border border-slate bg-ash px-3 text-[0.95rem] text-chalk"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </label>
          </div>

          <Input
            label="Image de couverture (identifiant Cloudinary)"
            value={draft.coverId}
            onChange={(v) => setDraft((d) => (d ? { ...d, coverId: v } : d))}
          />
          <Input
            label="Slug (laisser vide pour le déduire du titre)"
            value={draft.slug}
            onChange={(v) => setDraft((d) => (d ? { ...d, slug: v } : d))}
          />
        </div>

        {/* Sponsorisation */}
        <div className="mt-6 border-t border-slate pt-6">
          <label className="flex items-center gap-3 text-[0.95rem] text-chalk">
            <input
              type="checkbox"
              checked={draft.sponsored}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, sponsored: e.target.checked } : d))
              }
              className="size-4 accent-[var(--color-ember)]"
            />
            Article sponsorisé
          </label>

          {draft.sponsored && (
            <>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-smoke">
                La mention « Sponsorisé » et le nom de l&apos;annonceur seront
                affichés sur l&apos;article et dans les listes. C&apos;est une
                obligation légale, pas une option.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Annonceur (obligatoire)"
                  value={draft.sponsorName}
                  onChange={(v) =>
                    setDraft((d) => (d ? { ...d, sponsorName: v } : d))
                  }
                />
                <Input
                  label="Lien de l'annonceur"
                  value={draft.sponsorUrl}
                  onChange={(v) =>
                    setDraft((d) => (d ? { ...d, sponsorUrl: v } : d))
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" onClick={save} disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    );
  }

  // --- Liste ---
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.9rem] text-smoke">
          {posts.length} article{posts.length > 1 ? "s" : ""}
        </p>
        <Button type="button" onClick={() => setDraft({ ...EMPTY_DRAFT })}>
          Nouvel article
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="mt-6">
          <Empty>Aucun article. Créez-en un pour démarrer le blog.</Empty>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[1rem] font-medium text-chalk">
                  {post.content.fr?.title ?? post.content.en?.title ?? "—"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.82rem] text-smoke">
                  <span>/{post.slug}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 ${
                      post.status === "published"
                        ? "border-[#15803d]/40 bg-[#15803d]/10 text-[#15803d]"
                        : "border-slate bg-carbon"
                    }`}
                  >
                    {post.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                  {post.sponsored && (
                    <span className="rounded-full border border-ember/45 bg-[var(--color-ember-soft)] px-2 py-0.5 text-ember">
                      Sponsorisé
                    </span>
                  )}
                  {LANGS.filter((l) => post.content[l]?.title).map((l) => (
                    <span key={l} className="uppercase">
                      {l}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => edit(post)}
                  className="text-[0.85rem] text-smoke underline underline-offset-4 hover:text-chalk"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => remove(post.id)}
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[0.85rem] font-medium text-chalk">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate bg-ash px-3 text-[0.95rem] font-normal text-chalk transition-colors hover:border-smoke"
      />
    </label>
  );
}
