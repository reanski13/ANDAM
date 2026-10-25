import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { getAuthorizationContext } from "@/lib/authorization/server";
import { hasCapability } from "@/lib/authorization/roles";

export const dynamic = "force-dynamic";

export default async function AccessDeniedPage() {
  const { user, role } = await getAuthorizationContext();
  if (!user) redirect("/admin/login");
  if (hasCapability(role, "admin.dashboard.read")) redirect("/admin");

  return (
    <main className="sky-surface min-h-screen px-4 py-24">
      <section className="glass-card max-w-xl mx-auto p-8 space-y-5">
        <span className="material-symbols-outlined text-[32px] text-warning">gpp_bad</span>
        <div className="space-y-2">
          <h1 className="font-display-lg text-display-lg text-on-sky tracking-tight">Access not yet granted</h1>
          <p className="font-body-lg text-body-lg text-on-sky-dim">
            Your account is signed in, but it does not have a current ANDAM official role. Ask an Administrator to grant the appropriate access.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-glass text-on-sky hover:bg-glass-elevated font-title-sm transition-colors">
            Return to monitoring
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
