import { createHash, timingSafeEqual } from "node:crypto";
import { getCurrentWeather } from "@/lib/openweather";
import { scrapePagasaVisayas } from "@/lib/pagasa-scraper";
import { cumulativeRain, hourBucket, insertReading, rollupHour } from "@/lib/db/weather";
import { COTCOT } from "@/lib/constants";
import { fail, ok } from "@/lib/api/response";

const HOUR_MS = 60 * 60 * 1000;

function messageOf(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "object" && reason !== null && "message" in reason) {
    return String((reason as { message: unknown }).message);
  }
  return "unknown";
}

function hasValidCronSecret(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;

  const received = createHash("sha256").update(header).digest();
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request.headers.get("authorization"))) {
    return fail("UNAUTHORIZED", "Missing or invalid cron credentials.", 401);
  }

  const now = new Date();
  const results = {
    openWeather: false,
    pagasa: false,
    stored: false,
    rollup: false,
    cumulativeRainMm: { h6: 0, h12: 0, h24: 0 },
    errors: [] as string[],
  };

  try {
    const ow = await getCurrentWeather();

    await insertReading({
      source: "openweather",
      timestamp: now.toISOString(),
      temperature: ow.temperature,
      humidity: ow.humidity,
      rainfall_mm: ow.rain1h,
      wind_speed_kmh: ow.windSpeed,
      wind_direction: String(ow.windDeg),
      wind_direction_deg: ow.windDeg,
      pressure_hpa: ow.pressure,
      condition: ow.condition,
      lat: COTCOT.lat,
      lon: COTCOT.lon,
    });

    results.openWeather = true;
    results.stored = true;
  } catch (error) {
    results.errors.push(`OpenWeatherMap: ${messageOf(error)}`);
  }

  try {
    const pagasa = await scrapePagasaVisayas();

    await insertReading({
      source: "pagasa",
      timestamp: now.toISOString(),
      temperature: 0,
      humidity: 0,
      rainfall_mm: 0,
      wind_speed_kmh: 0,
      wind_direction: "",
      pressure_hpa: 0,
      condition: pagasa.synopsis || "N/A",
      lat: COTCOT.lat,
      lon: COTCOT.lon,
    });

    results.pagasa = true;
  } catch (error) {
    results.errors.push(`PAGASA: ${messageOf(error)}`);
  }

  try {
    results.rollup = await rollupHour(hourBucket(now));
    await rollupHour(hourBucket(new Date(now.getTime() - HOUR_MS)));

    const [h6, h12, h24] = await Promise.all([
      cumulativeRain(6),
      cumulativeRain(12),
      cumulativeRain(24),
    ]);
    results.cumulativeRainMm = { h6, h12, h24 };
  } catch (error) {
    results.errors.push(`Rollup: ${messageOf(error)}`);
  }

  return ok({
    success: true,
    results,
    timestamp: now.toISOString(),
  });
}
