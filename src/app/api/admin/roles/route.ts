import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { hasServerCapability } from "@/lib/authorization/server";
import { APP_ROLES, ROLE_LABELS } from "@/lib/authorization/roles";

const roleChangeSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(APP_ROLES),
  reason: z.string().trim().min(5).max(280),
});

const revokeSchema = roleChangeSchema.pick({ userId: true, reason: true });

async function requireRoleManagement() {
  const authorization = await hasServerCapability("admin.roles.manage");
  if (!authorization.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication is required." } },
      { status: 401 }
    );
  }
  if (!authorization.allowed) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Administrator access is required." } },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const denied = await requireRoleManagement();
  if (denied) return denied;

  try {
    const admin = getAdminClient();
    const [{ data: roles, error: rolesError }, { data: users, error: usersError }] = await Promise.all([
      admin.from("user_roles").select("user_id, role, granted_at").order("granted_at", { ascending: false }),
      admin.auth.admin.listUsers({ page: 1, perPage: 100 }),
    ]);

    if (rolesError || usersError) throw new Error("Unable to load official accounts.");

    const roleByUserId = new Map(roles.map((role) => [role.user_id, role]));
    return NextResponse.json({
      users: users.users.map((user) => {
        const role = roleByUserId.get(user.id);
        const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
        return {
          id: user.id,
          email: user.email ?? null,
          name,
          role: role?.role ?? null,
          roleLabel: role ? ROLE_LABELS[role.role] : null,
          grantedAt: role?.granted_at ?? null,
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "UNAVAILABLE", message: "Official account management is unavailable." } },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireRoleManagement();
  if (denied) return denied;

  const parsed = roleChangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Provide an account, role, and a 5 to 280 character reason." } },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.rpc("admin_set_user_role", {
    p_target_user_id: parsed.data.userId,
    p_role: parsed.data.role,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return NextResponse.json(
      { error: { code: "ROLE_CHANGE_FAILED", message: "The role change could not be completed." } },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireRoleManagement();
  if (denied) return denied;

  const parsed = revokeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Provide an account and a 5 to 280 character reason." } },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.rpc("admin_revoke_user_role", {
    p_target_user_id: parsed.data.userId,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return NextResponse.json(
      { error: { code: "ROLE_REVOKE_FAILED", message: "The role revocation could not be completed." } },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
