import { COTCOT } from "./constants";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface OpenWeatherCurrent {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  rain1h: number;
  rain3h: number;
  condition: string;
  description: string;
  icon: string;
  visibility: number;
  timestamp: number;
}

export interface OpenWeatherForecast {
  timestamp: number;
  temperature: number;
  humidity: number;
  rain3h: number;
  pop: number;
  windSpeed: number;
  windDeg: number;
  condition: string;
  description: string;
  icon: string;
}

export async function getCurrentWeather(): Promise<OpenWeatherCurrent> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY not set");

  const url = `${BASE_URL}/weather?lat=${COTCOT.lat}&lon=${COTCOT.lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });

  if (!response.ok) {
    throw new Error(`OpenWeatherMap fetch failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed * 3.6,
    windDeg: data.wind.deg,
    rain1h: data.rain?.["1h"] || 0,
    rain3h: data.rain?.["3h"] || 0,
    condition: data.weather[0]?.main || "Unknown",
    description: data.weather[0]?.description || "Unknown",
    icon: data.weather[0]?.icon || "01d",
    visibility: data.visibility,
    timestamp: data.dt,
  };
}

export async function getHourlyForecast(
  hours = 24
): Promise<OpenWeatherForecast[]> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY not set");

  const url = `${BASE_URL}/forecast?lat=${COTCOT.lat}&lon=${COTCOT.lon}&appid=${API_KEY}&units=metric&cnt=${Math.min(hours / 3, 40)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });

  if (!response.ok) {
    throw new Error(`OpenWeatherMap forecast failed: ${response.status}`);
  }

  const data = await response.json();

  const weatherList = data.list as Array<{
    dt?: number;
    main?: { temp?: number; humidity?: number };
    pop?: number;
    rain?: { "3h"?: number };
    wind?: { speed?: number; deg?: number };
    weather?: Array<{ main?: string; description?: string; icon?: string }>;
  }>;

  return weatherList.map((item) => ({
    timestamp: item.dt ?? 0,
    temperature: item.main?.temp ?? 0,
    humidity: item.main?.humidity ?? 0,
    rain3h: item.rain?.["3h"] ?? 0,
    pop: item.pop ?? 0,
    windSpeed: (item.wind?.speed ?? 0) * 3.6,
    windDeg: item.wind?.deg ?? 0,
    condition: item.weather?.[0]?.main ?? "Unknown",
    description: item.weather?.[0]?.description ?? "Unknown",
    icon: item.weather?.[0]?.icon ?? "01d",
  }));
}

export function calculateCumulativeRain(
  forecasts: OpenWeatherForecast[],
  hours: number
): number {
  let total = 0;
  const cutoff = Math.floor(hours / 3);

  for (let i = 0; i < Math.min(cutoff, forecasts.length); i++) {
    total += forecasts[i].rain3h || 0;
  }

  return total;
}
