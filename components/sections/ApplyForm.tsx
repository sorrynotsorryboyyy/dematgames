"use client";

import { QuestionIcon } from "@/components/form/QuestionIcon";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { Content } from "@/content/types";
import {
  hasErrors,
  LIMITS,
  validateApplication,
  type AllowedChoices,
  type Errors,
  type FieldName,
} from "@/lib/validate";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY = {
  name: "",
  email: "",
  game: "",
  link: "",
  platform: "",
  message: "",
  // Qualification — vides par défaut : aucune option n'est présélectionnée,
  // pour ne pas fausser les réponses par un choix qu'on aurait suggéré.
  stage: "",
  volume: "",
  edition: "",
  team: "",
  website: "", // honeypot
};

/**
 * Formulaire « Studios fondateurs », en cinq écrans.
 *
 * Quatre questions de qualification (une par écran, avec pictogramme animé)
 * puis un écran de coordonnées. Le clic sur un choix avance tout seul : c'est
 * ce qui donne la fluidité d'une conversation plutôt que d'un formulaire.
 *
 * TROIS POINTS D'ACCESSIBILITÉ
 *
 * 1. Les cinq écrans restent dans le DOM, masqués par `hidden`. Un formulaire
 *    qui démonte ses écrans rend son contenu invisible aux lecteurs d'écran
 *    et à la recherche du navigateur.
 * 2. Le focus se déplace sur le titre du nouvel écran à chaque changement.
 *    Sans cela, un utilisateur au clavier reste bloqué sur l'écran précédent.
 * 3. Un seul <form> englobe le tout : la soumission finale envoie l'ensemble,
 *    et les gestionnaires de mots de passe voient un formulaire cohérent.
 *
 * Les quatre questions sont OPTIONNELLES — un bouton « Passer » permet
 * d'avancer. Un studio qui ignore son volume ne doit pas être bloqué.
 */
