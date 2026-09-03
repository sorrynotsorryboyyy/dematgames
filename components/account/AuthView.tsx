"use client";

import { Button } from "@/components/ui/Button";
import type { Content, Lang } from "@/content/types";
import { path } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Connexion — Google uniquement, via Firebase.
 *
 * Il n'y a volontairement ni champ mot de passe, ni formulaire d'inscription :
 * la première connexion Google crée le compte. C'est aussi ce qui nous évite
 * de stocker, protéger et réinitialiser des mots de passe — le risque le plus
 * courant sur un site de ce type.
 */
export function AuthView({ lang, t }: { lang: Lang; t: Content }) {
  const a = t.account.auth;
  const router = useRouter();
  const { user, ready, available, error, signInWithGoogle } = useSession();

  // Déjà connecté : cette page n'a plus d'objet.
  useEffect(() => {
    if (ready && user) router.replace(path("account", lang));
  }, [ready, user, lang, router]);

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="display display-lg text-chalk">{a.loginTitle}</h1>
      <p className="mt-5 text-[1.02rem] leading-[1.7] text-smoke">
        {a.intro}
      </p>

      {available ? (
        <>
          <Button
            type="button"
            onClick={signInWithGoogle}
            variant="ghost"
            size="lg"
            disabled={!ready}
            className="mt-9 w-full"
          >
            <GoogleMark />
            {a.google}
          </Button>

          {/* Fenêtre fermée par l'utilisateur : ce n'est pas un échec, on
              n'affiche donc rien de rouge ni d'alarmant. */}
          {error && error !== "popup-closed" && (
            <p role="alert" className="mt-4 text-[0.9rem] text-ember">
              {error === "network" ? a.errorNetwork : a.errorUnknown}
            </p>
          )}

          <p className="mt-6 text-[0.85rem] leading-[1.6] text-smoke">
            {a.privacy}
          </p>
        </>
      ) : (
        // Sans configuration Firebase, on le dit franchement plutôt que
        // d'afficher un bouton qui ne ferait rien.
        <p
          role="status"
          className="mt-9 rounded-xl border border-slate bg-carbon p-5 text-[0.95rem] leading-[1.6] text-smoke"
        >
          {a.unavailable}
        </p>
      )}
    </div>
  );
}

/** Le « G » Google, aux couleurs officielles. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="size-[1.15rem]">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
