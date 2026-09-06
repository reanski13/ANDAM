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

export interface WeatherReading {
  id: string;
  source: "pagasa" | "openweather";
  timestamp: string;
  temperature: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  wind_direction: string;
  pressure_hpa: number;
  condition: string;
  lat: number;
  lon: number;
}

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

export async function insertWeatherReading(reading: Omit<WeatherReading, "id">) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client
    .from("weather_readings")
    .insert(reading)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestWeatherReadings(limit = 24) {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("weather_readings")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as WeatherReading[];
}

export async function getWeatherReadingsSince(since: string) {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("weather_readings")
    .select("*")
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data as WeatherReading[];
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
