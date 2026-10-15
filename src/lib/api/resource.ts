import { NextResponse } from "next/server";
import type { ResourceOk, ResourceUnavailable } from "@/lib/dashboard/types";

const SUCCESS_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
} as const;

export function resourceOk<T>(data: T) {
  const body: ResourceOk<T> = {
    status: "ok",
    data,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(body, { headers: SUCCESS_HEADERS });
}

export function resourceUnavailable(message: string, code: string, error?: unknown) {
  console.error(`[api] ${code}:`, error);

  const body: ResourceUnavailable = {
    status: "unavailable",
    message,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}
