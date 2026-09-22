import { getCurrentWeather, getHourlyForecast } from "@/lib/openweather";
import { scrapePagasaVisayas } from "@/lib/pagasa-scraper";
import { calculateFloodRisk } from "@/lib/alerts";
import { COTCOT } from "@/lib/constants";
import { getHourlyBuckets } from "@/lib/db/weather";
import { ok, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
};
let cache: { data: unknown; at: number } | null = null;

function messageOf(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "object" && reason !== null && "message" in reason) {
    return String((reason as { message: unknown }).message);
  }
  return "unknown";
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return ok(cache.data, { headers: CACHE_HEADERS });
  }

  try {
    const results = await Promise.allSettled([
      getCurrentWeather(),
      scrapePagasaVisayas(),
      getHourlyForecast(24),
    ]);
    const errors: string[] = [];

    const openWeather = results[0].status === "fulfilled" ? results[0].value : null;
    const pagasa = results[1].status === "fulfilled" ? results[1].value : null;
    const forecast = results[2].status === "fulfilled" ? results[2].value : null;

    if (results[0].status === "rejected") {
      errors.push(`OpenWeatherMap: ${messageOf(results[0].reason)}`);
    }
    if (results[1].status === "rejected") {
      errors.push(`PAGASA: ${messageOf(results[1].reason)}`);
    }
    if (results[2].status === "rejected") {
      errors.push(`Forecast: ${messageOf(results[2].reason)}`);
    }

    const rainfall1h = openWeather?.rain1h || 0;
    const windSpeed = openWeather?.windSpeed || 0;
    const humidity = openWeather?.humidity || 0;

    let cumulativeRainMm = { h6: 0, h12: 0, h24: 0 };
    let hourlySamples = 0;

    try {
      const buckets = await getHourlyBuckets(24);
      hourlySamples = buckets.length;

      const sumLast = (hours: number) =>
        buckets
          .slice(-hours)
          .reduce((total, bucket) => total + bucket.rainMm, 0);

      cumulativeRainMm = {
        h6: sumLast(6),
        h12: sumLast(12),
        h24: sumLast(24),
      };
    } catch (error) {
      errors.push(`History rollup: ${messageOf(error)}`);
    }

    const risk = calculateFloodRisk({
      rainfall1h,
      rainfallCumulative6h: cumulativeRainMm.h6,
      rainfallCumulative12h: cumulativeRainMm.h12,
      rainfallCumulative24h: cumulativeRainMm.h24,
      windSpeedKmh: windSpeed,
      humidity,
    });

    const payload = {
      location: COTCOT,
      current: openWeather
        ? {
            temperature: openWeather.temperature,
            feelsLike: openWeather.feelsLike,
            humidity: openWeather.humidity,
            pressure: openWeather.pressure,
            windSpeed: openWeather.windSpeed,
            windDirection: openWeather.windDeg,
            rainfall1h: openWeather.rain1h,
            condition: openWeather.condition,
            description: openWeather.description,
            icon: openWeather.icon,
            visibility: openWeather.visibility,
          }
        : null,
      pagasa: pagasa
        ? {
            synopsis: pagasa.synopsis,
            forecast: pagasa.forecast,
            windConditions: pagasa.windConditions,
          }
        : null,
      forecast: forecast
        ? forecast.map((item) => ({
            timestamp: item.timestamp,
            temperature: item.temperature,
            humidity: item.humidity,
            windSpeed: item.windSpeed,
            pop: item.pop,
            rainMm: item.rain3h,
            condition: item.condition,
            description: item.description,
            icon: item.icon,
          }))
        : null,
      risk: {
        level: risk.level,
        riskScore: risk.riskScore,
        reasons: risk.reasons,
      },
      cumulativeRainMm,
      hourlySamples,
      fetchedAt: new Date().toISOString(),
      errors,
    };

    cache = { data: payload, at: Date.now() };

    return ok(payload, { headers: CACHE_HEADERS });
  } catch (error) {
    return serverError(error, "WEATHER_FETCH_FAILED");
  }
}
