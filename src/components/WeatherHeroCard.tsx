"use client";

import { WeatherIcon } from "@/lib/weather-icon";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import ResourceUnavailable from "@/components/dashboard/ResourceUnavailable";
import { Skeleton } from "@/components/dashboard/Skeleton";
import type { CurrentResource, ResourceState } from "@/lib/dashboard/types";

interface WeatherHeroCardProps {
  resource: ResourceState<CurrentResource>;
  onRetry: () => void;
}

function DetailCell({ label, value, sub, status, statusClass }: { label: string; value: string; sub: string; status?: string; statusClass?: string }) {
  return (
    <div className="flex flex-col justify-between gap-1 p-4 min-h-[92px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-sm text-label-sm text-on-sky-faint uppercase tracking-wider font-semibold">{label}</span>
        {status && statusClass && (
          <span className={`status-chip ${statusClass} font-semibold`}>{status}</span>
        )}
      </div>
      <span className="font-title-sm text-title-sm font-bold text-on-sky truncate">{value}</span>
      <span className="font-label-sm text-label-sm text-on-sky-faint truncate">{sub}</span>
    </div>
  );
}

function WeatherHeroSkeleton() {
  return (
    <section className="h-full flex flex-col justify-between gap-5" aria-hidden="true">
      <Skeleton className="h-7 w-56 rounded-full" />
      <div className="px-1 flex flex-col gap-3">
        <Skeleton className="h-[4.5rem] w-52" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="glass-card overflow-hidden p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[76px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WeatherHeroCard({ resource, onRetry }: WeatherHeroCardProps) {
  if (resource.status === "loading") {
    return <WeatherHeroSkeleton />;
  }

  if (resource.status === "unavailable") {
    return (
      <section className="h-full flex flex-col justify-between gap-5">
        <div className="glass-chip px-3 py-1.5 self-start inline-flex items-center gap-2 text-on-sky-faint font-label-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-on-sky-faint" />
          Barangay Cotcot Micro-station offline
        </div>
        <div className="glass-card">
          <ResourceUnavailable icon="thermostat" message={resource.message} onRetry={onRetry} />
        </div>
      </section>
    );
  }

  const {
    temperature,
    feelsLike,
    condition,
    description,
    humidity,
    windSpeed,
    pressure,
    visibility,
    icon,
    rainfall1h,
  } = resource.data.current;

  const humidityStatus =
    humidity >= 90
      ? { label: "High", cls: "bg-watch-fill text-watch" }
      : humidity >= 70
        ? { label: "Moderate", cls: "bg-glass text-accent-strong" }
        : { label: "Good", cls: "bg-safe-fill text-safe" };

  const windStatus =
    windSpeed >= 62
      ? { label: "Gale", cls: "bg-danger-fill text-danger" }
      : windSpeed >= 39
        ? { label: "Strong", cls: "bg-warning-fill text-warning" }
        : { label: "Good", cls: "bg-safe-fill text-safe" };

  const pressureStatus = { label: "Steady Trend", cls: "bg-safe-fill text-safe" };

  return (
    <section className="h-full flex flex-col justify-between gap-5">
      {/* Station chip */}
      <div className="glass-chip px-3 py-1.5 self-start inline-flex items-center gap-2 text-on-sky font-label-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-safe animate-pulse-slow" />
        {condition} · Barangay Cotcot Micro-station Online
      </div>

      {/* Hero reading — borderless, on the sky */}
      <div className="px-1">
        <div className="flex items-baseline gap-2">
          <AnimatedNumber
            value={temperature}
            decimals={1}
            className="text-[5.25rem] md:text-[5.5rem] font-extralight leading-[0.95] tracking-tighter text-on-sky tabular-nums"
          />
          <span className="text-3xl font-light text-on-sky-dim">°C</span>
          <WeatherIcon code={icon} className="w-9 h-9 text-accent-strong ml-1 opacity-90" />
        </div>
        <div className="font-title-lg text-title-lg text-on-sky font-semibold mt-2 capitalize">{description}</div>
        <div className="font-body-md text-body-md text-on-sky-dim">
          Feels like <AnimatedNumber value={feelsLike} decimals={1} />°C
        </div>
      </div>

      {/* Detail grid — glass, iOS hairlines */}
      <div className="glass-card overflow-hidden p-0">
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-glass-border">
          <DetailCell label="Humidity" value={`${humidity}%`} sub="Relative humidity" status={humidityStatus.label} statusClass={humidityStatus.cls} />
          <DetailCell label="Wind" value={`${windSpeed.toFixed(1)} km/h`} sub="Current velocity" status={windStatus.label} statusClass={windStatus.cls} />
          <DetailCell label="Pressure" value={`${pressure.toFixed(0)} hPa`} sub="Barometric" status={pressureStatus.label} statusClass={pressureStatus.cls} />
          <DetailCell label="Rainfall (1h)" value={`${rainfall1h.toFixed(1)} mm`} sub="Prev. hour" />
          <DetailCell label="Visibility" value={`${(visibility / 1000).toFixed(1)} km`} sub="Range of view" />
          <DetailCell label="Feels like" value={`${feelsLike.toFixed(1)}°C`} sub="Heat index" />
        </div>
      </div>
    </section>
  );
}
