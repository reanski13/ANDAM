import { getHourlyForecast } from "@/lib/openweather";
import { resourceOk, resourceUnavailable } from "@/lib/api/resource";
import type { ForecastResource } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const forecast = await getHourlyForecast(24);

    const data: ForecastResource = {
      forecast: forecast.map((item) => ({
        timestamp: item.timestamp,
        temperature: item.temperature,
        humidity: item.humidity,
        windSpeed: item.windSpeed,
        pop: item.pop,
        rainMm: item.rain3h,
        condition: item.condition,
        description: item.description,
        icon: item.icon,
      })),
    };

    return resourceOk(data);
  } catch (error) {
    return resourceUnavailable(
      "The 24-hour forecast is temporarily unavailable.",
      "FORECAST_FAILED",
      error
    );
  }
}
