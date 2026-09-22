import { getEvacuationCenters, getHazardZones, getSensorsWithLatestReadings, getVerifiedFloodIncidents } from "@/lib/db/reference";
import { ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
};
let cache: { data: unknown; at: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return ok(cache.data, { headers: CACHE_HEADERS });
  }

  try {
    const results = await Promise.allSettled([
      getEvacuationCenters(),
      getHazardZones(),
      getSensorsWithLatestReadings(),
      getVerifiedFloodIncidents(50),
    ]);

    const payload = {
      centers: results[0].status === "fulfilled" ? results[0].value : [],
      zones: results[1].status === "fulfilled" ? results[1].value : [],
      sensors: results[2].status === "fulfilled" ? results[2].value : [],
      incidents: results[3].status === "fulfilled" ? results[3].value : [],
      fetchedAt: new Date().toISOString(),
    };

    cache = { data: payload, at: Date.now() };

    return ok(payload, { headers: CACHE_HEADERS });
  } catch (error) {
    return serverError(error, "REFERENCE_DATA_FAILED");
  }
}