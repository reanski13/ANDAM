import { NextResponse } from "next/server";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message } }, { status });
}

export function serverError(error: unknown, code = "INTERNAL_ERROR") {
  console.error(`[api] ${code}:`, error);
  return fail(code, "Something went wrong on our end. Please try again.", 500);
}
