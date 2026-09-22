import { NextRequest } from "next/server";
import { getReadingsSince } from "@/lib/db/weather";
import { fail, ok, serverError } from "@/lib/api/response";
import { HOURS_MAX, hoursParam } from "@/lib/validation/query";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = hoursParam.safeParse(searchParams.get("hours") ?? undefined);

  if (!parsed.success) {
    return fail(
      "INVALID_QUERY",
      `\`hours\` must be a whole number between 1 and ${HOURS_MAX}.`
    );
  }

  const hours = parsed.data;

  try {
    const since = new Date(
      Date.now() - hours * 60 * 60 * 1000
    ).toISOString();

    const readings = await getReadingsSince(since);

    return ok({
      readings,
      count: readings.length,
      period: `Last ${hours} hours`,
    });
  } catch (error) {
    return serverError(error, "HISTORY_FETCH_FAILED");
  }
}
