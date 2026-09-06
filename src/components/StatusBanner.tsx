"use client";

import { ALERT_LEVELS, type AlertLevel } from "@/lib/constants";

interface StatusBannerProps {
  level: AlertLevel;
  riskScore: number;
  reasons: string[];
}

export default function StatusBanner({ level, riskScore, reasons }: StatusBannerProps) {
  const config = ALERT_LEVELS[level];

  return (
    <div
      className={`${config.bgColor} text-white rounded-2xl p-6 md:p-8 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl md:text-5xl">{config.icon}</span>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Flood Alert: {config.label}
          </h2>
          <p className="text-sm md:text-base opacity-90 mt-1">
            Risk Score: {riskScore}/100 &middot; Cotcot, Liloan, Cebu
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white/20 rounded-xl p-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide mb-2">
          Current Assessment
        </h3>
        <ul className="space-y-1">
          {reasons.map((reason, i) => (
            <li key={i} className="text-sm md:text-base flex items-start gap-2">
              <span className="opacity-60">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
