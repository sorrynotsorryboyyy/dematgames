import { GameBox } from "@/components/box/GameBox";
import type { Game } from "@/content/games";
import { imageUrl } from "@/lib/images";

/**
 * Visuel d'un jeu : photo produit ou boîtier 3D.
 *
 * Un seul endroit décide, pour les quatre emplacements où un jeu s'affiche
 * (accueil, carte de catalogue, aperçu, fiche produit).
 *
 * - `productShot` : le visuel fourni EST déjà une photo du boîtier fini.
 *   On l'affiche tel quel — le glisser dans `GameBox` donnerait une boîte
 *   dans une boîte.
 * - sinon : jaquette à plat appliquée sur le boîtier 3D animé, ou, faute
 *   d'image, la jaquette générée en CSS.
 *
 * Le repli est silencieux : sans Cloudinary configuré, `imageUrl()` renvoie
 * `null` et le boîtier CSS reprend la main. Le catalogue reste affichable
 * sur un dépôt fraîchement cloné.
 */

/** Tailles de rendu, par emplacement. */
const WIDTHS = {
  hero: 640,
  detail: 560,
  card: 400,
} as const;

export type ArtworkSize = keyof typeof WIDTHS;

export function GameArtwork({
  game,
  size,
  upcomingLabel,
  className = "",
}: {
  game: Game;
  size: ArtworkSize;
  /**
   * Libellé « bientôt disponible ». Fourni = le statut est signalé.
   *
   * La fiche produit ne le passe pas : elle annonce déjà que la boutique
   * n'est pas ouverte, et un troisième rappel encombrerait.
   */
  upcomingLabel?: string;
  className?: string;
}) {
  const cover = imageUrl(game.coverId, { width: WIDTHS[size] });

  // Absent vaut « pas encore en vente » : un oubli ne doit jamais laisser
  // croire qu'un titre est commandable.
  const upcoming = (game.releaseStatus ?? "upcoming") === "upcoming";
  const flagged = upcoming && Boolean(upcomingLabel);

  // --- Photo produit : le boîtier est déjà dans l'image ---
  if (game.productShot && cover) {
    const image = (
      /* Cloudinary livre déjà le format (WebP/AVIF selon le navigateur),
         la qualité et la densité via f_auto,q_auto,dpr_auto. Repasser par
         next/image ajouterait une seconde optimisation, facturée en plus,
         sur une image déjà servie par un CDN. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover}
        // Décoratif : le titre et le studio sont déjà écrits à côté, en
        // texte. Un alt reprenant « LoopTape » ferait doublon à l'oreille
        // d'un lecteur d'écran.
        alt=""
        width={WIDTHS[size]}
        height={Math.round(WIDTHS[size] * 1.5)}
        // Le visuel du haut de page ne doit pas attendre le défilement.
        loading={size === "hero" ? "eager" : "lazy"}
        decoding="async"
        className={`h-auto w-full max-w-full object-contain transition-[filter] duration-300 ${
          flagged ? "opacity-90 grayscale-[0.72]" : ""
        } ${className}`}
      />
    );

    if (!flagged) return image;

    return (
      <span className="relative inline-block max-w-full">
        {image}
        {/* Le statut est du TEXTE, pas une nuance de couleur : lisible par
            un lecteur d'écran comme par qui ne distingue pas le grisé. */}
        <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-chalk/85 px-2 py-1.5 text-center text-[0.68rem] font-semibold tracking-[0.14em] text-void uppercase">
          {upcomingLabel}
        </span>
      </span>
    );
  }

  // --- Jaquette à plat sur le boîtier 3D, ou repli CSS ---
  const box = {
    hero: { pose: "hero" as const, width: "clamp(196px, 30vw, 320px)" },
    detail: { pose: "hero" as const, width: "clamp(190px, 34vw, 260px)" },
    card: { pose: "shelf" as const, width: "clamp(110px, 30vw, 140px)" },
  }[size];

  const boxNode = (
    <GameBox
      title={game.title}
      studio={game.studio}
      hue={game.hue}
      pose={box.pose}
      width={box.width}
      coverImage={cover ?? undefined}
      // Sur une carte, c'est elle qui porte déjà l'inclinaison au survol.
      interactive={size !== "card"}
      float={size !== "card"}
      showDisc={size !== "card"}
      className={className}
    />
  );

  if (!flagged) return boxNode;

  // Même signalement que sur une photo produit : le boîtier généré doit
  // annoncer son statut de la même façon, sans quoi deux jeux au même
  // statut se liraient différemment selon qu'ils ont une image ou non.
  return (
    <span className="relative inline-block opacity-90 grayscale-[0.72]">
      {boxNode}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-chalk/85 px-2 py-1.5 text-center text-[0.68rem] font-semibold tracking-[0.14em] text-void uppercase">
        {upcomingLabel}
      </span>
    </span>
  );
}
