"use client";

import type { ReactNode } from "react";
import { ShieldAlert, CloudRain, WavesArrowUp } from "lucide-react";
import type { AlertLevel } from "@/lib/constants";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

interface FloodRiskCardProps {
  level: AlertLevel;
  riskScore: number;
  reasons: string[];
  rainfall1h?: number;
  windSpeed?: number;
  lastUpdated?: string;
  contextSlot?: ReactNode;
}

const levelConfig = {
  safe: {
    label: "SAFE",
    hazardLabel: "Low Hazard",
    pillBg: "bg-safe-fill",
    pillText: "text-safe",
    dotColor: "bg-safe",
    meterColor: "bg-safe",
    checkBg: "bg-safe-fill",
    checkColor: "text-safe",
  },
  watch: {
    label: "WATCH",
    hazardLabel: "Moderate Hazard",
    pillBg: "bg-watch-fill",
    pillText: "text-watch",
    dotColor: "bg-watch",
    meterColor: "bg-watch",
    checkBg: "bg-watch-fill",
    checkColor: "text-watch",
  },
  warning: {
    label: "WARNING",
    hazardLabel: "High Hazard",
    pillBg: "bg-warning-fill",
    pillText: "text-warning",
    dotColor: "bg-warning",
    meterColor: "bg-warning",
    checkBg: "bg-warning-fill",
    checkColor: "text-warning",
  },
  danger: {
    label: "DANGER",
    hazardLabel: "Critical Hazard",
    pillBg: "bg-danger-fill",
    pillText: "text-danger",
    dotColor: "bg-danger",
    meterColor: "bg-danger",
    checkBg: "bg-danger-fill",
    checkColor: "text-danger",
  },
};

const recommendedActions: Record<AlertLevel, string> = {
  safe: "Continue monitoring and check local advisories for updates.",
  watch: "Stay alert, prepare essentials, and monitor local advisories.",
  warning: "Prepare to move to safer ground if instructed by local officials.",
  danger: "Avoid flood-prone areas and follow official emergency instructions.",
};

export default function FloodRiskCard({ level, riskScore, lastUpdated, contextSlot }: FloodRiskCardProps) {
  const config = levelConfig[level];
  const updatedDate = lastUpdated ? new Date(lastUpdated) : null;
  const updatedText = updatedDate && !Number.isNaN(updatedDate.getTime())
    ? updatedDate.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Unavailable";

  const meterStops = [
    { id: "safe", className: "bg-safe", width: 25, active: riskScore < 20 },
    { id: "watch", className: "bg-watch", width: 20, active: riskScore >= 20 && riskScore < 40 },
    { id: "warning", className: "bg-warning", width: 25, active: riskScore >= 40 && riskScore < 60 },
    { id: "danger", className: "bg-danger", width: 30, active: riskScore >= 60 },
  ];

  return (
    <div className="glass-card h-full p-6 flex flex-col justify-between gap-4 relative overflow-hidden interactive-card">
      <div className="flex flex-col gap-4 relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`status-chip ${config.pillBg} ${config.pillText}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "currentColor" }} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
              </span>
              {config.label}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-accent-strong font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">sensors</span> River Alert Status
          </span>
        </div>

        {/* Risk score */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-huge text-on-sky tracking-tight font-bold tabular-nums">
                <AnimatedNumber value={riskScore} />
              </span>
              <span className="font-title-lg text-title-lg text-on-sky-dim font-medium">/ 100</span>
              <span className={`ml-2 status-chip font-semibold uppercase tracking-wider ${config.pillBg} ${config.pillText}`}>{config.hazardLabel}</span>
            </div>
            <p className="font-body-md text-body-md text-on-sky-dim mt-0.5">Latest river-level alert and safety status</p>
          </div>
        </div>

        {/* Segmented risk meter */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center gap-1 h-3.5 w-full bg-glass p-1 rounded-full">
            {meterStops.map((s) => (
              <div
                key={s.id}
                className={`h-full rounded-full transition-[width,opacity,box-shadow,background-color] duration-500 ${s.className}`}
                style={{
                  width: `${s.width}%`,
                  opacity: s.active ? 1 : 0.28,
                  boxShadow: s.active ? `0 0 10px ${s.active ? "var(--shadow-tint)" : "none"}` : "none",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-label-sm font-label-sm text-on-sky-faint px-1">
            <span>0 Normal</span>
            <span className={level === "watch" ? "text-watch font-semibold" : ""}>20 Watch</span>
            <span className={level === "warning" ? "text-warning font-semibold" : ""}>40 Warning</span>
            <span className={level === "danger" ? "text-danger font-semibold" : ""}>60 Critical</span>
          </div>
        </div>

        {/* Metric capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-glass">
            <div className="w-10 h-10 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-sky-faint">Water Level</span>
              <span className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
                Unavailable
              </span>
              <span className="font-label-sm text-on-sky-faint font-medium">Awaiting sensor connection</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-glass">
            <div className="w-10 h-10 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
              <WavesArrowUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-sky-faint">Rate of Rise</span>
              <span className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
                Unavailable
              </span>
              <span className="font-label-sm text-on-sky-faint font-medium">Awaiting sensor connection</span>
            </div>
          </div>
        </div>

        {contextSlot}
      </div>

      {/* Recommended action */}
        <div className="pt-3 border-t border-glass-border relative z-10">
          <span className="font-label-md text-label-md text-on-sky font-semibold tracking-wider uppercase mb-2 block">Recommended Action</span>
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-on-sky-dim font-body-md text-body-md">
                <span className={`w-4 h-4 rounded-full ${config.checkBg} ${config.checkColor} flex items-center justify-center shrink-0`}>
                  <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                </span>
                 <span>ANDAM guidance: {recommendedActions[level]}</span>
              </div>
              <div className="font-label-sm text-label-sm text-on-sky-dim">
                <span>Last updated: {updatedText} (weather assessment)</span>
              </div>
          </div>
          <p className="font-label-sm text-label-sm text-on-sky-dim mt-2">
            Prototype only — this weather-based score is not a verified river alert. River-level and rate-of-rise data will be connected later.
          </p>
        </div>
    </div>
  );
}
