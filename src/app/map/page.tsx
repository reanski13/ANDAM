"use client";

import { useCallback, useEffect, useRef, useState, ViewTransition } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import { Camera, CameraOff, ChevronRight, MapPin, Radio, ShieldCheck } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import FloodRiskSection from "@/components/dashboard/FloodRiskSection";
import Reveal from "@/components/motion/Reveal";
import { useDashboardResource } from "@/lib/hooks/useDashboardResource";
import type { RiskResource } from "@/lib/dashboard/types";

type Station = {
  id: "cotcot-bridge" | "mulao-bridge";
  name: string;
  location: string;
  coordinates: [number, number];
  note: string;
  feedStatus: "live" | "unavailable";
};

const FEED_STATUS = {
  live: {
    label: "Live feed",
    detail: "Verified visual feed available",
    dotClassName: "bg-safe",
    textClassName: "text-safe",
    badgeClassName: "bg-safe-fill text-safe",
  },
  unavailable: {
    label: "Feed unavailable",
    detail: "No authorized camera source",
    dotClassName: "bg-warning",
    textClassName: "text-warning",
    badgeClassName: "bg-warning-fill text-warning",
  },
} as const;

const STATIONS: Station[] = [
  {
    id: "cotcot-bridge",
    name: "Cotcot River Bridge",
    location: "Near Welcome to Compostela sign",
    coordinates: [10.430223653221535, 124.00315014253883],
    note: "Camera source authorization is pending.",
    feedStatus: "unavailable",
  },
  {
    id: "mulao-bridge",
    name: "Mulao Bridge",
    location: "Mulao, Liloan",
    coordinates: [10.476531365364663, 123.94633531592825],
    note: "Camera source authorization is pending.",
    feedStatus: "unavailable",
  },
];

