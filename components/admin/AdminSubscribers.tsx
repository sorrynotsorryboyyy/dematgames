"use client";

import { adminFetch } from "@/lib/admin-client";
import { useCallback, useEffect, useState } from "react";

/**
 * Inscrits à l'alerte d'ouverture, et envoi de campagnes.
 *
 * La collection se remplissait depuis la landing sans qu'aucun écran ne
 * permette de la consulter : impossible de prévenir qui que ce soit le jour
 * de l'ouverture, ce qui vidait le formulaire d'accueil de son sens.
 *
 * TROIS GARDE-FOUS, tous délibérés :
 *
 * 1. Un envoi d'essai est proposé AVANT la campagne, et rien n'oblige à le
 *    faire — mais un message parti à toute la liste ne se rattrape pas.
 * 2. Une confirmation explicite précède l'envoi réel, avec le nombre de
 *    destinataires : « envoyer » ne doit jamais être un clic distrait.
 * 3. Le lien de désinscription est ajouté côté SERVEUR, jamais ici : il est
 *    obligatoire (art. L34-5), et le rendre facultatif dans l'interface
 *    permettrait de l'oublier.
 */

interface Subscriber {
  id: string;
  email: string;
  createdAt: number;
  source: string;
}

interface SendResult {
  total?: number;
  sent: number;
  failed: number;
  test?: boolean;
  sample?: string[];
  error?: string;
}

