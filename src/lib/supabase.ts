import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseKey);
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export interface FloodIncident {
  id: string;
  timestamp: string;
  location: string;
  lat: number;
  lon: number;
  water_level_cm: number | null;
  description: string;
  reported_by: string;
  verified: boolean;
  severity: "low" | "moderate" | "high" | "critical";
}

export async function insertFloodIncident(incident: Omit<FloodIncident, "id">) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client
    .from("flood_incidents")
    .insert(incident)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentFloodIncidents(limit = 50) {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("flood_incidents")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as FloodIncident[];
}
