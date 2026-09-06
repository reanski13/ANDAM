import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/openweather";
import { scrapePagasaVisayas } from "@/lib/pagasa-scraper";
import { calculateFloodRisk } from "@/lib/alerts";
import { COTCOT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let openWeather = null;
    let pagasa = null;
    const errors: string[] = [];

    try {
      openWeather = await getCurrentWeather();
    } catch (e) {
      errors.push(`OpenWeatherMap: ${e instanceof Error ? e.message : "unknown"}`);
    }

    try {
      pagasa = await scrapePagasaVisayas();
    } catch (e) {
      errors.push(`PAGASA: ${e instanceof Error ? e.message : "unknown"}`);
    }

    const rainfall1h = openWeather?.rain1h || 0;
    const windSpeed = openWeather?.windSpeed || 0;
    const humidity = openWeather?.humidity || 0;

    const risk = calculateFloodRisk({
      rainfall1h,
      rainfallCumulative6h: rainfall1h * 6,
      rainfallCumulative12h: rainfall1h * 12,
      rainfallCumulative24h: rainfall1h * 24,
      windSpeedKmh: windSpeed,
      humidity,
    });

    return NextResponse.json({
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
      risk: {
        level: risk.level,
        riskScore: risk.riskScore,
        reasons: risk.reasons,
      },
      fetchedAt: new Date().toISOString(),
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data", details: String(error) },
      { status: 500 }
    );
  }
}
