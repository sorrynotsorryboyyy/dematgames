/**
 * Données de test : catégories, articles et candidatures.
 *
 * Usage :  node scripts/seed.mjs
 *
 * Le script est IDEMPOTENT : relancé, il met à jour les mêmes documents au
 * lieu d'en créer des doublons. Les identifiants sont fixes pour cette
 * raison.
 *
 * ⚠️ Ces données sont des EXEMPLES, pas du contenu réel. Les articles
 * décrivent le service tel qu'il est décrit sur le site, sans inventer de
 * chiffre, de partenaire ni de témoignage — un faux témoignage publié
 * serait un problème bien réel.
 */
import fs from "node:fs";
import path from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = process.cwd();
const NL = String.fromCharCode(10);
const BS = String.fromCharCode(92);

// --- Lecture de .env.local ------------------------------------------------
function env(key) {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return undefined;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(key + "=")) continue;
    let v = line.slice(key.length + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  return undefined;
}

/** Même normalisation que lib/firebase-admin.ts. */
function normalizeKey(raw) {
  if (!raw) return undefined;
  let key = raw.trim();
  let prev;
  do {
    prev = key;
    key = key.split(BS + BS + "n").join(NL).split(BS + "n").join(NL);
  } while (key !== prev);
  return key.trim();
}

