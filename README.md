# dematgames.com

Site de **validation de marché** pour dematgames.com : transformer les jeux
indés en éditions physiques, fabriquées à la demande.

Ce n'est pas encore une marketplace. L'objectif reste de convaincre un
développeur indépendant de **laisser son email** et d'ouvrir la discussion
(section « Founding developers »).

> ## Ce qui est une maquette
>
> La boutique et les comptes existent pour montrer l'expérience cible.
> **Rien n'est réel côté serveur :**
>
> - **Aucun paiement.** Le parcours d'achat s'arrête au récapitulatif, sur un
>   message explicite. Aucun champ de carte bancaire n'est présenté nulle part
>   — et il ne faut pas en ajouter tant qu'un vrai prestataire n'est pas
>   branché.
> - **Aucune authentification.** « Se connecter » écrit un nom et un e-mail
>   dans le `localStorage`. Aucun mot de passe n'est stocké, transmis ni
>   vérifié ; le formulaire l'annonce au-dessus du champ. La page compte
>   n'est **pas** une route protégée.
> - **Prix indicatifs.** Voir `PRICING_IS_INDICATIVE` dans `content/games.ts`.
> - **Catalogue fictif.** Les cinq jeux sont inventés, pour ne pas afficher de
>   vrais titres que dematgames.com ne distribue pas.

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3000 → redirige vers /fr
```

| Commande            | Rôle                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Serveur de développement                    |
| `npm run build`     | Build de production                         |
| `npm start`         | Sert le build de production                 |
| `npm run lint`      | ESLint (flat config)                        |
| `npm run typecheck` | TypeScript sans émission                    |

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — configuration dans le CSS (`app/globals.css`, bloc
  `@theme`), pas de `tailwind.config.js`
- **Aucune dépendance runtime tierce.** Les animations sont en CSS +
  IntersectionObserver ; le tilt 3D utilise `requestAnimationFrame` ; le
  panier et la session s'appuient sur `useSyncExternalStore` + `localStorage`.

Poids en production : **~215 Ko gzip** pour l'accueil, **~205 Ko** pour les
pages boutique (dont ~180 Ko de runtime React/Next partagé), **zéro image
bitmap** au premier rendu.

## Architecture

```
app/
  [lang]/                    layout (html lang, metadata, fonts), accueil, OG
  [lang]/[section]/          boutique · panier · compte · connexion
  [lang]/[section]/[slug]/   fiche produit
  api/apply/                 réception du formulaire (stub — voir plus bas)
  globals.css                tokens de design, textures, animations
  icon.svg · robots.ts · sitemap.ts
components/
  box/          GameBox (boîtier 3D), BoxShelf, ProblemShelf, DeliveryScene
  layout/       Header, Footer
  sections/     les 6 sections de l'accueil
  shop/         catalogue, carte produit, filtres, panier, badge
  account/      connexion (maquette), tableau de bord
  ui/           Reveal, Button, Section, TiltCard
content/
  types.ts      contrat `Content` partagé
  fr.ts         TOUT le texte visible, 100 % français
  en.ts         TOUT le texte visible, 100 % anglais
  games.ts      catalogue fictif + PRICING_IS_INDICATIVE
  categories.ts catégories et leurs couleurs
lib/
  i18n.ts        contenu, routes localisées, ancres
  useReveal.ts   révélation au scroll, media queries
  useTilt.ts     tilt 3D partagé (boîtier + cartes)
  localStore.ts  lecture réactive du localStorage
  cart.tsx · session.tsx · validate.ts
