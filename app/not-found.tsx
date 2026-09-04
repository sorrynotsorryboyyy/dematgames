import { getContent } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/content/types";
import type { Metadata } from "next";
import Link from "next/link";

/**
 * 404 racine — atteinte quand l'URL ne commence par aucune langue connue
 * (« /nimporte-quoi »).
 *
 * Elle rend sa PROPRE structure HTML : le layout racine se contente de
 * transmettre ses enfants, et `<html>` n'est produit que par
 * app/[lang]/layout.tsx, hors d'atteinte ici. Sans ces balises, la page
 * serait invalide.
 *
 * Volontairement dépouillée, sans en-tête ni pied de page : ceux-ci
 * supposent une langue résolue, que cette route n'a pas. Trois liens
 * suffisent à repartir.
 */

export const metadata: Metadata = {
  title: "Page introuvable — dematgames.com",
  // Une page d'erreur n'a rien à faire dans un index.
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  const t = getContent(DEFAULT_LANG);

  return (
    <html lang={DEFAULT_LANG}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbfaf8",
          color: "#16161a",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem", padding: "2.5rem 1.5rem" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              color: "#c2410c",
            }}
          >
            {t.notFound.code}
          </p>

          <h1 style={{ margin: "1rem 0 0", fontSize: "1.9rem", lineHeight: 1.2 }}>
            {t.notFound.title}
          </h1>

          <p style={{ margin: "1.25rem 0 2rem", lineHeight: 1.7, color: "#5b5b66" }}>
            {t.notFound.body}
          </p>

          <Link
            href={`/${DEFAULT_LANG}`}
            style={{
              display: "inline-block",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#c2410c",
              color: "#ffffff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t.notFound.home}
          </Link>
        </main>
      </body>
    </html>
  );
}