const projectId = env("FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = env("FIREBASE_ADMIN_CLIENT_EMAIL");
const privateKey = normalizeKey(env("FIREBASE_ADMIN_PRIVATE_KEY"));

if (!projectId || !clientEmail || !privateKey) {
  console.error("✗ Variables FIREBASE_ADMIN_* manquantes dans .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const db = getFirestore();

// --- Catégories -----------------------------------------------------------
const CATEGORIES = [
  {
    id: "atelier",
    slug: "atelier",
    label: { fr: "Atelier", en: "Workshop" },
    color: "#c2410c",
    order: 1,
  },
  {
    id: "studios",
    slug: "studios",
    label: { fr: "Studios", en: "Studios" },
    color: "#4338ca",
    order: 2,
  },
  {
    id: "culture",
    slug: "culture",
    label: { fr: "Culture du jeu", en: "Game culture" },
    color: "#0f766e",
    order: 3,
  },
];

// --- Articles -------------------------------------------------------------
const now = Date.now();
const day = 86_400_000;

const POSTS = [
  {
    id: "pourquoi-une-boite",
    slug: "pourquoi-une-boite-en-2026",
    status: "published",
    categoryId: "culture",
    publishedAt: now - 2 * day,
    content: {
      fr: {
        title: "Pourquoi une boîte, en 2026 ?",
        excerpt:
          "Le numérique a gagné la distribution. Il n'a pas gagné la propriété — et c'est là que le physique reprend tout son sens.",
        body: `Il y a une question qu'on nous pose à chaque fois : pourquoi fabriquer des boîtes alors que tout se télécharge ?

## Ce qu'on achète vraiment en ligne

Acheter un jeu sur une plateforme, c'est acheter un **droit d'accès**. Révocable, non transmissible, et dépendant d'un service qui doit rester ouvert. Les conditions d'utilisation le disent noir sur blanc, même si personne ne les lit.

Tant que tout fonctionne, la nuance est théorique. Le jour où une boutique ferme, où un compte est suspendu, ou bien où une licence expire, elle ne l'est plus du tout.

## Ce que change un objet

Un exemplaire physique appartient à celui qui l'a acheté. Il se prête, s'offre, se revend. Il survit à la plateforme qui l'a vendu.

- Il ne dépend d'aucun serveur
- Il ne disparaît pas d'une bibliothèque du jour au lendemain
- Il se transmet

> Le vinyle et le livre papier n'ont pas disparu face au streaming. Ils sont devenus des objets qu'on **choisit** d'acheter.

## Et pour un studio ?

Une édition physique, c'est un objet que votre communauté peut tenir. Pour beaucoup de joueurs, c'est la différence entre « j'ai joué à ce jeu » et « j'ai ce jeu ».

C'est aussi une façon de marquer une sortie, un anniversaire, une fin de développement — un moment qui mérite mieux qu'une ligne dans une liste de téléchargements.`,
      },
      en: {
        title: "Why a box, in 2026?",
        excerpt:
          "Digital won distribution. It didn't win ownership — and that's where physical still matters.",
        body: `There's one question we get every time: why make boxes when everything is downloadable?

## What you actually buy online

Buying a game on a platform means buying **access**. Revocable, non-transferable, and dependent on a service staying open. The terms say so plainly, even if nobody reads them.

While everything works, the distinction is theoretical. The day a storefront closes, an account is suspended, or a licence expires, it stops being theoretical.

## What an object changes

A physical copy belongs to whoever bought it. It can be lent, gifted, resold. It outlives the platform that sold it.

- It depends on no server
- It doesn't vanish from a library overnight
- It gets passed on

> Vinyl and print didn't die when streaming arrived. They became things people **choose** to own.

## And for a studio?

A physical edition is something your community can hold. For many players, it's the difference between "I played that game" and "I have that game."

It's also a way to mark a release, an anniversary, the end of a development — a moment that deserves better than a line in a download list.`,
      },
    },
  },
  {
    id: "presser-cinquante",
    slug: "presser-cinquante-exemplaires",
    status: "published",
    categoryId: "atelier",
    publishedAt: now - 6 * day,
    content: {
      fr: {
        title: "Presser cinquante exemplaires, concrètement",
        excerpt:
          "Ce qui se passe entre votre build et le colis, étape par étape. Sans jargon industriel.",
        body: `Les usines traditionnelles démarrent à plusieurs centaines d'exemplaires. Nous démarrons à cinquante. Voici pourquoi c'est possible, et ce que ça implique.

## Le pressage

Un disque pressé n'est pas un disque gravé. Le pressage crée le relief à partir d'une matrice ; c'est ce qui donne la durée de vie et la finition d'un disque commercial.

La matrice a un coût fixe. C'est elle qui impose historiquement des minimums élevés : il faut l'amortir. En mutualisant les commandes de plusieurs studios, on descend ce seuil sans sacrifier la qualité.

## L'impression

Jaquette, livret, sérigraphie du disque : trois supports, trois contraintes.

- La jaquette est imprimée en quadrichromie, pelliculée
- Le livret suit le même profil colorimétrique, pour que les noirs coïncident
- La sérigraphie du disque accepte moins de nuances : les dégradés fins y passent mal

C'est le genre de détail qu'on vérifie avec vous avant de lancer quoi que ce soit.

## L'assemblage

Chaque exemplaire est monté à la main. À cette échelle, c'est plus rapide et plus fiable qu'une chaîne automatisée — et ça permet de repérer un défaut d'impression avant qu'il ne parte chez un joueur.`,
      },
    },
  },
  {
    id: "choisir-son-edition",
    slug: "choisir-son-edition",
    status: "published",
    categoryId: "studios",
    publishedAt: now - 12 * day,
    sponsored: true,
    sponsorName: "Atelier Papier Machine",
    sponsorUrl: "https://example.com",
    content: {
      fr: {
        title: "Standard, Deluxe ou Collector : comment choisir",
        excerpt:
          "Trois formats, trois publics. Un guide pour ne pas surdimensionner sa première édition.",
        body: `La tentation, pour une première édition physique, est de viser le collector. C'est rarement le bon choix.

## Standard : commencer par là

Disque, boîtier, jaquette. C'est l'édition qui existe pour être achetée, pas admirée. Si vous ne savez pas quel volume votre communauté représente, c'est le format qui vous expose le moins.

## Deluxe : pour une communauté établie

Livret, stickers, boîtier premium. Le format se justifie quand vous avez déjà une base de joueurs qui vous suit — pas quand vous espérez en créer une.

## Collector : un objet, pas un produit

Tirage limité, numérotation, packaging sur mesure. C'est une pièce qui se prépare, souvent en parallèle d'un événement : une sortie, un anniversaire de studio, une campagne de financement.

> Un collector qui ne trouve pas son public reste un collector. Un standard qui se vend bien devient un deluxe l'année suivante.

Notre conseil : commencez par le format qui correspond à la demande que vous **constatez**, pas à celle que vous espérez.`,
      },
    },
  },
  {
    id: "brouillon-logistique",
    slug: "coulisses-de-lexpedition",
    status: "draft",
    categoryId: "atelier",
    publishedAt: null,
    content: {
      fr: {
        title: "Coulisses de l'expédition",
        excerpt: "Article en cours de rédaction.",
        body: `Ce brouillon sert à vérifier que les articles non publiés n'apparaissent jamais côté public.

Il ne doit être visible que dans l'administration.`,
      },
    },
  },
];

// --- Candidatures ---------------------------------------------------------
const APPLICATIONS = [
  {
    id: "demo-nocturne",
    name: "Camille Roux",
    email: "camille@palemoth.example",
    game: "Nocturne",
    link: "https://example.com/nocturne",
    platform: "Steam",
    stage: "Déjà sorti",
    volume: "100 à 500",
    edition: "Collector",
    team: "2 à 5",
    message:
      "Notre jeu est sorti il y a huit mois et la communauté demande une édition physique depuis. On aimerait comprendre ce qui est faisable sur un tirage numéroté.",
    status: "new",
    createdAt: now - 4 * 3600_000,
    notes: "",
  },
  {
    id: "demo-driftwood",
    name: "Two Hands",
    email: "hello@twohands.example",
    game: "Driftwood",
    link: "https://example.com/driftwood",
    platform: "itch.io",
    stage: "En accès anticipé",
    volume: "Environ 50",
    edition: "Standard",
    team: "Solo",
    message: "Premier projet, petite communauté. Je veux tester le principe.",
    status: "contacted",
    createdAt: now - 3 * day,
    notes: "Répondu le 12. Attente des visuels de jaquette.",
  },
  {
    id: "demo-vela",
    name: "Kite Works",
    email: "contact@kiteworks.example",
    game: "Vela",
    link: "https://example.com/vela",
    platform: "PC (Windows)",
    stage: "Sortie imminente",
    volume: "Je ne sais pas encore",
    edition: "À définir ensemble",
    team: "6 à 15",
    message:
      "Sortie prévue au printemps. On aimerait préparer l'édition physique en amont pour qu'elle soit disponible le jour du lancement.",
    status: "accepted",
    createdAt: now - 9 * day,
    notes: "Bon profil. Calendrier serré mais tenable.",
  },
];

// --- Écriture -------------------------------------------------------------
async function run() {
  const batch = db.batch();

  for (const cat of CATEGORIES) {
    const { id, ...data } = cat;
    batch.set(db.collection("categories").doc(id), data, { merge: true });
  }

  for (const post of POSTS) {
    const { id, ...rest } = post;
    batch.set(
      db.collection("posts").doc(id),
      {
        sponsored: false,
        sponsorName: null,
        sponsorUrl: null,
        coverId: null,
        authorUid: "seed",
        authorName: "dematgames",
        createdAt: rest.publishedAt ?? now,
        updatedAt: now,
        ...rest,
      },
      { merge: true },
    );
  }

  for (const app of APPLICATIONS) {
    const { id, ...data } = app;
    batch.set(db.collection("applications").doc(id), data, { merge: true });
  }

  await batch.commit();

  console.log("  ✓ " + CATEGORIES.length + " catégories");
  console.log("  ✓ " + POSTS.length + " articles (dont 1 brouillon, 1 sponsorisé)");
  console.log("  ✓ " + APPLICATIONS.length + " candidatures");
  console.log("");
  console.log("  Relancer le script met à jour ces mêmes documents,");
  console.log("  il n'en crée pas de nouveaux.");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Échec :", e.message);
    process.exit(1);
  });
