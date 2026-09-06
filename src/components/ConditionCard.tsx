"use client";

import { motion } from "motion/react";
import { Droplets, Wind, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import { EASE } from "@/lib/motion-tokens";

interface ConditionCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  status?: string;
  statusColor?: "safe" | "watch" | "warning" | "danger" | "neutral";
  trend?: string;
  /** 0-100 for gauge visualization */
  gaugeValue?: number;
  gaugeColor?: string;
}

const METRIC_ICON: Record<string, LucideIcon> = {
  safe: Droplets,
  watch: Wind,
  warning: Gauge,
  danger: Droplets,
  neutral: Droplets,
};

const statusTextClass = {
  safe: "text-safe",
  watch: "text-watch",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-accent-strong",
};

const gaugeIconColor = {
  safe: "text-safe",
  watch: "text-watch",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-accent-strong",
};

const gaugeStrokeDefault = { primary: "var(--accent)", secondary: "var(--accent)", tertiary: "var(--st-safe)" };

export default function ConditionCard({
  title,
  value,
  unit,
  status,
  statusColor = "neutral",
  trend,
  gaugeValue = 0,
  gaugeColor = "primary",
}: ConditionCardProps) {
  const stroke = gaugeStrokeDefault[gaugeColor as keyof typeof gaugeStrokeDefault] || "var(--accent)";
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (gaugeValue / 100) * circumference;
  const StatusIcon = METRIC_ICON[statusColor];
  const numeric = parseFloat(value);
  const isNumeric = !Number.isNaN(numeric);
  const decimals = value.includes(".") ? (value.split(".")[1]?.length || 0) : 0;

  return (
    <div className="glass-card p-5 flex flex-col justify-between relative overflow-hidden interactive-card">
      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-accent-fill text-accent-strong flex items-center justify-center">
            <StatusIcon className="w-5 h-5" />
          </div>
          <span className="font-label-md text-label-md text-on-sky-faint uppercase tracking-wider font-semibold">{title}</span>
        </div>
        {status && (
          <span className={`status-chip bg-glass ${statusTextClass[statusColor]} font-semibold`}>{status}</span>
        )}
      </div>

      {/* Circular gauge */}
      <div className="my-4 flex items-center justify-center relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--glass-elevated)" strokeWidth="9" strokeLinecap="round" />
            <motion.circle
              cx="60" cy="60" r="48" fill="none"
              stroke={stroke} strokeWidth="9"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: EASE }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className={gaugeIconColor[statusColor]}>
              <StatusIcon className="w-5 h-5 mb-0.5 mx-auto opacity-90" />
            </div>
            <span className="font-metric-huge text-[30px] leading-none font-bold text-on-sky tracking-tight tabular-nums">
              {isNumeric ? <AnimatedNumber value={numeric} decimals={decimals} /> : value}
            </span>
            <span className="font-label-sm text-[11px] text-on-sky-faint font-medium mt-1">{unit}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t border-glass-border flex items-center justify-between text-label-sm font-label-sm">
        {trend ? (
          <span className="text-on-sky-dim font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[16px]">trending_up</span> {trend}
          </span>
        ) : (
          <span className="text-on-sky-faint" />
        )}
        {status && (
          <span className="text-on-sky-faint font-medium bg-glass px-2 py-0.5 rounded-full">{status}</span>
        )}
      </div>
    </div>
  );
}