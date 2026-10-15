import { getSharedCurrentWeather } from "@/lib/dashboard/current-cache";
import { resourceOk, resourceUnavailable } from "@/lib/api/resource";
import { COTCOT } from "@/lib/constants";
import type { CurrentResource } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getSharedCurrentWeather();

    const data: CurrentResource = {
      location: {
        name: COTCOT.name,
        municipality: COTCOT.municipality,
        province: COTCOT.province,
      },
      current: {
        temperature: current.temperature,
        feelsLike: current.feelsLike,
        humidity: current.humidity,
        pressure: current.pressure,
        windSpeed: current.windSpeed,
        windDirection: current.windDeg,
        rainfall1h: current.rain1h,
        condition: current.condition,
        description: current.description,
        icon: current.icon,
        visibility: current.visibility,
      },
    };

    return resourceOk(data);
  } catch (error) {
    return resourceUnavailable(
      "Live weather is temporarily unavailable. Please try again shortly.",
      "CURRENT_WEATHER_FAILED",
      error
    );
  }
}
