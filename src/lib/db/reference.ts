import "server-only";
import { getDb } from "./client";
import type { Database } from "@/lib/supabase/database.types";

type ReadingRow = Database["public"]["Tables"]["sensor_readings"]["Row"];

export interface MapCenter {
  id: string;
  name: string;
  address: string | null;
  purok: string | null;
  lat: number;
  lon: number;
  capacity: number | null;
  role: string | null;
  sector: string | null;
  elevationM: number | null;
  elevationLabel: string | null;
  imageQuery: string | null;
  amenities: string[];
  contact: string | null;
  verified: boolean;
  dataSource: string | null;
  notes: string | null;
}

export interface HazardZone {
  id: string;
  name: string;
  severity: string;
  radiusM: number | null;
  lat: number | null;
  lon: number | null;
  description: string | null;
}

export interface RiverSensor {
  id: string;
  stationId: string | null;
  name: string;
  purok: string | null;
  lat: number;
  lon: number;
  normalLevelM: number | null;
  warningLevelM: number | null;
  dangerLevelM: number | null;
  status: string;
  dataSource: string;
  isSimulated: boolean;
  latest: {
    timestamp: string;
    waterLevelM: number | null;
    flowCms: number | null;
    batteryPct: number | null;
  } | null;
}

export interface FloodIncidentSummary {
  id: string;
  timestamp: string;
  location: string | null;
  lat: number | null;
  lon: number | null;
  waterLevelCm: number | null;
  severity: string | null;
  description: string | null;
}

function toNumber(value: number | string | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function getEvacuationCenters(): Promise<MapCenter[]> {
  const { data, error } = await getDb()
    .from("evacuation_centers")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    purok: row.purok,
    lat: Number(row.lat),
    lon: Number(row.lon),
    capacity: toNumber(row.capacity),
    role: row.role,
    sector: row.sector,
    elevationM: toNumber(row.elevation_m),
    elevationLabel: row.elevation_label,
    imageQuery: row.image_query,
    amenities: row.amenities ?? [],
    contact: row.contact,
    verified: row.verified,
    dataSource: row.data_source,
    notes: row.notes,
  }));
}

export async function getHazardZones(): Promise<HazardZone[]> {
  const { data, error } = await getDb()
    .from("hazard_zones")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => {
    const point = (row.geometry ?? null) as { type?: string; coordinates?: unknown } | null;
    const coordinates = point && Array.isArray(point.coordinates) ? (point.coordinates as number[]) : [];
    return {
      id: row.id,
      name: row.name,
      severity: row.severity,
      radiusM: toNumber(row.radius_m),
      lat: toNumber(coordinates[1]),
      lon: toNumber(coordinates[0]),
      description: row.description,
    };
  });
}

export async function getSensorsWithLatestReadings(): Promise<RiverSensor[]> {
  const [{ data: sensors, error: sensorError }, { data: readings, error: readingError }] = await Promise.all([
    getDb().from("sensors").select("*").eq("is_active", true).order("station_id"),
    getDb().from("sensor_readings").select("*").order("timestamp", { ascending: false }).limit(1000),
  ]);

  if (sensorError) throw sensorError;
  if (readingError) throw readingError;

  const latestBySensor = new Map<string, ReadingRow>();
  for (const reading of readings ?? []) {
    if (!latestBySensor.has(reading.sensor_id)) {
      latestBySensor.set(reading.sensor_id, reading);
    }
  }

  return (sensors ?? []).map((row) => {
    const latest = latestBySensor.get(row.id);
    return {
      id: row.id,
      stationId: row.station_id,
      name: row.name,
      purok: row.purok,
      lat: Number(row.lat),
      lon: Number(row.lon),
      normalLevelM: toNumber(row.normal_level_m),
      warningLevelM: toNumber(row.warning_level_m),
      dangerLevelM: toNumber(row.danger_level_m),
      status: row.status,
      dataSource: row.data_source,
      isSimulated: row.is_simulated,
      latest: latest
        ? {
            timestamp: latest.timestamp,
            waterLevelM: toNumber(latest.water_level_m),
            flowCms: toNumber(latest.flow_cms),
            batteryPct: toNumber(latest.battery_pct),
          }
        : null,
    };
  });
}

export async function getVerifiedFloodIncidents(limit = 50): Promise<FloodIncidentSummary[]> {
  const { data, error } = await getDb()
    .from("flood_incidents")
    .select("*")
    .eq("verified", true)
    .not("lat", "is", null)
    .not("lon", "is", null)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    location: row.location,
    lat: toNumber(row.lat),
    lon: toNumber(row.lon),
    waterLevelCm: toNumber(row.water_level_cm),
    severity: row.severity,
    description: row.description,
  }));
}