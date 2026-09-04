import type { MetadataRoute } from "next";
import { GAMES } from "@/content/games";
import { LANGS } from "@/content/types";
import { listPosts } from "@/lib/blog";
import { ROUTES, SITE_URL, type RouteKey } from "@/lib/i18n";

/**
 * Le sitemap est ASYNCHRONE : les articles vivent dans Firestore, pas dans
 * le code. `listPosts` retourne un tableau vide si la base est
 * indisponible — le build ne peut donc pas échouer à cause d'elle.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGS) {
    // Accueil
    entries.push({
      url: `${SITE_URL}/${lang}`,
      lastModified,
      changeFrequency: "monthly",
      priority: lang === "fr" ? 1 : 0.9,
      alternates: {
        languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}`])),
      },
    });

    // Boutique. Panier, compte et connexion sont des pages d'état : elles
    // n'ont rien à faire dans un sitemap.
    entries.push({
      url: `${SITE_URL}/${lang}/${ROUTES.shop[lang]}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE_URL}/${l}/${ROUTES.shop[l]}`]),
        ),
      },
    });

    // Fiches produit
    for (const game of GAMES) {
      entries.push({
        url: `${SITE_URL}/${lang}/${ROUTES.shop[lang]}/${game.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LANGS.map((l) => [l, `${SITE_URL}/${l}/${ROUTES.shop[l]}/${game.slug}`]),
          ),
        },
      });
    }

    // Blog, page « proposer mon jeu » et documents légaux. Les pages légales
    // ont une priorité basse : elles doivent être trouvables, pas mises en
    // avant. Les CGV en font partie même si le pied de page ne les affiche
    // pas encore — une URL accessible doit être déclarée.
    const secondary: { key: RouteKey; priority: number }[] = [
      { key: "blog", priority: 0.7 },
      { key: "submit", priority: 0.6 },
      { key: "legal", priority: 0.2 },
      { key: "privacy", priority: 0.2 },
      { key: "terms", priority: 0.2 },
    ];

    for (const { key, priority } of secondary) {
      entries.push({
        url: `${SITE_URL}/${lang}/${ROUTES[key][lang]}`,
        lastModified,
        changeFrequency: "monthly",
        priority,
        alternates: {
          languages: Object.fromEntries(
            LANGS.map((l) => [l, `${SITE_URL}/${l}/${ROUTES[key][l]}`]),
          ),
        },
      });
    }
  }

  // --- Articles de blog ---
  //
  // Ils étaient absents du sitemap : seule la page d'index y figurait. Un
  // article publié restait donc invisible pour un moteur jusqu'à ce qu'il le
  // découvre par un lien, alors que l'index n'affiche que les derniers.
  for (const lang of LANGS) {
    // listPosts filtre déjà sur les articles publiés ET disponibles dans la
    // langue : un brouillon ne peut pas se retrouver ici.
    for (const post of await listPosts(lang)) {
      entries.push({
        url: `${SITE_URL}/${lang}/${ROUTES.blog[lang]}/${post.slug}`,
        // La date de modification réelle, pas celle du build : c'est elle
        // qui indique à un moteur s'il vaut la peine de repasser.
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
