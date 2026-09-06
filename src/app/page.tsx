"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import TopTabBar from "@/components/TopTabBar";
import DashboardHeader from "@/components/DashboardHeader";
import FloodRiskCard from "@/components/FloodRiskCard";
import WeatherHeroCard from "@/components/WeatherHeroCard";
import ConditionCard from "@/components/ConditionCard";
import ForecastStrip from "@/components/ForecastStrip";
import AlertBanner from "@/components/AlertBanner";
import PagasaInfo from "@/components/PagasaInfo";
import EmergencyContacts from "@/components/EmergencyContacts";
import Reveal from "@/components/motion/Reveal";
import Stagger from "@/components/motion/Stagger";
import StaggerItem from "@/components/motion/StaggerItem";
import { Droplets, Wind, Gauge } from "lucide-react";
import { skyFor } from "@/lib/sky";
import type { AlertLevel } from "@/lib/constants";

interface WeatherData {
  location: { name: string; municipality: string; province: string };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    rainfall1h: number;
    condition: string;
    description: string;
    icon: string;
    visibility: number;
  } | null;
  pagasa: {
    synopsis: string;
    forecast: Array<{
      place: string;
      condition: string;
      causedBy: string;
      impacts: string;
    }>;
    windConditions: Array<{
      place: string;
      speed: string;
      direction: string;
      coastalWater: string;
    }>;
  } | null;
  risk: {
    level: AlertLevel;
    riskScore: number;
    reasons: string[];
  };
  fetchedAt: string;
  errors: string[];
}

