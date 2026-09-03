import { isCloudinaryConfigured, signUpload } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

/**
 * Signature d'un upload Cloudinary.
 *
 * Le navigateur demande ici une signature, puis envoie le fichier
 * directement à Cloudinary. Le secret ne quitte jamais le serveur, et le
 * fichier ne transite pas par nous.
 *
 * ⚠️ SÉCURITÉ — cette route n'est PAS encore protégée.
 *
 * En l'état, n'importe qui peut demander une signature et déposer un fichier
 * dans le compte Cloudinary. C'est acceptable tant que la route n'est pas
 * utilisée en production ; ça ne l'est plus dès l'ouverture des uploads.
 *
 * Avant d'exposer l'upload aux développeurs, il FAUT :
 *   1. vérifier le jeton Firebase de l'appelant côté serveur
 *      (firebase-admin → verifyIdToken), et refuser les anonymes ;
 *   2. limiter le débit par utilisateur ;
 *   3. contraindre le dossier au compte de l'appelant (déjà préparé
 *      ci-dessous : `folder` est imposé serveur, jamais reçu du client).
 *
 * Voir README, section « Avant de mettre en ligne ».
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dossiers autorisés. Le client choisit un usage, pas un chemin libre. */
const FOLDERS = {
  covers: "dematgames/covers",
  blog: "dematgames/blog",
} as const;

type FolderKey = keyof typeof FOLDERS;

export async function POST(request: Request) {
  if (!isCloudinaryConfigured) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 503 },
    );
  }

  let body: { kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const kind = body.kind;
  if (typeof kind !== "string" || !(kind in FOLDERS)) {
    return NextResponse.json(
      { ok: false, error: "invalid_kind" },
      { status: 422 },
    );
  }

  const signed = signUpload({ folder: FOLDERS[kind as FolderKey] });

  return NextResponse.json({
    ok: true,
    ...signed,
    folder: FOLDERS[kind as FolderKey],
  });
}
