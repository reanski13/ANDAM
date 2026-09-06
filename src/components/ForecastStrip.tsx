"use client";

import { motion } from "motion/react";
import { WeatherIcon } from "@/lib/weather-icon";
import { EASE } from "@/lib/motion-tokens";

interface ForecastDay {
  day: string;
  icon: string;
  tempHigh: number;
  tempLow: number;
  rainProbability: number;
  condition: string;
}

interface ForecastStripProps {
  forecast: ForecastDay[];
}

function getRainBarHeight(prob: number): string {
  return `${Math.max(prob * 0.8, 4)}%`;
}

export default function ForecastStrip({ forecast }: ForecastStripProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent-fill text-accent-strong flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">timelapse</span>
        </div>
        <div>
          <h2 className="font-title-lg text-title-lg text-on-sky font-semibold">24-Hour Weather Forecast</h2>
          <p className="font-label-sm text-label-sm text-on-sky-faint">Rain depth simulations across Brgy. Cotcot drainage culverts</p>
        </div>
      </div>

      {/* iOS-style hourly strip */}
      <div className="snap-x-strip scrollbar-hide pt-1 pb-1">
        {forecast.map((day, i) => {
          const isNow = i === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl min-w-[86px] transition-all ${
                isNow ? "bg-glass-elevated border border-glass-border" : "hover:bg-glass-elevated/60 active:scale-95"
              }`}
            >
              <span className={`font-label-sm text-label-sm font-semibold ${isNow ? "text-accent-strong" : "text-on-sky-faint"}`}>
                {isNow ? "Now" : day.day}
              </span>
              <WeatherIcon code={day.icon} className={`w-6 h-6 ${isNow ? "text-accent-strong" : "text-on-sky-dim"}`} />
              <span className="font-title-sm text-title-sm font-bold text-on-sky tabular-nums">{day.tempHigh}°</span>
              <div className="w-1.5 h-12 rounded-full bg-glass overflow-hidden flex items-end justify-center">
                <div
                  className={`w-full rounded-full transition-all ${isNow ? "bg-accent" : "bg-on-sky-faint"}`}
                  style={{ height: getRainBarHeight(day.rainProbability) }}
                />
              </div>
              <span className="font-label-sm text-[11px] text-on-sky-faint tabular-nums">
                {day.rainProbability > 0 ? `${(day.rainProbability * 0.05).toFixed(1)} mm` : "0.0 mm"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}