export default function MapPage() {
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const selectedStationIdRef = useRef<Station["id"]>("cotcot-bridge");
  const stationMarkersRef = useRef<Record<Station["id"], CircleMarker | null>>({
    "cotcot-bridge": null,
    "mulao-bridge": null,
  });
  const [selectedStationId, setSelectedStationId] = useState<Station["id"]>("cotcot-bridge");
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const risk = useDashboardResource<RiskResource>("/api/weather/risk");

  const selectedStation = STATIONS.find((station) => station.id === selectedStationId) ?? STATIONS[0];
  const selectedFeedStatus = FEED_STATUS[selectedStation.feedStatus];

  useEffect(() => {
    selectedStationIdRef.current = selectedStationId;
  }, [selectedStationId]);

  const setMapRef = useCallback((element: HTMLDivElement | null) => {
    setMapContainer(element);
  }, []);

  useEffect(() => {
    if (!mapContainer || mapInstanceRef.current) return;

    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;

      const initialStation = STATIONS.find((station) => station.id === selectedStationIdRef.current) ?? STATIONS[0];
      const map = L.map(mapContainer, {
        center: initialStation.coordinates,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      STATIONS.forEach((station) => {
        const marker = L.circleMarker(station.coordinates, {
          radius: station.id === selectedStationIdRef.current ? 9 : 7,
          color: "#ffffff",
          fillColor: station.id === selectedStationIdRef.current ? "#1d4ed8" : "#52657b",
          fillOpacity: 1,
          weight: 3,
        });
        marker.bindTooltip(station.name, { direction: "top", offset: [0, -8] });
        marker.on("click", () => setSelectedStationId(station.id));
        marker.addTo(map);
        stationMarkersRef.current[station.id] = marker;
      });

      mapInstanceRef.current = map;
      map.fitBounds(STATIONS.map((station) => station.coordinates), { padding: [28, 28], maxZoom: 13 });
    })();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [mapContainer]);

  useEffect(() => {
    STATIONS.forEach((station) => {
      const selected = station.id === selectedStationId;
      stationMarkersRef.current[station.id]?.setStyle({
        radius: selected ? 9 : 7,
        fillColor: selected ? "#1d4ed8" : "#52657b",
      });
    });
  }, [selectedStationId]);

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="top-scrim sticky top-0 z-[1050]">
        <DashboardHeader />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 pb-10">
        <ViewTransition
          enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          default="none"
        >
          <Reveal>
            <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2 font-label-md text-label-md text-on-sky-dim">
                  <Radio className="h-4 w-4 text-accent-strong" aria-hidden="true" />
                  River surveillance
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Cotcot River Surveillance</h1>
                <p className="mt-1 font-body-lg text-body-lg text-on-sky-dim">
                  Planned visual monitoring points for Cotcot River. Direct camera feeds will appear here once authorized and connected.
                </p>
              </div>
              <div className="glass-chip w-fit px-3 py-2 font-label-sm text-label-sm text-on-sky-dim">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-strong" aria-hidden="true" /> Visual monitoring only</span>
              </div>
            </header>
          </Reveal>

          <Reveal delay={0.05}>
            <section aria-label="Surveillance monitoring" className="glass-card overflow-hidden">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
                <section aria-labelledby="camera-stage-heading" className="min-w-0">
                  <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="font-label-sm text-label-sm text-on-sky-faint">Selected station</p>
                      <h3 id="camera-stage-heading" className="truncate font-title-lg text-title-lg text-on-sky">{selectedStation.name}</h3>
                    </div>
                    <span className={`status-chip shrink-0 ${selectedFeedStatus.badgeClassName}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${selectedFeedStatus.dotClassName}`} />
                      {selectedFeedStatus.label}
                    </span>
                  </div>

                  <div className="relative aspect-video bg-[linear-gradient(135deg,rgba(6,18,39,0.92),rgba(19,52,85,0.72))] px-6 text-center">
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" />
                    <div className="relative flex h-full flex-col items-center justify-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-warning">
                        <CameraOff className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <p className="font-title-lg text-title-lg text-white">No live feed is available</p>
                      <p className="mt-2 max-w-md font-body-md text-body-md text-white/70">{selectedStation.note} A verified visual feed will appear here when it becomes available.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 px-4 py-3 font-label-sm text-label-sm text-on-sky-dim sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent-strong" aria-hidden="true" /> {selectedStation.location}</span>
                    <span>No automated water-level telemetry</span>
                  </div>
                </section>

                <aside aria-label="Camera stations" className="border-t border-glass-border p-3 lg:border-t-0 lg:border-l">
                  <div className="px-1 pb-2">
                    <h3 className="font-title-sm text-title-sm text-on-sky">Camera stations</h3>
                    <p className="mt-1 font-label-sm text-label-sm text-on-sky-dim">Select a station to update the monitoring area.</p>
                  </div>
                  <div className="space-y-2">
                    {STATIONS.map((station) => {
                      const selected = station.id === selectedStationId;
                      const feedStatus = FEED_STATUS[station.feedStatus];
                      return (
                        <button
                          key={station.id}
                          type="button"
                          onClick={() => setSelectedStationId(station.id)}
                          aria-pressed={selected}
                          className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${selected ? "border-accent-strong bg-accent-fill text-on-sky" : "border-transparent bg-glass text-on-sky-dim hover:border-glass-border hover:bg-glass-elevated"}`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-accent-strong text-white" : "bg-glass text-on-sky-faint"}`}>
                            <Camera className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate font-title-sm text-title-sm">{station.name}</span>
                              {selected && <span className="shrink-0 font-label-sm text-label-sm font-semibold text-accent-strong">Selected</span>}
                            </span>
                            <span className="mt-0.5 block truncate font-label-sm text-label-sm text-on-sky-dim">{station.location}</span>
                            <span className={`mt-1 inline-flex items-center gap-1 font-label-sm text-label-sm ${feedStatus.textClassName}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${feedStatus.dotClassName}`} />
                              {feedStatus.detail}
                            </span>
                          </span>
                          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selected ? "translate-x-0.5 text-accent-strong" : "text-on-sky-faint"}`} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </aside>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.15}>
            <section aria-label="River alert status" className="mt-5">
              <FloodRiskSection
                resource={risk.state}
                onRetry={risk.refetch}
                contextSlot={
                  <section aria-labelledby="station-map-heading" className="overflow-hidden rounded-2xl border border-glass-border bg-glass">
                    <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-3">
                      <div>
                        <h2 id="station-map-heading" className="font-title-sm text-title-sm text-on-sky">Station context</h2>
                        <p className="mt-0.5 font-label-sm text-label-sm text-on-sky-dim">Cotcot River Bridge and Mulao Bridge</p>
                      </div>
                      <span className="glass-chip shrink-0 px-2.5 py-1.5 font-label-sm text-label-sm text-on-sky-dim">2 stations</span>
                    </div>
                    <div className="relative h-[210px] sm:h-[250px]">
                      <div ref={setMapRef} className="h-full w-full" aria-label="Map showing Cotcot River Bridge and Mulao Bridge camera stations" />
                    </div>
                  </section>
                }
              />
            </section>
          </Reveal>
        </ViewTransition>
      </main>
    </div>
  );
}
