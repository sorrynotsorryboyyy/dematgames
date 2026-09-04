/**
 * Diagnostic de la configuration e-mail (Resend).
 *
 * Usage :  node scripts/check-mail.mjs
 *          node scripts/check-mail.mjs --send    (envoie un vrai message)
 *
 * Répond à la seule question qui compte : « pourquoi l'e-mail ne part-il
 * pas ? ». Les refus de Resend se ressemblent tous (403) mais recouvrent des
 * causes très différentes — domaine non vérifié, expéditeur non autorisé,
 * destinataire interdit en bac à sable. Ce script les distingue.
 *
 * Sans `--send`, aucun message n'est expédié : seule la configuration est
 * inspectée.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEND = process.argv.includes("--send");

/**
 * Termine en signalant un échec, sans interrompre le processus.
 *
 * `process.exit()` coupe Node alors que `fetch` garde encore des ressources
 * ouvertes, ce qui provoque une assertion libuv sur Windows. Fixer le code
 * de sortie laisse la boucle d'événements se vider d'elle-même — mais
 * n'arrête PAS l'exécution : chaque appel doit donc être suivi d'un `return`
 * ou tenir dans une branche.
 */
function fail() {
  process.exitCode = 1;
}

// --- Lecture de .env.local (même approche que les autres scripts) --------
function env(key) {
  if (process.env[key]) return process.env[key];
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

const key = (env("RESEND_API_KEY") || "").trim();
const from = (env("RESEND_FROM") || "").trim();
const to = (env("NOTIFY_EMAIL") || "").trim();

const line = "  " + "-".repeat(58);

await main();

async function main() {
  console.log("");
  console.log("  Configuration");
  console.log(line);

  // --- 1. La clé ---------------------------------------------------------
  if (!key) {
    console.log("  ✗ RESEND_API_KEY absente");
    console.log("    Les e-mails ne partiront pas. Le site fonctionne quand");
    console.log("    même : les candidatures sont enregistrées en base.");
    console.log("");
    return fail();
  }

  if (!key.startsWith("re_")) {
    console.log(
      `  ✗ RESEND_API_KEY ne commence pas par « re_ » (${key.slice(0, 4)}…)`,
    );
    console.log("    Ce n'est probablement pas la clé d'API mais une autre");
    console.log("    valeur fournie par Resend. Reprenez-la dans API Keys.");
    console.log("");
    return fail();
  }

  console.log(`  ✓ RESEND_API_KEY      ${key.length} caractères, préfixe correct`);
  console.log(`  ${from ? "✓" : "✗"} RESEND_FROM         ${from || "absente"}`);
  console.log(`  ${to ? "✓" : "✗"} NOTIFY_EMAIL        ${to || "absente"}`);

  // --- 2. Les domaines ---------------------------------------------------
  console.log("");
  console.log("  Domaines chez Resend");
  console.log(line);
  await showDomains();

  // --- 3. L'envoi --------------------------------------------------------
  console.log("");
  console.log("  Envoi");
  console.log(line);

  if (!SEND) {
    console.log("  · Non testé. Relancez avec --send pour envoyer un message.");
    console.log("");
    return;
  }

  if (!from || !to) {
    console.log("  ✗ RESEND_FROM et NOTIFY_EMAIL sont requis pour l'essai.");
    console.log("");
    return fail();
  }

  await trySend();
}

async function showDomains() {
  const response = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (response.status === 401) {
    // Attendu avec une clé « sending only » : c'est le bon réglage de
    // sécurité, et non une erreur de configuration.
    console.log("  · Liste illisible — clé restreinte à l'envoi.");
    console.log("    C'est le réglage recommandé. Vérifiez l'état du domaine");
    console.log("    sur resend.com/domains.");
    return;
  }

  if (!response.ok) {
    console.log(`  ? Réponse inattendue : ${response.status}`);
    return;
  }

  const { data = [] } = await response.json();

  if (data.length === 0) {
    console.log("  ✗ Aucun domaine déclaré.");
    console.log("    Seul le bac à sable est utilisable : expédition depuis");
    console.log("    onboarding@resend.dev, et uniquement vers votre propre");
    console.log("    adresse de compte.");
    return;
  }

  for (const d of data) {
    console.log(`  ${d.status === "verified" ? "✓" : "✗"} ${d.name} — ${d.status}`);
  }
}

async function trySend() {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "dematgames.com — vérification de configuration",
      text:
        "Ce message confirme que l'envoi fonctionne.\n\n" +
        `Expéditeur   : ${from}\n` +
        `Destinataire : ${to}\n`,
    }),
  });

  const body = await response.text();

  if (response.ok) {
    console.log(`  ✓ Message envoyé de ${from} vers ${to}`);
    console.log("    Vérifiez la boîte de réception (et les indésirables).");
    console.log("");
    return;
  }

  console.log(`  ✗ Refusé — HTTP ${response.status}`);
  console.log(`    ${body.slice(0, 240)}`);
  console.log("");

  // Les deux causes qui reviennent, et leur remède.
  if (/not verified/i.test(body)) {
    console.log("    Le domaine de RESEND_FROM n'est pas vérifié chez Resend.");
    console.log("    Ajoutez-le sur resend.com/domains et créez les");
    console.log("    enregistrements DNS demandés.");
  } else if (/your own email address/i.test(body)) {
    console.log("    Bac à sable : tant qu'aucun domaine n'est vérifié, seule");
    console.log("    l'adresse du titulaire du compte peut recevoir.");
  }

  console.log("");
  fail();
}
