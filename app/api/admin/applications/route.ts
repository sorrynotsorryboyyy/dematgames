import { readJson, requireAdmin, str } from "@/lib/api-admin";
import {
  APPLICATION_STATUSES,
  COLLECTIONS,
  type ApplicationDoc,
  type ApplicationStatus,
} from "@/lib/schema";
import { NextResponse } from "next/server";

/**
 * Candidatures reçues par le formulaire « Studios fondateurs ».
 *
 * Contiennent des données personnelles (nom, email) : les règles Firestore
 * en réservent la lecture aux admins, et cette route la vérifie côté
 * serveur avant de répondre.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function millis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const snapshot = await guard
    .db!.collection(COLLECTIONS.applications)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const applications: ApplicationDoc[] = snapshot.docs.map((doc) => {
    const d = doc.data();
    const s = (str: unknown) => (typeof str === "string" ? str : "");
    return {
      id: doc.id,
      name: s(d.name),
      email: s(d.email),
      game: s(d.game),
      link: s(d.link),
      platform: s(d.platform),
      message: s(d.message),
      status: (APPLICATION_STATUSES as readonly string[]).includes(d.status)
        ? (d.status as ApplicationStatus)
        : "new",
      createdAt: millis(d.createdAt),
      notes: s(d.notes),
    };
  });

  return NextResponse.json({ ok: true, applications });
}

/** Met à jour le statut ou les notes internes d'une candidature. */
export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const { data, error } = await readJson<{
    id?: string;
    status?: string;
    notes?: string;
  }>(request);
  if (error) return error;

  const id = str(data?.id, 128);
  if (!id) {
    return NextResponse.json({ ok: false, error: "no_id" }, { status: 422 });
  }

  const update: Record<string, unknown> = {};
  if (data?.status !== undefined) {
    if (!(APPLICATION_STATUSES as readonly string[]).includes(data.status)) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 422 },
      );
    }
    update.status = data.status;
  }
  if (data?.notes !== undefined) update.notes = str(data.notes, 4000);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "nothing" }, { status: 422 });
  }

  await guard.db!.collection(COLLECTIONS.applications).doc(id).update(update);
  return NextResponse.json({ ok: true });
}
