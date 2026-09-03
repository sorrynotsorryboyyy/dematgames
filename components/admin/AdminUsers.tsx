"use client";

import { Empty, LoadError, Loading } from "@/components/admin/AdminApplications";
import { adminFetch } from "@/lib/admin-client";
import { ROLES, type Role, type UserDoc } from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";

/**
 * Utilisateurs et rôles.
 *
 * Le changement de rôle passe par le serveur (PATCH /api/admin/users) : les
 * règles Firestore interdisent au navigateur d'écrire ce champ, y compris
 * pour un admin. Sans ce verrou, une requête forgée depuis la console
 * suffirait à s'attribuer les droits.
 */

const ROLE_LABELS: Record<Role, string> = {
  client: "Client",
  dev: "Développeur",
  admin: "Administrateur",
};

export function AdminUsers({
  getToken,
  currentUid,
}: {
  getToken: () => Promise<string | null>;
  currentUid: string;
}) {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");

  const fetchUsers = useCallback(
    () => adminFetch<{ users: UserDoc[] }>("users", getToken),
    [getToken],
  );

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof fetchUsers>>) => {
      if (result.ok && result.data) {
        setUsers(result.data.users);
        setState("ready");
      } else {
        setState("error");
      }
    },
    [],
  );

  const load = useCallback(
    () => fetchUsers().then(apply),
    [fetchUsers, apply],
  );

  useEffect(() => {
    // `load` est async : son setState se produit dans une continuation, pas
    // dans le corps de l'effet. Le drapeau `cancelled` évite d'écrire sur un
    // composant démonté si l'admin change d'onglet pendant la requête.
    let cancelled = false;
    void load().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const changeRole = useCallback(
    async (uid: string, role: Role) => {
      setNotice("");
      const result = await adminFetch("users", getToken, {
        method: "PATCH",
        body: { uid, role },
      });

      if (!result.ok) {
        setNotice(
          result.error === "cannot_demote_self"
            ? "Vous ne pouvez pas retirer vos propres droits d'administration."
            : "La modification a échoué.",
        );
        return;
      }
      setUsers((list) => list.map((u) => (u.uid === uid ? { ...u, role } : u)));
    },
    [getToken],
  );

  if (state === "loading") return <Loading />;
  if (state === "error") return <LoadError onRetry={load} />;
  if (users.length === 0) {
    return <Empty>Aucun compte pour l&apos;instant.</Empty>;
  }

  return (
    <div>
      {notice && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-ember/45 bg-[var(--color-ember-soft)] p-4 text-[0.9rem] text-chalk"
        >
          {notice}
        </p>
      )}

      <p className="text-[0.9rem] text-smoke">
        {users.length} compte{users.length > 1 ? "s" : ""}
      </p>

      <ul className="mt-4 space-y-3">
        {users.map((user) => (
          <li key={user.uid} className="card flex flex-wrap items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                user.avatarSource === "google" && user.googlePhotoURL
                  ? user.googlePhotoURL
                  : `/api/avatar/${user.memberNumber}`
              }
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full border border-slate bg-carbon"
              referrerPolicy="no-referrer"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[0.98rem] font-medium text-chalk">
                {user.name || "—"}{" "}
                <span className="numeric text-[0.8rem] font-normal text-ember">
                  #{user.memberNumber}
                </span>
              </p>
              <p className="truncate text-[0.85rem] text-smoke">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => {
                // Un admin ne peut pas se rétrograder : le serveur le refuse
                // déjà, on désactive le bouton pour ne pas le proposer.
                const locked = user.uid === currentUid && role !== "admin";
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={locked}
                    onClick={() => changeRole(user.uid, role)}
                    aria-pressed={user.role === role}
                    className={`rounded-lg border px-3 py-1.5 text-[0.8rem] transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                      user.role === role
                        ? "border-ember bg-[var(--color-ember-soft)] text-chalk"
                        : "border-slate bg-ash text-smoke hover:border-smoke"
                    }`}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
