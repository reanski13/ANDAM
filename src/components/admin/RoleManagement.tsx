"use client";

import { useEffect, useState, useTransition } from "react";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/lib/authorization/roles";

type OfficialAccount = {
  id: string;
  email: string | null;
  name: string | null;
  role: AppRole | null;
  roleLabel: string | null;
  grantedAt: string | null;
};

export default function RoleManagement() {
  const [accounts, setAccounts] = useState<OfficialAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState<AppRole>("viewer");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadAccounts() {
    const response = await fetch("/api/admin/roles", { cache: "no-store" });
    const body = (await response.json()) as { users?: OfficialAccount[]; error?: { message?: string } };
    if (!response.ok) {
      setMessage(body.error?.message ?? "Official accounts could not be loaded.");
      return;
    }
    setAccounts(body.users ?? []);
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/roles", { cache: "no-store", signal: controller.signal })
      .then(async (response) => ({ response, body: (await response.json()) as { users?: OfficialAccount[]; error?: { message?: string } } }))
      .then(({ response, body }) => {
        if (!response.ok) {
          setMessage(body.error?.message ?? "Official accounts could not be loaded.");
          return;
        }
        setAccounts(body.users ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("Official accounts could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  function submit(method: "POST" | "DELETE") {
    if (!selectedUserId || reason.trim().length < 5) {
      setMessage("Choose an account and provide a reason of at least 5 characters.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "POST" ? { userId: selectedUserId, role, reason } : { userId: selectedUserId, reason }),
      });
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setMessage(body.error?.message ?? "The access change could not be completed.");
        return;
      }
      setReason("");
      setMessage(method === "POST" ? "Official role updated and audited." : "Official access revoked and audited.");
      await loadAccounts();
    });
  }

  return (
    <section className="glass-card p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Official access</h1>
        <p className="font-body-md text-body-md text-on-sky-dim">
          Assign one current role per authenticated account. Every change requires a reason and is recorded in the administrative audit log.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="font-label-md text-label-md text-on-sky-dim">Account</span>
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="w-full rounded-xl bg-glass border border-glass-border px-3 py-2.5 text-on-sky focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Official account">
            <option value="">Select an authenticated account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name ?? account.email ?? account.id}{account.roleLabel ? ` (${account.roleLabel})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="font-label-md text-label-md text-on-sky-dim">Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="w-full rounded-xl bg-glass border border-glass-border px-3 py-2.5 text-on-sky focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Official role">
            {APP_ROLES.map((appRole) => <option key={appRole} value={appRole}>{ROLE_LABELS[appRole]}</option>)}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="font-label-md text-label-md text-on-sky-dim">Reason for change</span>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={280} rows={3} className="w-full resize-y rounded-xl bg-glass border border-glass-border px-3 py-2.5 text-on-sky placeholder:text-on-sky-faint focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Example: Assigned as the designated shelter registration lead for Cotcot." />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => submit("POST")} disabled={isPending} className="px-4 py-2.5 rounded-full bg-accent-fill text-accent-strong font-title-sm font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent">
          {isPending ? "Saving..." : "Save role"}
        </button>
        <button type="button" onClick={() => submit("DELETE")} disabled={isPending} className="px-4 py-2.5 rounded-full bg-danger-fill text-danger font-title-sm font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-danger">
          Revoke official access
        </button>
        {message && <p className="font-body-md text-body-md text-on-sky-dim" role="status">{message}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-glass-border">
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-glass text-on-sky-dim">
            <tr>
              <th className="px-4 py-3 font-label-md">Account</th>
              <th className="px-4 py-3 font-label-md">Current role</th>
              <th className="px-4 py-3 font-label-md">Granted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {accounts.filter((account) => account.role).map((account) => (
              <tr key={account.id} className="text-on-sky">
                <td className="px-4 py-3">
                  <p className="font-title-sm">{account.name ?? "Unnamed official"}</p>
                  <p className="font-label-sm text-on-sky-dim">{account.email ?? account.id}</p>
                </td>
                <td className="px-4 py-3 font-body-md">{account.roleLabel}</td>
                <td className="px-4 py-3 font-body-md text-on-sky-dim">{account.grantedAt ? new Date(account.grantedAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
