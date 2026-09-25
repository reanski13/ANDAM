"use client";

import { useState, useEffect, useCallback, ViewTransition } from "react";
import { AnimatePresence } from "motion/react";
import DashboardHeader from "@/components/DashboardHeader";
import FloodRiskCard from "@/components/FloodRiskCard";
import WeatherHeroCard from "@/components/WeatherHeroCard";
import ForecastStrip from "@/components/ForecastStrip";
import RainfallTrend from "@/components/RainfallTrend";
import AlertBanner from "@/components/AlertBanner";
import PagasaInfo from "@/components/PagasaInfo";
import EmergencyContacts from "@/components/EmergencyContacts";
import Reveal from "@/components/motion/Reveal";
import Stagger from "@/components/motion/Stagger";
import StaggerItem from "@/components/motion/StaggerItem";
import { skyFor } from "@/lib/sky";
import type { AlertLevel } from "@/lib/constants";

const WEATHER_CACHE_KEY = "cotcot-weather-cache";
const WEATHER_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

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
  forecast: Array<{
    timestamp: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    pop: number;
    rainMm: number;
    condition: string;
    description: string;
    icon: string;
  }> | null;
  risk: {
    level: AlertLevel;
    riskScore: number;
    reasons: string[];
  };
  cumulativeRainMm: { h6: number; h12: number; h24: number };
  hourlySamples: number;
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
      const json = (await res.json()) as { data: WeatherData };
      setData(json.data);
      setError(null);
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(json.data));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as WeatherData;
          if (
            parsed?.fetchedAt &&
            Date.now() - new Date(parsed.fetchedAt).getTime() < WEATHER_CACHE_MAX_AGE_MS
          ) {
            setData(parsed);
          }
        }
      } catch {
        /* ignore */
      }
      await fetchWeather();
    };
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
      <div className="top-scrim sticky top-0 z-[1050]">
        <DashboardHeader lastUpdated={data?.fetchedAt || null} onRefresh={fetchWeather} loading={loading} />
      
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <ViewTransition
          enter={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          exit={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          default="none"
        >
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

            {/* Rainfall trend */}
            <Reveal>
              <RainfallTrend
                cumulativeRainMm={data.cumulativeRainMm ?? { h6: 0, h12: 0, h24: 0 }}
                hourlySamples={data.hourlySamples ?? 0}
              />
            </Reveal>

            {/* 24-hour forecast */}
            <Reveal>
              <ForecastStrip forecast={data.forecast || []} />
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
        </ViewTransition>
      </main>
    </div>
  );
}