export function AdminSubscribers({
  getToken,
}: {
  getToken: () => Promise<string | null>;
}) {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [mailReady, setMailReady] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  /** Récupération pure : aucun état touché ici. */
  const fetchItems = useCallback(
    () =>
      adminFetch<{ subscribers: Subscriber[]; mailConfigured: boolean }>(
        "subscribers",
        getToken,
      ),
    [getToken],
  );

  const apply = useCallback(
    (res: Awaited<ReturnType<typeof fetchItems>>) => {
      if (res.ok && res.data) {
        setItems(res.data.subscribers);
        setMailReady(res.data.mailConfigured);
        setState("ready");
      } else {
        setState("error");
      }
    },
    [],
  );

  const load = useCallback(() => {
    fetchItems().then(apply);
  }, [fetchItems, apply]);

  useEffect(() => {
    fetchItems().then(apply);
  }, [fetchItems, apply]);

  async function remove(sub: Subscriber) {
    if (!confirm(`Retirer ${sub.email} de la liste ?`)) return;
    const res = await adminFetch("subscribers", getToken, {
      method: "DELETE",
      body: { id: sub.id },
    });
    if (res.ok) setItems((list) => list.filter((s) => s.id !== sub.id));
  }

  /**
   * Export CSV, généré dans le navigateur depuis les données déjà chargées.
   *
   * Le BOM UTF-8 en tête n'est pas décoratif : sans lui, Excel affiche les
   * accents en charabia, et c'est le tableur avec lequel cette liste sera
   * ouverte neuf fois sur dix.
   */
  function exportCsv() {
    const rows = [
      ["email", "date_inscription", "source"],
      ...items.map((s) => [
        s.email,
        s.createdAt ? new Date(s.createdAt).toISOString() : "",
        s.source,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscrits-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function send(test: boolean) {
    setSending(true);
    setResult(null);
    const res = await adminFetch<SendResult>("subscribers", getToken, {
      method: "POST",
      body: { subject, body, test, testEmail },
    });
    setSending(false);
    setConfirming(false);
    setResult(
      res.ok && res.data
        ? res.data
        : { sent: 0, failed: 0, error: res.error ?? "échec" },
    );
    if (!test) load();
  }

  if (state === "loading") {
    return <p className="text-[0.95rem] text-smoke">Chargement…</p>;
  }

  if (state === "error") {
    return (
      <div className="rounded-xl border border-ember/45 bg-[var(--color-ember-soft)] p-5">
        <p className="text-[0.95rem] text-chalk">
          Impossible de charger les données.
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-2 text-[0.9rem] text-ember underline underline-offset-4"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const canSend = mailReady && subject.trim() && body.trim() && !sending;

  return (
    <div className="space-y-8">
      {/* --- Liste --- */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="display text-[1.15rem] text-chalk">
            {items.length} inscrit{items.length > 1 ? "s" : ""}
          </h2>
          {items.length > 0 && (
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-slate px-3 py-2 text-[0.88rem] text-smoke transition-colors hover:border-smoke hover:text-chalk"
            >
              Exporter en CSV
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate bg-carbon p-5 text-[0.95rem] text-smoke">
            Personne ne s&apos;est encore inscrit. Le formulaire se trouve sur
            la page d&apos;accueil, dans le bloc « la boutique ouvre bientôt ».
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((sub) => (
              <li
                key={sub.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.95rem] text-chalk">
                    {sub.email}
                  </p>
                  <p className="numeric mt-0.5 text-[0.8rem] text-smoke">
                    {sub.createdAt
                      ? new Date(sub.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "date inconnue"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(sub)}
                  className="rounded-lg border border-slate px-3 py-1.5 text-[0.85rem] text-smoke transition-colors hover:border-ember hover:text-ember"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Campagne --- */}
      <section className="card p-5 sm:p-6">
        <h2 className="display text-[1.15rem] text-chalk">
          Écrire aux inscrits
        </h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-smoke">
          Chaque message part séparément — les adresses ne se voient jamais
          entre elles. Le lien de désinscription est ajouté automatiquement :
          il est obligatoire pour tout envoi promotionnel.
        </p>

        {!mailReady && (
          <p className="mt-4 rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-4 text-[0.9rem] text-chalk">
            L&apos;envoi est indisponible : <code>RESEND_API_KEY</code>{" "}
            n&apos;est pas configurée sur le serveur. Tant que le domaine
            n&apos;est pas vérifié chez Resend, seule votre propre adresse peut
            recevoir des messages — utilisez l&apos;envoi d&apos;essai.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <label className="block text-[0.85rem] font-medium text-chalk">
            Objet
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="La boutique est ouverte"
              className="mt-2 h-11 w-full rounded-lg border border-slate bg-ash px-3 text-[0.95rem] font-normal text-chalk transition-colors hover:border-smoke"
            />
          </label>

          <label className="block text-[0.85rem] font-medium text-chalk">
            Message
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                "Bonjour,\n\nLa boutique vient d'ouvrir…\n\nUne ligne vide sépare deux paragraphes."
              }
              className="mt-2 w-full resize-y rounded-lg border border-slate bg-ash px-3 py-2.5 text-[0.92rem] font-normal leading-relaxed text-chalk transition-colors hover:border-smoke"
            />
          </label>

          {/* --- Essai --- */}
          <div className="rounded-lg border border-slate bg-carbon p-4">
            <p className="text-[0.85rem] font-medium text-chalk">
              Envoi d&apos;essai
            </p>
            <p className="mt-1 text-[0.85rem] leading-relaxed text-smoke">
              Recommandé : un message parti à toute la liste ne se rattrape
              pas.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="h-11 min-w-[14rem] flex-1 rounded-lg border border-slate bg-ash px-3 text-[0.95rem] text-chalk transition-colors hover:border-smoke"
              />
              <button
                type="button"
                onClick={() => send(true)}
                disabled={!canSend || !testEmail.trim()}
                className="h-11 rounded-lg border border-slate px-4 text-[0.9rem] text-chalk transition-colors hover:border-smoke disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "Envoi…" : "Envoyer l'essai"}
              </button>
            </div>
          </div>

          {/* --- Campagne réelle --- */}
          {confirming ? (
            <div className="rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-4">
              <p className="text-[0.92rem] text-chalk">
                Envoyer ce message à <strong>{items.length}</strong> personne
                {items.length > 1 ? "s" : ""} ? Cette action est irréversible.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => send(false)}
                  disabled={sending}
                  className="h-11 rounded-lg bg-ember px-4 text-[0.9rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? "Envoi en cours…" : "Oui, envoyer"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-11 rounded-lg border border-slate px-4 text-[0.9rem] text-smoke transition-colors hover:text-chalk"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={!canSend || items.length === 0}
              className="h-11 rounded-lg bg-ember px-5 text-[0.92rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Envoyer à tous les inscrits
            </button>
          )}

          {result && (
            <div
              role="status"
              className="rounded-lg border border-slate bg-carbon p-4 text-[0.9rem] leading-relaxed text-chalk"
            >
              {result.error ? (
                <p>Échec : {result.error}</p>
              ) : (
                <>
                  <p>
                    {result.test ? "Essai envoyé" : "Campagne envoyée"} —{" "}
                    {result.sent} message{result.sent > 1 ? "s" : ""} parti
                    {result.sent > 1 ? "s" : ""}
                    {result.failed > 0 && `, ${result.failed} en échec`}.
                  </p>
                  {result.sample && result.sample.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[0.85rem] text-smoke">
                      {result.sample.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
