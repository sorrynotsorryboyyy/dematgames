/**
 * Envoie les visuels de jaquette vers Cloudinary.
 *
 * Usage :  node scripts/upload-cover.mjs
 *
 * Le script est IDEMPOTENT : `overwrite` remplace le fichier au même
 * identifiant plutôt que d'en créer un second, et `invalidate` purge le cache
 * CDN pour que la nouvelle version soit servie immédiatement. Relancer le
 * script après avoir modifié une image met donc le site à jour.
 *
 * Le fichier source reste dans public/brand/ : c'est le repli quand
 * Cloudinary n'est pas configuré (un `git clone` frais, par exemple), et la
 * source à réenvoyer.
 */
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const ROOT = process.cwd();

// --- Lecture de .env.local (même approche que scripts/seed.mjs) -----------
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

const cloudName = env("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
const apiKey = env("CLOUDINARY_API_KEY");
const apiSecret = env("CLOUDINARY_API_SECRET");

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "✗ Cloudinary n'est pas configuré. Renseignez dans .env.local :\n" +
      "  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Visuels à envoyer.
 *
 * `public_id` sert de clé : c'est lui qu'on inscrit dans `coverId` sur le jeu
 * (content/games.ts). Le dossier est imposé ici, jamais construit à partir
 * d'une saisie.
 */
const ASSETS = [
  {
    file: "public/brand/looptapecover.png",
    publicId: "dematgames/covers/looptape-elevator",
    label: "LoopTape | Elevator",
  },
  {
    file: "public/brand/ludilandjaquette.png",
    publicId: "dematgames/covers/ludiland-noel",
    label: "LudiLand | Noël",
  },
];

let failures = 0;

for (const asset of ASSETS) {
  const source = path.join(ROOT, asset.file);

  if (!fs.existsSync(source)) {
    console.error(`✗ ${asset.label} — fichier introuvable : ${asset.file}`);
    failures += 1;
    continue;
  }

  const sizeKo = Math.round(fs.statSync(source).size / 1024);

  try {
    const result = await cloudinary.uploader.upload(source, {
      public_id: asset.publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });

    console.log(`✓ ${asset.label}`);
    console.log(`   source  ${asset.file} (${sizeKo} Ko)`);
    console.log(`   id      ${result.public_id}`);
    console.log(`   format  ${result.width}×${result.height} ${result.format}`);
    console.log(`   version v${result.version}`);
  } catch (e) {
    console.error(`✗ ${asset.label} — échec de l'envoi : ${e.message}`);
    failures += 1;
  }
}

process.exit(failures > 0 ? 1 : 0);
