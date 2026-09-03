"use client";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import type { Content } from "@/content/types";
import { ANCHORS } from "@/lib/i18n";
import { isValidEmail } from "@/lib/validate";
import { useEffect, useId, useRef, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * « Prévenez-moi de l'ouverture ».
 *
 * La boutique n'encaisse pas encore. Plutôt que de le masquer derrière une
 * vitrine trompeuse, on l'annonce et on propose la seule action utile à ce
 * stade : laisser une adresse.
 *
 * L'adresse part vers /api/subscribe, qui l'écrit en base. Un champ e-mail
 * qui ne mène nulle part serait pire que pas de champ du tout : le visiteur
 * croirait être inscrit.
 */
export function OpeningAlert({ o }: { o: Content["opening"] }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  // Champ piège et horodatage : mêmes heuristiques anti-bot que le
  // formulaire de candidature, sans captcha.
  const [honeypot, setHoneypot] = useState("");
  // Date.now() est impur : il est lu dans un effet, pas pendant le rendu.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Validation côté client pour le confort ; le serveur revalide.
    if (!isValidEmail(email)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus("submitting");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: honeypot,
          startedAt: startedAt.current,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id={ANCHORS.opening} tone="carbon" labelledBy="opening-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{o.eyebrow}</p>
        <h2 id="opening-title" className="display display-lg mt-4 text-chalk">
          {o.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-[1.7] text-smoke">
          {o.body}
        </p>

        {status === "success" ? (
          <div
            role="status"
            className="mt-10 rounded-xl border border-ember/35 bg-[var(--color-ember-soft)] p-8"
          >
            <p className="display text-2xl text-chalk">{o.successTitle}</p>
            <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-smoke">
              {o.successBody}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-10">
            {/* Piège à robots : hors flux visuel, ignoré des lecteurs
                d'écran, mais rempli par les scripts qui remplissent tout. */}
            <div aria-hidden="true" className="absolute left-[-9999px]">
              <label htmlFor={`${inputId}-website`}>{o.honeypotLabel}</label>
              <input
                id={`${inputId}-website`}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1 text-left">
                <label htmlFor={inputId} className="sr-only">
                  {o.emailLabel}
                </label>
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder={o.emailPlaceholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (invalid) setInvalid(false);
                  }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? errorId : undefined}
                  className={`h-12 w-full rounded-lg border bg-ash px-4 text-[0.98rem] text-chalk outline-none transition-colors placeholder:text-smoke/70 focus-visible:border-ember ${
                    invalid ? "border-ember" : "border-slate"
                  }`}
                />
                {invalid && (
                  <p id={errorId} className="mt-2 text-sm text-ember">
                    {o.emailError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? o.submitting : o.submit}
              </Button>
            </div>

            <p className="mt-4 text-left text-[0.85rem] leading-relaxed text-smoke sm:text-center">
              {o.privacyNote}
            </p>

            {status === "error" && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-5 text-left"
              >
                <p className="text-sm font-semibold text-chalk">
                  {o.errorTitle}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-smoke">
                  {o.errorBody}
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </Section>
  );
}
