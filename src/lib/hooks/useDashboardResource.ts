"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResourcePayload, ResourceState } from "@/lib/dashboard/types";

const DEFAULT_POLL_MS = 10 * 60 * 1000;
const GENERIC_ERROR = "This section could not be updated. Please try again shortly.";

interface UseDashboardResourceOptions {
  refreshSignal?: number;
  pollMs?: number;
}

export interface DashboardResource<T> {
  state: ResourceState<T>;
  isRefreshing: boolean;
  refetch: () => void;
}

function parsePayload<T>(raw: unknown): ResourcePayload<T> | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  const fetchedAt =
    typeof record.fetchedAt === "string" ? record.fetchedAt : new Date().toISOString();

  if (record.status === "ok") {
    return { status: "ok", data: record.data as T, fetchedAt };
  }

  if (record.status === "unavailable") {
    return {
      status: "unavailable",
      message: typeof record.message === "string" ? record.message : GENERIC_ERROR,
      fetchedAt,
    };
  }

  return null;
}

export function useDashboardResource<T>(
  url: string,
  { refreshSignal = 0, pollMs = DEFAULT_POLL_MS }: UseDashboardResourceOptions = {}
): DashboardResource<T> {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const hasDataRef = useRef(false);

  const refetch = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsRefreshing(true);

      try {
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const payload = parsePayload<T>(await response.json());

        if (controller.signal.aborted) return;

        if (response.ok && payload?.status === "ok") {
          hasDataRef.current = true;
          setState({ status: "ready", data: payload.data, fetchedAt: payload.fetchedAt });
        } else if (!hasDataRef.current) {
          setState({
            status: "unavailable",
            message: payload?.status === "unavailable" ? payload.message : GENERIC_ERROR,
            fetchedAt: payload ? payload.fetchedAt : new Date().toISOString(),
          });
        }
      } catch {
        if (controller.signal.aborted) return;
        if (!hasDataRef.current) {
          setState({
            status: "unavailable",
            message: GENERIC_ERROR,
            fetchedAt: new Date().toISOString(),
          });
        }
      } finally {
        if (!controller.signal.aborted) setIsRefreshing(false);
      }
    };

    load();
    const interval = setInterval(load, pollMs);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [url, pollMs, refreshSignal, attempt]);

  return { state, isRefreshing, refetch };
}
