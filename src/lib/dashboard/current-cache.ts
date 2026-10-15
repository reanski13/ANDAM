import "server-only";
import { getCurrentWeather, type OpenWeatherCurrent } from "@/lib/openweather";

const TTL_MS = 60_000;

let cached: { data: OpenWeatherCurrent; at: number } | null = null;
let inflight: Promise<OpenWeatherCurrent> | null = null;

export async function getSharedCurrentWeather(): Promise<OpenWeatherCurrent> {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.data;
  }

  if (inflight) {
    return inflight;
  }

  inflight = getCurrentWeather()
    .then((data) => {
      cached = { data, at: Date.now() };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
