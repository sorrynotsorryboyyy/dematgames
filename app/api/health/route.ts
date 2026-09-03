import { NextResponse } from "next/server";

/**
 * Diagnostic de configuration serveur.
 *
 * TEMPORAIRE — à retirer une fois le déploiement stabilisé.
 *
 * Ne révèle AUCUN secret : uniquement la présence des variables, leur
 * longueur, et la forme de la clé privée. Ces informations ne permettent
 * pas de reconstituer une valeur, mais suffisent à diagnostiquer une
 * variable absente, tronquée ou mal échappée.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const report: Record<string, unknown> = {
    projectId: describe(process.env.FIREBASE_ADMIN_PROJECT_ID),
    clientEmail: describe(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    privateKey: raw
      ? {
          present: true,
          length: raw.length,
          quoted: raw.startsWith('"') || raw.startsWith("'"),
          // Combien de niveaux d'échappement ?
          escapedNewlines: (raw.match(/\n/g) || []).length,
          doubleEscaped: (raw.match(/\\n/g) || []).length,
          realNewlines: (raw.match(/\n/g) || []).length,
          startsWithBegin: raw.trimStart().startsWith("-----BEGIN"),
          hasEnd: raw.includes("END PRIVATE KEY"),
        }
      : { present: false },
  };

  // Le module est importé DYNAMIQUEMENT : s'il échoue, on capture l'erreur
  // au lieu de faire planter la route entière — ce qui est exactement le
  // problème qu'on cherche à diagnostiquer.
  try {
    const mod = await import("@/lib/firebase-admin");
    report.moduleLoaded = true;
    report.isAdminConfigured = mod.isAdminConfigured;

    try {
      const db = mod.adminDb();
      report.dbCreated = Boolean(db);
      if (db) {
        const snap = await db.collection("users").limit(1).get();
        report.firestoreReachable = true;
        report.usersFound = snap.size;
      }
    } catch (e) {
      report.firestoreError = e instanceof Error ? e.message : String(e);
    }
  } catch (e) {
    report.moduleLoaded = false;
    report.moduleError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(report);
}

/** Décrit une variable sans révéler sa valeur. */
function describe(value: string | undefined) {
  if (!value) return { present: false };
  const trimmed = value.trim();
  return {
    present: true,
    length: value.length,
    quoted: value.startsWith('"') || value.startsWith("'"),
    // Signale les caractères parasites les plus courants au collage : une
    // variable qui contient un saut de ligne ou un espace a presque toujours
    // été copiée avec du texte voisin.
    hasWhitespace: /\s/.test(trimmed),
    trailingNewline: value !== value.trimEnd(),
    // Seuls les 4 derniers caractères : suffisant pour repérer une valeur
    // tronquée ou rallongée, insuffisant pour reconstituer quoi que ce soit.
    endsWith: trimmed.slice(-4),
  };
}
