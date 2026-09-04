import type { Lang } from "@/content/types";
import { imageUrl } from "@/lib/images";
import type { PostDoc } from "@/lib/schema";

/** Tailles de rendu, par emplacement. */
const WIDTHS = {
  /** En tête d'article. */
  article: 1200,
  /** Vignette de carte, dans une liste. */
  card: 640,
} as const;

/** Ratio 16:10 — assez large pour un partage social, assez haut pour rester lisible. */
const RATIO = 0.625;

/**
 * Image de couverture d'un article.
 *
 * Le champ `coverId` existait dans l'administration et était stocké en base
 * depuis le début, mais n'était rendu NULLE PART : ni sur l'article, ni dans
 * les listes, ni en image de partage. Ce composant lui donne enfin un usage.
 *
 * Retourne `null` sans image ou sans Cloudinary : la mise en page ne doit
 * pas dépendre d'un visuel qui peut manquer.
 */
export function PostCover({
  post,
  lang,
  size,
  className = "",
}: {
  post: PostDoc;
  lang: Lang;
  size: keyof typeof WIDTHS;
  className?: string;
}) {
  const width = WIDTHS[size];
  const src = imageUrl(post.coverId, { width, crop: "fill" });
  if (!src) return null;

  const alt = post.content[lang]?.coverAlt?.trim();

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- Cloudinary sert
       déjà le format, la qualité et la densité (f_auto,q_auto,dpr_auto).
       Repasser par next/image facturerait une seconde optimisation sur une
       image déjà servie par un CDN. */
    <img
      src={src}
      // Sans texte alternatif saisi, l'image est DÉCORATIVE. On n'invente
      // jamais un alt à partir du titre : un lecteur d'écran l'entendrait
      // deux fois, et une description fausse est pire qu'aucune.
      alt={alt || ""}
      width={width}
      height={Math.round(width * RATIO)}
      // La couverture d'article est le premier élément visible : la charger
      // paresseusement retarderait le plus grand rendu de la page (LCP).
      loading={size === "article" ? "eager" : "lazy"}
      decoding="async"
      className={`block h-auto w-full rounded-xl border border-slate object-cover ${className}`}
    />
  );
}
