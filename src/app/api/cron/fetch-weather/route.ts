import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/openweather";
import { scrapePagasaVisayas } from "@/lib/pagasa-scraper";
import { insertWeatherReading } from "@/lib/supabase";
import { COTCOT } from "@/lib/constants";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    openWeather: false,
    pagasa: false,
    stored: false,
    errors: [] as string[],
  };

  try {
    const ow = await getCurrentWeather();

    await insertWeatherReading({
      source: "openweather",
      timestamp: new Date().toISOString(),
      temperature: ow.temperature,
      humidity: ow.humidity,
      rainfall_mm: ow.rain1h,
      wind_speed_kmh: ow.windSpeed,
      wind_direction: String(ow.windDeg),
      pressure_hpa: ow.pressure,
      condition: ow.condition,
      lat: COTCOT.lat,
      lon: COTCOT.lon,
    });

    results.openWeather = true;
    results.stored = true;
  } catch (e) {
    results.errors.push(`OpenWeatherMap: ${e instanceof Error ? e.message : "unknown"}`);
  }

  try {
    const pagasa = await scrapePagasaVisayas();

    await insertWeatherReading({
      source: "pagasa",
      timestamp: new Date().toISOString(),
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
  } catch (e) {
    results.errors.push(`PAGASA: ${e instanceof Error ? e.message : "unknown"}`);
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
}
