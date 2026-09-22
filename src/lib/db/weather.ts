import "server-only";
import { getDb } from "./client";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ReadingRow = Database["public"]["Tables"]["weather_readings"]["Row"];
type ReadingInsert = Database["public"]["Tables"]["weather_readings"]["Insert"];
type HourlyInsert = Database["public"]["Tables"]["weather_hourly"]["Insert"];

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_SOURCE = "openweather";

export function hourBucket(date: Date): string {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function maximum(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values);
}

type RollupRow = {
  temperature: number | null;
  humidity: number | null;
  rainfall_mm: number | null;
  wind_speed_kmh: number | null;
  pressure_hpa: number | null;
};

function numbersOf(rows: RollupRow[], key: keyof RollupRow): number[] {
  return rows
    .map((row) => row[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

export async function insertReading(reading: ReadingInsert): Promise<ReadingRow> {
  const { data, error } = await getAdminClient()
    .from("weather_readings")
    .insert(reading)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReadingsSince(since: string): Promise<ReadingRow[]> {
  const { data, error } = await getDb()
    .from("weather_readings")
    .select("*")
    .gte("timestamp", since)
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function upsertHourlyBucket(bucket: string, values: Omit<HourlyInsert, "bucket" | "source">, source = DEFAULT_SOURCE) {
  const { error } = await getAdminClient()
    .from("weather_hourly")
    .upsert({ bucket, source, ...values }, { onConflict: "bucket,source" });

  if (error) throw error;
}

/**
 * Rebuilds one hour's rollup from raw readings.
 *
 * OpenWeatherMap reports `rain.1h` as an accumulation over the preceding hour,
 * so samples taken every ~10 min all describe overlapping windows. The hour's
 * rainfall is therefore the peak sample, not the sum of samples.
 */
export async function rollupHour(bucket: string, source = DEFAULT_SOURCE): Promise<boolean> {
  const end = new Date(new Date(bucket).getTime() + HOUR_MS).toISOString();

  const { data, error } = await getAdminClient()
    .from("weather_readings")
    .select("temperature, humidity, rainfall_mm, wind_speed_kmh, pressure_hpa")
    .eq("source", source)
    .gte("timestamp", bucket)
    .lt("timestamp", end);

  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return false;

  await upsertHourlyBucket(
    bucket,
    {
      avg_temp: average(numbersOf(rows, "temperature")),
      sum_rain_mm: maximum(numbersOf(rows, "rainfall_mm")),
      avg_humidity: average(numbersOf(rows, "humidity")),
      avg_wind_kmh: average(numbersOf(rows, "wind_speed_kmh")),
      max_wind_kmh: maximum(numbersOf(rows, "wind_speed_kmh")),
      avg_pressure: average(numbersOf(rows, "pressure_hpa")),
    },
    source
  );

  return true;
}

export async function getHourlyBuckets(hours: number, source = DEFAULT_SOURCE) {
  const { data, error } = await getDb()
    .from("weather_hourly")
    .select("bucket, sum_rain_mm")
    .eq("source", source)
    .order("bucket", { ascending: false })
    .limit(hours);

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({ bucket: row.bucket, rainMm: Number(row.sum_rain_mm ?? 0) }))
    .reverse();
}

export async function cumulativeRain(hours: number, source = DEFAULT_SOURCE): Promise<number> {
  const buckets = await getHourlyBuckets(hours, source);
  return buckets.reduce((sum, bucket) => sum + bucket.rainMm, 0);
}
