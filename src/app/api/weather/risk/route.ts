import { getSharedCurrentWeather } from "@/lib/dashboard/current-cache";
import { getHourlyBuckets } from "@/lib/db/weather";
import { calculateFloodRisk } from "@/lib/alerts";
import { resourceOk, resourceUnavailable } from "@/lib/api/resource";
import type { OpenWeatherCurrent } from "@/lib/openweather";
import type { CumulativeRainMm, RiskResource } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

async function readRollups(): Promise<{
  cumulativeRainMm: CumulativeRainMm;
  hourlySamples: number;
}> {
  try {
    const buckets = await getHourlyBuckets(24);
    const sumLast = (hours: number) =>
      buckets.slice(-hours).reduce((total, bucket) => total + bucket.rainMm, 0);

    return {
      hourlySamples: buckets.length,
      cumulativeRainMm: {
        h6: sumLast(6),
        h12: sumLast(12),
        h24: sumLast(24),
      },
    };
  } catch {
    return { hourlySamples: 0, cumulativeRainMm: { h6: 0, h12: 0, h24: 0 } };
  }
}

export async function GET() {
  let current: OpenWeatherCurrent;
  try {
    current = await getSharedCurrentWeather();
  } catch (error) {
    return resourceUnavailable(
      "Flood risk needs live weather, which is temporarily unavailable.",
      "RISK_WEATHER_FAILED",
      error
    );
  }

  const { cumulativeRainMm, hourlySamples } = await readRollups();

  const risk = calculateFloodRisk({
    rainfall1h: current.rain1h || 0,
    rainfallCumulative6h: cumulativeRainMm.h6,
    rainfallCumulative12h: cumulativeRainMm.h12,
    rainfallCumulative24h: cumulativeRainMm.h24,
    windSpeedKmh: current.windSpeed || 0,
    humidity: current.humidity || 0,
  });

  const data: RiskResource = {
    level: risk.level,
    riskScore: risk.riskScore,
    reasons: risk.reasons,
    cumulativeRainMm,
    hourlySamples,
  };

  return resourceOk(data);
}
