import { NextRequest, NextResponse } from "next/server";
import { getWeatherReadingsSince } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  try {
    const since = new Date(
      Date.now() - hours * 60 * 60 * 1000
    ).toISOString();

    const readings = await getWeatherReadingsSince(since);

    return NextResponse.json({
      readings,
      count: readings.length,
      period: `Last ${hours} hours`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch history", details: String(error) },
      { status: 500 }
    );
  }
}
