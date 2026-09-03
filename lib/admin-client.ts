"use client";

/**
 * Appels authentifiés vers /api/admin/*.
 *
 * Le jeton est demandé au SDK Firebase à CHAQUE appel plutôt que mis en
 * cache : `getIdToken()` le rafraîchit tout seul à l'expiration (une heure).
 * Un jeton conservé côté appelant finirait par être refusé sans qu'on
 * comprenne pourquoi.
 */

export interface AdminResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function adminFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  init?: { method?: string; body?: unknown },
): Promise<AdminResult<T>> {
  const token = await getToken();
  if (!token) return { ok: false, error: "not_signed_in" };

  try {
    const response = await fetch(`/api/admin/${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        ok: false,
        error: typeof payload.error === "string" ? payload.error : "http_error",
      };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, error: "network" };
  }
}
