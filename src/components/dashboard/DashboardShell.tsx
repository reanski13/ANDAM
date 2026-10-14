"use client";

import { useCallback, useState, ViewTransition } from "react";
import { AnimatePresence } from "motion/react";
import DashboardHeader from "@/components/DashboardHeader";
import FloodRiskSection from "@/components/dashboard/FloodRiskSection";
import WeatherHeroCard from "@/components/WeatherHeroCard";
import ForecastStrip from "@/components/ForecastStrip";
import RainfallTrend from "@/components/RainfallTrend";
import PagasaInfo from "@/components/PagasaInfo";
import AlertBanner from "@/components/AlertBanner";
import Reveal from "@/components/motion/Reveal";
import Stagger from "@/components/motion/Stagger";
import StaggerItem from "@/components/motion/StaggerItem";
import { skyFor } from "@/lib/sky";
import { useDashboardResource } from "@/lib/hooks/useDashboardResource";
import {
  mapResourceState,
  type CurrentResource,
  type ForecastResource,
  type PagasaResource,
  type RiskResource,
} from "@/lib/dashboard/types";

export default function DashboardShell() {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const refresh = useCallback(() => setRefreshSignal((value) => value + 1), []);

  const current = useDashboardResource<CurrentResource>("/api/weather/current", { refreshSignal });
  const risk = useDashboardResource<RiskResource>("/api/weather/risk", { refreshSignal });
  const forecast = useDashboardResource<ForecastResource>("/api/weather/forecast", { refreshSignal });
  const pagasa = useDashboardResource<PagasaResource>("/api/weather/pagasa", { refreshSignal });

  const refreshing =
    current.isRefreshing || risk.isRefreshing || forecast.isRefreshing || pagasa.isRefreshing;

  const sky = skyFor(
    current.state.status === "ready" ? current.state.data.current.icon : undefined,
    current.state.status === "ready" ? current.state.data.current.description : undefined
  );

  const lastUpdated = current.state.status === "ready" ? current.state.fetchedAt : null;
  const riskData = risk.state.status === "ready" ? risk.state.data : null;
  const riskFetchedAt = risk.state.status === "ready" ? risk.state.fetchedAt : undefined;

  const rainfallStats = mapResourceState(risk.state, (data) => ({
    cumulativeRainMm: data.cumulativeRainMm,
    hourlySamples: data.hourlySamples,
  }));

  const unavailableSources = [
    current.state.status === "unavailable" ? "live weather" : null,
    risk.state.status === "unavailable" ? "flood risk" : null,
    forecast.state.status === "unavailable" ? "forecast" : null,
    pagasa.state.status === "unavailable" ? "PAGASA advisory" : null,
  ].filter((value): value is string => value !== null);

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky={sky}>
      {/* Sticky chrome — header + iOS tab bar share the same sky */}
      <div className="top-scrim sticky top-0 z-[1050]">
        <DashboardHeader lastUpdated={lastUpdated} onRefresh={refresh} loading={refreshing} />
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
          {/* Alert banner — driven by the risk resource only */}
          <AnimatePresence initial={false}>
            {riskData?.level === "danger" && (
              <AlertBanner
                level="danger"
                title="FLOOD DANGER — Immediate Action Required"
                message="Critical flood conditions detected. Move to higher ground and follow evacuation procedures."
                timestamp={riskFetchedAt}
              />
            )}
            {riskData?.level === "warning" && (
              <AlertBanner
                level="warning"
                title="Flood Warning — Be Prepared"
                message="High flood risk. Prepare to evacuate if instructed. Monitor conditions closely."
                timestamp={riskFetchedAt}
              />
            )}
            {riskData?.level === "watch" && (
              <AlertBanner
                level="watch"
                title="Flood Watch Advisory — High Tide & Cumulative Rainfall"
                message="Heavy surface runoff observed along Purok Masagana and Cotcot Riverbanks. Low-lying areas prepare for potential localized waterlogging."
                timestamp={riskFetchedAt}
              />
            )}
          </AnimatePresence>

          {/* Two-column hero: flood risk + weather */}
          <Stagger className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <StaggerItem className="lg:col-span-6 flex flex-col">
              <FloodRiskSection resource={risk.state} onRetry={risk.refetch} />
            </StaggerItem>
            <StaggerItem className="lg:col-span-6 flex flex-col">
              <WeatherHeroCard resource={current.state} onRetry={current.refetch} />
            </StaggerItem>
          </Stagger>

          {/* PAGASA regional advisory */}
          <Reveal>
            <PagasaInfo resource={pagasa.state} onRetry={pagasa.refetch} />
          </Reveal>

          {/* 24-hour forecast */}
          <Reveal>
            <ForecastStrip resource={forecast.state} onRetry={forecast.refetch} />
          </Reveal>

          {/* Rainfall trend */}
          <Reveal>
            <RainfallTrend statsResource={rainfallStats} refreshSignal={refreshSignal} />
          </Reveal>

          {/* Footer */}
          <Reveal>
            <div className="text-center text-xs text-on-sky-faint py-6 font-label-sm">
              <p>Data sourced from PAGASA &amp; OpenWeatherMap</p>
              {unavailableSources.length > 0 && (
                <p className="mt-1 text-warning">
                  Some data sources are temporarily unavailable: {unavailableSources.join(", ")}.
                </p>
              )}
            </div>
          </Reveal>
        </ViewTransition>
      </main>
    </div>
  );
}
