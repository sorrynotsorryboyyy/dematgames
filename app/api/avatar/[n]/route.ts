/**
 * Avatar de membre : le logo dematgames + le numéro d'inscription.
 *
 * SVG généré à la volée plutôt qu'une image stockée : net à tout zoom, aucun
 * octet en base, rien à uploader à l'inscription. La teinte dérive du numéro,
 * donc chaque membre a un avatar visuellement distinct tout en restant dans
 * l'identité du site.
 *
 * Route publique et sans état : l'avatar du membre #7 est le même pour tout
 * le monde, il n'y a rien à protéger. Mise en cache longue durée puisque le
 * rendu d'un numéro donné ne change jamais.
 */

export const runtime = "edge";

/** Teintes tirées de la palette des catégories, pour rester cohérent. */
const HUES = [
  "#c2410c", // ember
  "#4338ca",
  "#15803d",
  "#0f766e",
  "#6d28d9",
  "#be185d",
  "#b45309",
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ n: string }> },
) {
  const { n } = await params;

  // Le numéro vient de l'URL : on le borne avant de l'injecter dans le SVG.
  const parsed = Number.parseInt(n, 10);
  const number =
    Number.isFinite(parsed) && parsed > 0 && parsed < 1_000_000 ? parsed : 0;

  const accent = HUES[number % HUES.length];
  const label = number > 0 ? `#${number}` : "#—";

  // Taille de police dégressive : « #7 » et « #12345 » doivent tenir dans le
  // même gabarit sans déborder.
  const digits = label.length;
  const fontSize = digits <= 3 ? 21 : digits === 4 ? 17 : digits === 5 ? 14 : 12;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Membre ${label}">
  <rect width="64" height="64" rx="14" fill="#16161A"/>
  <g opacity="0.95">
    <rect x="11" y="9" width="26" height="36" rx="2.5" fill="#FBFAF8"/>
    <rect x="11" y="9" width="4.5" height="36" rx="1.5" fill="#CDB99F"/>
    <circle cx="27" cy="27" r="8.5" fill="none" stroke="${accent}" stroke-width="2.6"/>
    <circle cx="27" cy="27" r="2.6" fill="#16161A"/>
  </g>
  <rect x="30" y="40" width="27" height="17" rx="8.5" fill="${accent}"/>
  <text x="43.5" y="48.5" text-anchor="middle" dominant-baseline="central"
        font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="${fontSize}" font-weight="700" fill="#FFFFFF">${label}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Le rendu d'un numéro est immuable : on met en cache agressivement.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
