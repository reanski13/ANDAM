import { createServerClient as createServerSupabaseClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function createServerClient() {
  const cookieStore = await cookies();
  return createServerSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // Server Components cannot write cookies; session refresh happens in proxy.ts.
        }
      },
    },
  });
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function isOfficial(user: User | null): boolean {
  return Boolean(user?.app_metadata && user.app_metadata.is_official === true);
}