"use client";

import { CheckCircle, CloudRain, Wind } from "lucide-react";
import type { AlertLevel } from "@/lib/constants";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

interface FloodRiskCardProps {
  level: AlertLevel;
  riskScore: number;
  reasons: string[];
  rainfall1h?: number;
  windSpeed?: number;
  lastUpdated?: string;
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

function getSeverityLabel(val: number, type: "rain" | "wind"): string {
  if (type === "rain") {
    if (val >= 50) return "Torrential";
    if (val >= 30) return "Intense";
    if (val >= 15) return "Heavy";
    if (val >= 7.5) return "Moderate";
    if (val >= 1) return "Light";
    return "None";
  }
  if (val >= 88) return "Storm Force";
  if (val >= 62) return "Gale";
  if (val >= 39) return "Strong";
  if (val >= 20) return "Moderate Breeze";
  return "Calm";
}

export default function FloodRiskCard({ level, riskScore, reasons, rainfall1h = 0, windSpeed = 0 }: FloodRiskCardProps) {
  const config = levelConfig[level];

  const meterStops = [
    { id: "safe", className: "bg-safe", width: 25, active: riskScore < 20 },
    { id: "watch", className: "bg-watch", width: 20, active: riskScore >= 20 && riskScore < 40 },
    { id: "warning", className: "bg-warning", width: 25, active: riskScore >= 40 && riskScore < 60 },
    { id: "danger", className: "bg-danger", width: 30, active: riskScore >= 60 },
  ];

  return (
    <div className="glass-card p-6 flex flex-col justify-between gap-4 relative overflow-hidden interactive-card">
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
            <span className="glass-chip px-2.5 py-1 text-on-sky-faint font-label-sm">Cotcot River Basin #04</span>
          </div>
          <span className="font-label-sm text-label-sm text-accent-strong font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">sensors</span> Real-time Inundation Model
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
            <p className="font-body-md text-body-md text-on-sky-dim mt-0.5">Hydrological Risk Index based on 6h telemetry accumulation</p>
          </div>
        </div>

        {/* Segmented risk meter */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center gap-1 h-3.5 w-full bg-glass p-1 rounded-full">
            {meterStops.map((s) => (
              <div
                key={s.id}
                className={`h-full rounded-full transition-all duration-500 ${s.className}`}
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
              <span className="font-label-sm text-label-sm text-on-sky-faint">Instant Rainfall</span>
              <span className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
                <AnimatedNumber value={rainfall1h} decimals={1} /> mm/hr <span className="font-label-sm text-on-sky-faint font-medium">({getSeverityLabel(rainfall1h, "rain")})</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-glass">
            <div className="w-10 h-10 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-sky-faint">Wind Speed</span>
              <span className="font-title-sm text-title-sm text-on-sky font-semibold tabular-nums">
                <AnimatedNumber value={windSpeed} /> km/h <span className="font-label-sm text-accent-strong font-medium">({getSeverityLabel(windSpeed, "wind")})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing factors */}
      {reasons.length > 0 && (
        <div className="pt-3 border-t border-glass-border relative z-10">
          <span className="font-label-md text-label-md text-on-sky font-semibold tracking-wider uppercase mb-2 block">Key Contributing Factors</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {reasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-on-sky-dim font-body-md text-body-md">
                <span className={`w-4 h-4 rounded-full ${config.checkBg} ${config.checkColor} flex items-center justify-center shrink-0`}>
                  <CheckCircle className="w-3 h-3" />
                </span>
                <span className="truncate">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}