import "server-only";

import type { User } from "@supabase/supabase-js";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { hasCapability, isAppRole, type AppRole, type Capability } from "./roles";

export type AuthorizationContext = {
  user: User | null;
  role: AppRole | null;
};

export async function getAuthorizationContext(): Promise<AuthorizationContext> {
  if (!isSupabaseConfigured()) return { user: null, role: null };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  const { data, error } = await supabase.rpc("current_app_role");
  if (error || !isAppRole(data)) return { user, role: null };

  return { user, role: data };
}

export async function hasServerCapability(capability: Capability): Promise<AuthorizationContext & { allowed: boolean }> {
  const context = await getAuthorizationContext();
  return { ...context, allowed: hasCapability(context.role, capability) };
}
