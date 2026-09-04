import { adminDb, isAdminConfigured } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { isValidEmail } from "@/lib/validate";

/**
 * Désinscription de l'alerte d'ouverture.
 *
 * Route PUBLIQUE et sans authentification : c'est une obligation, pas un
 * choix. Un message publicitaire doit offrir un moyen SIMPLE de s'opposer à
 * de nouveaux envois (art. L34-5 du code des postes ; RGPD art. 21).
 * Demander de créer un compte pour se désinscrire ne remplirait pas cette
 * obligation.
 *
 * Le risque assumé : n'importe qui connaissant une adresse peut la
 * désinscrire. C'est le compromis retenu par la plupart des services, et il
 * penche du bon côté — désinscrire à tort est bénin, empêcher de se
 * désinscrire ne l'est pas.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim() ?? "";

  // Réponse toujours identique, quelle que soit l'issue : confirmer qu'une
  // adresse figurait ou non dans la liste révélerait son existence à qui
  // ferait des essais.
  if (isValidEmail(email) && isAdminConfigured) {
    const db = adminDb();
    if (db) {
      try {
        await db
          .collection(COLLECTIONS.subscribers)
          .doc(encodeURIComponent(email.toLowerCase()))
          .delete();
      } catch (e) {
        console.error("[unsubscribe] suppression impossible", e);
      }
    }
  }

  return new Response(page(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Une page de désinscription n'a rien à faire dans un index.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/**
 * Page de confirmation, autonome.
 *
 * Volontairement sans dépendance au reste du site : elle doit s'afficher
 * même si tout le reste est en panne, puisqu'elle est atteinte depuis un
 * client de messagerie.
 */
function page(): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Désinscription — dematgames.com</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;
       background:#fbfaf8;color:#16161a;
       font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
  main{max-width:32rem;padding:2.5rem 1.5rem;text-align:center}
  h1{font-size:1.5rem;margin:0 0 1rem}
  p{color:#5b5b66;line-height:1.7;margin:0 0 1.5rem}
  a{color:#c2410c}
</style>
</head>
<body>
<main>
  <h1>C'est fait.</h1>
  <p>Vous ne recevrez plus de message de notre part. Si cette adresse ne
  figurait pas dans notre liste, il n'y a rien à faire de plus.</p>
  <p><a href="/fr">Retour à dematgames.com</a></p>
</main>
</body>
</html>`;
}