```

### Routes localisées

Les URLs restent dans la langue de la page : `/fr/boutique` et `/en/shop`.
La table `ROUTES` (`lib/i18n.ts`) définit les segments ; `path()` construit les
liens. Une URL croisée (`/fr/shop`) renvoie volontairement un **404**, pour
éviter que chaque page existe sous deux adresses.

### Ligne éditoriale

Les textes suivent quelques règles ; les respecter garde le site cohérent.

- **On parle au développeur**, pas au joueur : « votre jeu », « vos visuels ».
  La boutique est la seule zone qui s'adresse à un acheteur.
- **Un verbe d'action par étape.** « Envoyez votre jeu », pas « Envoi ».
- **Aucun chiffre inventé.** Seuls deux nombres apparaissent : **50** (le
  minimum de production réel) et **20** (les places ouvertes). Pas de
  pourcentage de commission, pas de délai promis, pas de témoignage.
- **On assume ce qui n'est pas décidé.** Les tarifs ne sont pas fixés, et le
  site le dit. C'est ce qui rend crédible le reste du discours auprès d'un
  studio — un prix inventé serait repéré immédiatement.
- **Phrases courtes.** Si une phrase demande deux lectures, elle est trop longue.

### Modifier le contenu

**Aucune chaîne de texte visible ne vit dans un composant.** Tout est dans
`content/fr.ts` et `content/en.ts`, typés par la même interface `Content`.

Conséquence : si une clé manque ou change dans une seule langue,
`npm run typecheck` échoue. Les deux traductions ne peuvent pas diverger
silencieusement.

### i18n

**Chaque version est intégralement dans sa langue** : la version française ne
contient aucun anglais (titres compris), la version anglaise aucun français.

Routes `/fr` et `/en`, toutes deux prérendues statiquement
(`generateStaticParams`). `/` redirige vers `/fr`. Le switch de langue est un
simple lien — aucun JavaScript de traduction n'est chargé.

Pour ajouter une langue : créer `content/xx.ts` typé `Content`, l'ajouter à
`LANGS` dans `content/types.ts` et au dictionnaire de `lib/i18n.ts`.

## Le formulaire — à brancher avant la mise en production

`app/api/apply/route.ts` valide la candidature (avec le **même module** que le
client, `lib/validate.ts` : le serveur ne fait jamais confiance au navigateur),
applique une limite de débit, filtre les bots… puis **se contente de journaliser
la candidature**.

> ⚠️ **En l'état, les candidatures ne sont écrites nulle part.** Un redémarrage
> du serveur les perd. Brancher une destination réelle avant tout lancement —
> les emplacements sont marqués `TODO` dans le fichier (Resend, Supabase,
> Airtable…).

Protections déjà en place : champ piège (honeypot), délai minimal de
remplissage, limite de 5 envois par IP et par heure. La limite est **en
mémoire** : en déploiement multi-instance ou serverless, la remplacer par
Upstash Redis ou Vercel KV.

## Design — thème clair

Le contraste **DIGITAL vs PHYSICAL** ne passe plus par l'obscurité mais par la
matière : papier, ombres douces, grain léger.

Les **noms** de tokens viennent de la version sombre ; seules leurs valeurs ont
changé. Ils décrivent donc un rôle, pas une couleur — ce qui permet de basculer
tout le site depuis `app/globals.css` sans toucher aux `className`.

| Token    | Valeur    | Rôle               | Contraste       |
| -------- | --------- | ------------------ | --------------- |
| `void`   | `#FBFAF8` | fond principal     | —               |
| `carbon` | `#F2F0EC` | sections alternées | —               |
| `ash`    | `#FFFFFF` | cartes             | —               |
| `slate`  | `#E3E0DA` | bordures           | —               |
| `chalk`  | `#16161A` | texte principal    | 17.3:1          |
| `smoke`  | `#5B5B66` | texte secondaire   | 6.4:1           |
| `ember`  | `#C2410C` | accent unique      | 4.96:1 / 5.18:1 |

**L'accent est rationné** : point du badge, CTA principal, numéros d'étapes,
liseré de la section Founding. Jamais en aplat sur une grande surface.

> L'ancien rouge `#FF3B14` **échouait** en thème clair (4.15:1 en texte,
> 4.33:1 en bouton). D'où `#C2410C`, et un bouton principal en texte **blanc**
> — l'inverse de ce qu'imposait le thème sombre.

### Catégories

`content/categories.ts` — sept catégories (Action, Aventure, Enfants, Chill,
Réflexion, Narratif, Rétro), chacune avec sa couleur, toutes vérifiées AA.

L'interface reste neutre : un FPS sombre et un jeu enfant coloré cohabitent
sans que le site prenne parti. **La couleur ne porte jamais seule
l'information** — chaque puce affiche son libellé, et les filtres sont des
boutons `aria-pressed`, pas des pastilles.

### Scènes de la page d'accueil

Deux scènes portent le récit, toutes deux en CSS pur :

- **`ProblemShelf`** — une étagère (deux montants, une planche, ombres de
  contact) portant les trois obstacles. Elle est **vide de jeux** : le titre
  de la section dit « ... *sauf* sur nos étagères », y poser des boîtiers
  contredirait la phrase. Sous 768 px, une planche par carte plutôt que trois
  cartes compressées.
- **`DeliveryScene`** — un camion traverse la route de l'écran du dev à la
  maison du joueur, en passant par l'usine ; les stations s'allument à son
  passage. SVG inline + `@keyframes`, aucun JS de séquençage (l'ancien
  `Pipeline` faisait tourner un `setInterval`). `useReveal` sert seulement à
  démarrer l'animation à l'entrée dans le viewport.

En `prefers-reduced-motion`, le camion se fige **au milieu de la route** —
pas hors cadre — et toutes les stations restent allumées.

L'étagère **garnie** (`BoxShelf`, cinq boîtiers) reste dans « Pourquoi
maintenant » : c'est là qu'une étagère pleine a du sens, en contrepoint.

### Animation

