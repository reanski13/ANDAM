import { redirect } from "next/navigation";
import RoleManagement from "@/components/admin/RoleManagement";
import { getAuthorizationContext } from "@/lib/authorization/server";
import { hasCapability } from "@/lib/authorization/roles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Official Access - ANDAM",
  description: "Manage official account roles for ANDAM",
};

export default async function OfficialAccessPage() {
  const { user, role } = await getAuthorizationContext();
  if (!user) redirect("/admin/login");
  if (!hasCapability(role, "admin.roles.manage")) redirect("/admin/access-denied");

  return (
    <main className="sky-surface min-h-screen">
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <RoleManagement />
      </div>
    </main>
  );
}