export default function Home() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/weather");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => { await fetchWeather(); };
    init();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const risk = data?.risk || { level: "safe" as AlertLevel, riskScore: 0, reasons: ["No data available"] };
  const current = data?.current;
  const sky = skyFor(current?.icon, current?.description);

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky={sky}>
      {/* Sticky chrome — header + iOS tab bar share the same sky */}
      <div className="top-scrim sticky top-0 z-40">
        <DashboardHeader lastUpdated={data?.fetchedAt || null} onRefresh={fetchWeather} loading={loading} />
        <TopTabBar />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading state */}
        {loading && !data && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-glass-border border-t-accent-strong animate-spin mx-auto mb-4" />
              <p className="text-on-sky-dim text-sm font-body-md">Loading weather data...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !data && (
          <div className="glass-card p-8 text-center max-w-md mx-auto mt-10">
            <div className="w-14 h-14 bg-danger-fill text-danger rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[30px]">error</span>
            </div>
            <h2 className="font-headline-md text-on-sky mb-2">Unable to Load Data</h2>
            <p className="font-body-md text-body-md text-on-sky-dim mb-4">
              {error}. Make sure your environment variables are configured.
            </p>
            <button onClick={fetchWeather} className="pill-btn pill-btn-primary mx-auto">
              Retry
            </button>
          </div>
        )}

        {/* Dashboard content */}
        {data && (
          <>
            {/* Alert banner */}
            <AnimatePresence initial={false}>
              {risk.level === "danger" && (
                <AlertBanner
                  level="danger"
                  title="FLOOD DANGER — Immediate Action Required"
                  message="Critical flood conditions detected. Move to higher ground and follow evacuation procedures."
                  timestamp={data.fetchedAt}
                />
              )}
              {risk.level === "warning" && (
                <AlertBanner
                  level="warning"
                  title="Flood Warning — Be Prepared"
                  message="High flood risk. Prepare to evacuate if instructed. Monitor conditions closely."
                  timestamp={data.fetchedAt}
                />
              )}
              {risk.level === "watch" && (
                <AlertBanner
                  level="watch"
                  title="Flood Watch Advisory — High Tide & Cumulative Rainfall"
                  message="Heavy surface runoff observed along Purok Masagana and Cotcot Riverbanks. Low-lying areas prepare for potential localized waterlogging."
                  timestamp={data.fetchedAt}
                />
              )}
            </AnimatePresence>

            {/* Two-column hero: flood risk + weather */}
            <Stagger className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <StaggerItem className="lg:col-span-6">
                <FloodRiskCard
                  level={risk.level}
                  riskScore={risk.riskScore}
                  reasons={risk.reasons}
                  rainfall1h={current?.rainfall1h || 0}
                  windSpeed={current?.windSpeed || 0}
                  lastUpdated={data.fetchedAt}
                />
              </StaggerItem>
              <StaggerItem className="lg:col-span-6 pt-2">
                {current && (
                  <WeatherHeroCard
                    temperature={current.temperature}
                    feelsLike={current.feelsLike}
                    condition={current.condition}
                    description={current.description}
                    humidity={current.humidity}
                    windSpeed={current.windSpeed}
                    pressure={current.pressure}
                    visibility={current.visibility}
                    icon={current.icon}
                    rainfall1h={current.rainfall1h}
                  />
                )}
              </StaggerItem>
            </Stagger>

            {/* Ambient telemetry */}
            {current && (
              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StaggerItem>
                  <ConditionCard
                    title="Humidity"
                    value={current.humidity.toString()}
                    unit="Relative Hum."
                    icon={Droplets}
                    status={current.humidity >= 90 ? "High" : current.humidity >= 70 ? "Moderate" : "Good"}
                    statusColor={current.humidity >= 90 ? "watch" : current.humidity >= 70 ? "neutral" : "safe"}
                    trend={`↑ ${current.humidity >= 80 ? "Rising" : "Stable"}`}
                    gaugeValue={current.humidity}
                    gaugeColor="primary"
                  />
                </StaggerItem>
                <StaggerItem>
                  <ConditionCard
                    title="Wind Velocity"
                    value={current.windSpeed.toFixed(1)}
                    unit="km/h"
                    icon={Wind}
                    status={current.windSpeed >= 62 ? "Gale" : current.windSpeed >= 39 ? "Strong" : "Good"}
                    statusColor={current.windSpeed >= 62 ? "danger" : current.windSpeed >= 39 ? "warning" : "safe"}
                    trend={`→ ${current.windSpeed >= 39 ? "Strong" : "Stable"}`}
                    gaugeValue={Math.min(current.windSpeed / 88 * 100, 100)}
                    gaugeColor="primary"
                  />
                </StaggerItem>
                <StaggerItem>
                  <ConditionCard
                    title="Barometer"
                    value={current.pressure.toFixed(0)}
                    unit="hPa"
                    icon={Gauge}
                    status="Steady Trend"
                    statusColor="safe"
                    trend="↓ Stable"
                    gaugeValue={Math.min(((current.pressure - 980) / 50) * 100, 100)}
                    gaugeColor="secondary"
                  />
                </StaggerItem>
              </Stagger>
            )}

            {/* 24-hour forecast */}
            <Reveal>
              <ForecastStrip
                forecast={[
                  { day: "Today", icon: "01d", tempHigh: 28, tempLow: 22, rainProbability: 5, condition: current?.condition || "Clear" },
                  { day: "Tomorrow", icon: "10d", tempHigh: 26, tempLow: 21, rainProbability: 35, condition: "Rain" },
                  { day: "Wednesday", icon: "10d", tempHigh: 24, tempLow: 20, rainProbability: 80, condition: "Rain" },
                  { day: "Thursday", icon: "02d", tempHigh: 27, tempLow: 22, rainProbability: 20, condition: "Clouds" },
                  { day: "Friday", icon: "01d", tempHigh: 29, tempLow: 23, rainProbability: 5, condition: "Clear" },
                ]}
              />
            </Reveal>

            {/* Bottom row */}
            <Reveal>
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {data.pagasa && (
                  <PagasaInfo
                    synopsis={data.pagasa.synopsis}
                    forecast={data.pagasa.forecast}
                  />
                )}
                <EmergencyContacts />
              </section>
            </Reveal>

            {/* Footer */}
            <Reveal>
              <div className="text-center text-xs text-on-sky-faint py-6 font-label-sm">
                <p>Data sourced from PAGASA &amp; OpenWeatherMap</p>
                {data.errors.length > 0 && (
                  <p className="mt-1 text-warning">
                    Some data sources had errors: {data.errors.join(", ")}
                  </p>
                )}
              </div>
            </Reveal>
          </>
        )}
      </main>
    </div>
  );
}