`lib/useTilt.ts` porte le tilt 3D du boîtier du hero **et** des cartes. Deux
portées : `window` (le boîtier suit le pointeur en permanence) et `element`
(une carte réagit à son propre survol, et la boucle rAF ne tourne qu'entre
`pointerenter` et `pointerleave` — indispensable avec vingt cartes à l'écran).

Amplitude des cartes : 6-8°, contre 46° pour le boîtier. Au-delà, le texte
devient pénible à lire. Le tilt est réservé aux surfaces qui se lisent comme
des **objets** — jamais les titres, paragraphes ou champs de formulaire.

### Accessibilité

Contrastes AA vérifiés, un seul `<h1>`, landmarks et `aria-labelledby` sur
chaque section, skip-link, focus visible partout, formulaire entièrement
navigable au clavier avec `aria-invalid` / `aria-describedby` et mise au focus
du premier champ en erreur.

`prefers-reduced-motion` neutralise toutes les animations en une seule règle
CSS — les blocs `.reveal` se figent en position **visible**, jamais masquée.

## Firebase & Cloudinary — mise en route

Copiez `.env.example` en `.env.local` et renseignez vos valeurs. **Aucune clé
ne doit être commitée** : `.gitignore` couvre déjà `.env*`.

### Firebase (authentification Google)

1. Console Firebase → **Authentication** → Sign-in method → activer **Google**.
2. **Authentication → Settings → Authorized domains** : ajouter `localhost`
   et votre domaine de production. Sans cela, la fenêtre de connexion est
   rejetée.
3. **Paramètres du projet → Vos applications → Web** : copier la config dans
   les variables `NEXT_PUBLIC_FIREBASE_*`.

Ces clés sont **publiques par conception** : elles identifient le projet, elles
ne l'autorisent pas. La sécurité vient des règles Firestore et de la liste des
domaines autorisés.

### Règles Firestore — le point critique

Le rôle (`client` / `dev` / `admin`) vit dans `users/{uid}`. **Il ne doit
jamais être modifiable depuis le navigateur**, sinon n'importe qui peut
s'attribuer `admin` en rejouant une requête :

```js
match /users/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid
                && request.resource.data.role == "client";
  // Mise à jour : tout sauf le rôle.
  allow update: if request.auth != null && request.auth.uid == uid
                && request.resource.data.role == resource.data.role;
}
```

Le passage d'un compte en `admin` se fait à la main depuis la console Firebase.

### Cloudinary

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est public (il apparaît dans les URLs).
- `CLOUDINARY_API_SECRET` est un **secret serveur**. `lib/cloudinary.ts` porte
  `import "server-only"` : la compilation échoue si ce module est importé
  depuis un composant client. Ne retirez pas cette ligne.
- Pour afficher une image, utilisez `imageUrl()` de `lib/images.ts` — il ne
  manipule que le cloud name et fonctionne partout.

> ⚠️ **`/api/upload-signature` n'est pas encore protégée.** N'importe qui peut
> aujourd'hui demander une signature. Avant d'ouvrir l'upload aux studios, il
> faut vérifier le jeton Firebase côté serveur (`firebase-admin` →
> `verifyIdToken`) et limiter le débit. Le TODO est en tête du fichier.

### Sans configuration

Le site fonctionne sans aucune de ces variables : la boutique se parcourt, et
la page de connexion affiche un message d'indisponibilité plutôt qu'un bouton
inerte.

## Ce qui reste à brancher

| Chantier               | Emplacement prévu                            |
| ---------------------- | -------------------------------------------- |
| Destination formulaire | `app/api/apply/route.ts` (TODO)              |
| Vraie authentification | remplacer `lib/session.tsx` (Auth.js + base) |
| Paiement Stripe        | `app/api/stripe/` + bouton dans `CartView`   |
| Catalogue réel         | remplacer `content/games.ts` par une source  |
| Upload de builds       | `app/api/builds/`                            |
| Commandes & suivi      | `app/api/orders/`                            |
| Royalties              | `app/(app)/dashboard/royalties/`             |

Le panier et la session sont isolés derrière `useCart()` et `useSession()` :
brancher un vrai backend revient à réimplémenter ces deux modules, sans
toucher aux composants qui les consomment.

## Avant de mettre en ligne

- [ ] Brancher une vraie destination pour le formulaire (`api/apply`)
- [ ] Renseigner `NEXT_PUBLIC_SITE_URL` (voir `.env.example`)
- [ ] Remplacer les liens sociaux `href="#"` dans `content/{fr,en}.ts`
- [ ] Confirmer l'adresse de contact (`CONTACT_EMAIL` dans `lib/i18n.ts`)
- [ ] Vérifier que le minimum de 50 exemplaires correspond bien à l'offre
      (mentionné dans le hero, la section Problème, la FAQ et les métadonnées)
- [ ] **Ne pas ouvrir la boutique** sans prestataire de paiement, CGV,
      politique de remboursement et mentions légales (droit de rétractation,
      TVA)
- [ ] Remplacer la session simulée par une vraie authentification avant toute
      collecte de compte réelle
- [ ] Remplacer le catalogue fictif par les jeux réellement sous contrat
- [ ] Remplacer la limite de débit en mémoire si déploiement serverless