export function ApplyForm({ t }: { t: Content }) {
  const f = t.founding.form;
  const q = f.qualification;
  const uid = useId();

  // Les options viennent du contenu : la validation refuse toute valeur qui
  // n'y figure pas, côté client comme côté serveur.
  const choices: AllowedChoices = {
    stage: q.stage.options,
    volume: q.volume.options,
    edition: q.edition.options,
    team: q.team.options,
  };
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  // --- Navigation entre les cinq écrans ---
  const [step, setStep] = useState(0);
  const TOTAL = 5;
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** Empêche de voler le focus au premier rendu de la page. */
  const moved = useRef(false);

  const goTo = useCallback((index: number) => {
    setStep(Math.min(TOTAL - 1, Math.max(0, index)));
    moved.current = true;
  }, []);

  // Le focus suit l'écran actif : sans cela, la navigation au clavier reste
  // coincée sur l'écran précédent, désormais masqué.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  /**
   * Sélection d'une réponse : on enregistre, puis on avance seul après un
   * court délai — le temps que la sélection soit visible, sinon l'écran
   * change avant que l'utilisateur ait vu son propre clic.
   */
  const answer = useCallback(
    (key: "stage" | "volume" | "edition" | "team", value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      // Forme fonctionnelle : elle voit toujours la valeur courante, même
      // depuis un timeout — pas besoin de miroir en ref.
      window.setTimeout(() => {
        setStep((current) => Math.min(TOTAL - 1, current + 1));
        moved.current = true;
      }, 350);
    },
    [],
  );
  // Sert à distinguer un humain d'un bot qui poste instantanément.
  // Date.now() est impur : il est lu dans un effet, pas pendant le rendu.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (key: keyof typeof EMPTY) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    // On efface l'erreur dès que l'utilisateur corrige, sans attendre l'envoi.
    if (key in errors) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as FieldName];
        return next;
      });
    }
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateApplication(values, f.platform.options, choices);
    setErrors(found);
    if (hasErrors(found)) {
      // Focus sur le premier champ en erreur — obligatoire au clavier.
      const first = Object.keys(found)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-ember/35 bg-[var(--color-ember-soft)] p-10 text-center lg:p-14"
      >
        <p className="display text-3xl text-chalk lg:text-4xl">
          {f.successTitle}
        </p>
        <p className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-smoke">
          {f.successBody}
        </p>
      </div>
    );
  }

  const QUESTIONS = [
    { key: "stage" as const, choice: q.stage },
    { key: "volume" as const, choice: q.volume },
    { key: "edition" as const, choice: q.edition },
    { key: "team" as const, choice: q.team },
  ];

  const progress = f.stepProgress
    .replace("{i}", String(step + 1))
    .replace("{n}", String(TOTAL));

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Barre de progression */}
      <div className="flex items-center gap-4">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-slate"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
        <p className="numeric shrink-0 text-[0.8rem] text-smoke">{progress}</p>
      </div>

      {/* --- Écrans 1 à 4 : les questions de qualification --- */}
      {QUESTIONS.map((question, i) => (
        <div key={question.key} hidden={step !== i} className="step-panel mt-8">
          <div className="flex items-start gap-5">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-slate bg-carbon p-3 text-ember"
            >
              {/* Le pictogramme n'est monté que sur l'écran actif : sinon
                  l'animation de tracé se jouerait hors écran, invisible. */}
              {step === i && <QuestionIcon index={i} />}
            </span>
            <h3
              ref={step === i ? headingRef : undefined}
              tabIndex={-1}
              className="display text-[1.3rem] leading-snug text-chalk outline-none md:text-[1.5rem]"
            >
              {question.choice.label}
            </h3>
          </div>

          <div className="mt-6">
            <RadioGroup
              choice={question.choice}
              name={question.key}
              value={values[question.key]}
              onChange={(value) => answer(question.key, value)}
              hideLabel
            />
          </div>

          <div className="mt-8 flex items-center gap-3">
            {i > 0 && (
              <button
                type="button"
                onClick={() => goTo(i - 1)}
                className="text-[0.9rem] text-smoke underline underline-offset-4 transition-colors hover:text-chalk"
              >
                {f.stepBack}
              </button>
            )}
            <button
              type="button"
              onClick={() => goTo(i + 1)}
              className="ml-auto text-[0.9rem] text-smoke underline underline-offset-4 transition-colors hover:text-chalk"
            >
              {f.stepSkip}
            </button>
          </div>
        </div>
      ))}

      {/* --- Écran 5 : coordonnées --- */}
      <div hidden={step !== 4} className="step-panel mt-8 space-y-7">
        <h3
          ref={step === 4 ? headingRef : undefined}
          tabIndex={-1}
          className="display text-[1.3rem] text-chalk outline-none md:text-[1.5rem]"
        >
          {f.lastStepTitle}
        </h3>

        <section className="space-y-5">
          <h4 className="eyebrow">{f.sectionGame}</h4>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${uid}-game`}
              field={f.game}
              value={values.game}
              onChange={set("game")}
              invalid={!!errors.game}
              maxLength={LIMITS.game}
              required
              requiredLabel={f.required}
            />
            <TextField
              id={`${uid}-link`}
              field={f.link}
              value={values.link}
              onChange={set("link")}
              invalid={!!errors.link}
              maxLength={LIMITS.link}
              type="url"
              inputMode="url"
              required
              requiredLabel={f.required}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor={`${uid}-platform`}
              label={f.platform.label}
              hint={f.required}
            />
            <select
              id={`${uid}-platform`}
              name="platform"
              value={values.platform}
              onChange={(e) => set("platform")(e.target.value)}
              aria-invalid={!!errors.platform}
              aria-describedby={
                errors.platform ? `${uid}-platform-err` : undefined
              }
              className={`mt-2 h-12 w-full appearance-none rounded-lg border bg-ash px-4 text-[0.95rem] text-chalk transition-colors ${
                errors.platform
                  ? "border-ember"
                  : "border-slate hover:border-smoke"
              }`}
            >
              <option value="" disabled>
                {f.platform.placeholder}
              </option>
              {f.platform.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.platform && (
              <ErrorText id={`${uid}-platform-err`}>
                {f.platform.error}
              </ErrorText>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <h4 className="eyebrow">{f.sectionYou}</h4>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${uid}-name`}
              field={f.name}
              value={values.name}
              onChange={set("name")}
              invalid={!!errors.name}
              maxLength={LIMITS.name}
              autoComplete="name"
              required
              requiredLabel={f.required}
            />
            <TextField
              id={`${uid}-email`}
              field={f.email}
              value={values.email}
              onChange={set("email")}
              invalid={!!errors.email}
              maxLength={LIMITS.email}
              type="email"
              autoComplete="email"
              required
              requiredLabel={f.required}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor={`${uid}-message`}
              label={f.message.label}
              hint={f.optional}
            />
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={5}
              value={values.message}
              maxLength={LIMITS.message}
              placeholder={f.message.placeholder}
              onChange={(e) => set("message")(e.target.value)}
              aria-invalid={!!errors.message}
              aria-describedby={
                errors.message ? `${uid}-message-err` : undefined
              }
              className={`mt-2 w-full resize-y rounded-lg border bg-ash px-4 py-3 text-[0.95rem] text-chalk placeholder:text-smoke transition-colors ${
                errors.message
                  ? "border-ember"
                  : "border-slate hover:border-smoke"
              }`}
            />
            {errors.message && (
              <ErrorText id={`${uid}-message-err`}>
                {f.message.error}
              </ErrorText>
            )}
          </div>
        </section>

        <button
          type="button"
          onClick={() => goTo(3)}
          className="text-[0.9rem] text-smoke underline underline-offset-4 transition-colors hover:text-chalk"
        >
          {f.stepBack}
        </button>
      </div>

      {/* Piège à bots : hors flux, masqué aux lecteurs d'écran et au clavier. */}
      <div aria-hidden="true" className="fixed left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>{f.honeypotLabel}</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set("website")(e.target.value)}
        />
      </div>

      <div
        hidden={step !== 4}
        className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? f.submitting : f.submit}
        </Button>
        <p className="text-[0.85rem] text-smoke">{t.founding.ctaNote}</p>
      </div>

      {status === "error" && (
        <div role="alert" className="rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-5">
          <p className="text-sm font-semibold text-chalk">{f.errorTitle}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-smoke">
            {f.errorBody}
          </p>
        </div>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */

function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-3 text-[0.85rem] font-medium text-chalk"
    >
      {label}
      <span className="text-[0.72rem] font-normal text-smoke">{hint}</span>
    </label>
  );
}

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-2 text-[0.8rem] text-ember">
      {children}
    </p>
  );
}

function TextField({
  id,
  field,
  value,
  onChange,
  invalid,
  type = "text",
  required = false,
  requiredLabel,
  ...rest
}: {
  id: string;
  field: { label: string; placeholder: string; error: string };
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  type?: string;
  required?: boolean;
  requiredLabel: string;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: "url" | "text" | "email";
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={field.label} hint={requiredLabel} />
      <input
        id={id}
        name={id.split("-").pop()}
        type={type}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        aria-required={required}
        className={`mt-2 h-12 w-full rounded-lg border bg-ash px-4 text-[0.95rem] text-chalk placeholder:text-smoke transition-colors ${
          invalid ? "border-ember" : "border-slate hover:border-smoke"
        }`}
        {...rest}
      />
      {invalid && <ErrorText id={`${id}-err`}>{field.error}</ErrorText>}
    </div>
  );
}
