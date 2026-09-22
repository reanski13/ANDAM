"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Reading {
  timestamp: string;
  rainfall_mm: number | null;
  source: string;
}

interface TrendPoint {
  label: string;
  rain: number;
}

interface RainfallTrendProps {
  cumulativeRainMm: { h6: number; h12: number; h24: number };
  hourlySamples: number;
}

interface RainTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number | string }>;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function RainTooltip({ active, label, payload }: RainTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass-card px-3 py-2">
      <p className="font-label-sm text-label-sm text-on-sky-faint">{label}</p>
      <p className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
        {Number(payload[0]?.value ?? 0).toFixed(1)} mm
      </p>
    </div>
  );
}

function CumulativeStat({ label, value, available }: { label: string; value: number; available: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-glass px-3 py-2">
      <span className="font-label-sm text-label-sm text-on-sky-faint">{label}</span>
      <span className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
        {available ? `${value.toFixed(1)} mm` : "—"}
      </span>
    </div>
  );
}

export default function RainfallTrend({ cumulativeRainMm, hourlySamples }: RainfallTrendProps) {
  const [points, setPoints] = useState<TrendPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/weather/history?hours=24");
        if (!res.ok) throw new Error("Failed to load rainfall history");

        const json = (await res.json()) as { data: { readings: Reading[] } };
        const readings = json.data.readings.filter((reading) => reading.source === "openweather");

        if (!cancelled) {
          setPoints(
            readings.map((reading) => ({
              label: formatTime(reading.timestamp),
              rain: Number(reading.rainfall_mm ?? 0),
            }))
          );
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      }
    };

    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const hasData = points !== null && points.length > 0;
  const peak = hasData ? Math.max(...points.map((point) => point.rain)) : 0;
  const hasRollups = hourlySamples > 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">rainy</span>
        </div>
        <div>
          <h2 className="font-title-lg text-title-lg text-on-sky font-semibold">Rainfall Trend</h2>
          <p className="font-label-sm text-label-sm text-on-sky-faint">
            Hourly intensity recorded at Brgy. Cotcot, last 24 hours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <CumulativeStat label="Last 6h" value={cumulativeRainMm.h6} available={hasRollups} />
        <CumulativeStat label="Last 12h" value={cumulativeRainMm.h12} available={hasRollups} />
        <CumulativeStat label="Last 24h" value={cumulativeRainMm.h24} available={hasRollups} />
      </div>

      {error && (
        <div className="rounded-2xl bg-danger-fill text-danger px-3 py-2 font-body-md text-body-md">
          {error}
        </div>
      )}

      {!error && points === null && (
        <div className="h-40 rounded-2xl bg-glass animate-pulse" aria-hidden />
      )}

      {!error && points !== null && !hasData && (
        <div className="h-40 rounded-2xl bg-glass flex flex-col items-center justify-center text-center px-4">
          <span className="material-symbols-outlined text-[26px] text-on-sky-faint mb-1">schedule</span>
          <p className="font-body-md text-body-md text-on-sky-dim">Collecting readings…</p>
          <p className="font-label-sm text-label-sm text-on-sky-faint">
            The monitor records a sample every 10 minutes.
          </p>
        </div>
      )}

      {!error && hasData && (
        <>
          <div className="h-40 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rainfallFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--glass-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={48}
                  tick={{ fill: "var(--on-sky-faint)", fontSize: 11 }}
                />
                <YAxis
                  width={30}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--on-sky-faint)", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--accent-strong)", strokeDasharray: "3 3" }}
                  content={<RainTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="rain"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#rainfallFill)"
                  dot={false}
                  isAnimationActive={!reduce}
                  animationDuration={450}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="font-label-sm text-label-sm text-on-sky-faint mt-2 tabular-nums">
            Peak 1h {peak.toFixed(1)} mm · {points.length} samples
          </p>
        </>
      )}
    </div>
  );
}
