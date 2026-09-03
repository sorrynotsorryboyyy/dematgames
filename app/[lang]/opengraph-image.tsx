import { isLang, LANGS } from "@/content/types";
import { getContent } from "@/lib/i18n";
import { ImageResponse } from "next/og";

/**
 * Image Open Graph générée à la build — aucun fichier bitmap à maintenir,
 * et le texte suit automatiquement la langue de la page.
 *
 * next/og n'accepte qu'un sous-ensemble de CSS (flexbox uniquement, pas de
 * grid ni de transform 3D) : le boîtier est donc suggéré par des rectangles
 * empilés, pas par le composant GameBox.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "dematgames.gg";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "fr";
  const t = getContent(lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FBFAF8",
          color: "#16161A",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Lueur ember, unique touche de couleur. */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "#C2410C",
            opacity: 0.10,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: "#C2410C",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                color: "#5B5B66",
                display: "flex",
              }}
            >
              {t.hero.badge.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: -3,
                lineHeight: 1.05,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>{t.hero.titleLines[0]}</span>
              <span>{t.hero.titleLines[1]}</span>
              <span style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
                {t.hero.titleLines[2]}
                <span
                  style={{
                    width: 150,
                    height: 8,
                    background: "#C2410C",
                    marginBottom: 20,
                    display: "flex",
                  }}
                />
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 700, display: "flex" }}>
              dematgames
              <span style={{ color: "#C2410C" }}>.gg</span>
            </div>
            <div style={{ fontSize: 21, color: "#5B5B66", display: "flex" }}>
              {t.hero.reassurance.join("  ·  ")}
            </div>
          </div>
        </div>

        {/* Boîtier suggéré : jaquette + tranche, sans 3D. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: 80,
          }}
        >
          <div
            style={{
              width: 26,
              height: 400,
              background: "#0A0A0D",
              border: "1px solid #E3E0DA",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 285,
              height: 400,
              background: "#131318",
              border: "1px solid #E3E0DA",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 26,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: -1.5,
                color: "#FFFFFF",
                display: "flex",
              }}
            >
              NOCTURNE
            </div>
            <div
              style={{
                width: 90,
                height: 3,
                background: "#C2410C",
                marginTop: 14,
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 16,
                color: "#9A9AA4",
                marginTop: 14,
                letterSpacing: 3,
                display: "flex",
              }}
            >
              PALE MOTH STUDIO
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
