"use client";

import { useState, useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import TopTabBar from "@/components/TopTabBar";
import DashboardHeader from "@/components/DashboardHeader";
import Reveal from "@/components/motion/Reveal";
import { EVACUATION_CENTERS, COTCOT } from "@/lib/constants";

type MapWithLayers = LeafletMap & {
  _hazardGroup?: LayerGroup;
  _sensorGroup?: LayerGroup;
  _centerGroup?: LayerGroup;
};

const SENSOR_MARKERS = [
  { name: "Cotcot Bridge", stationId: "Stn-01", level: 1.85, normal: 2.5, flow: "14.2 m\u00b3/s", status: "normal" as const, lat: 10.3015, lon: 123.9818 },
  { name: "Masagana Creek", stationId: "Stn-02", level: 1.20, normal: 1.6, flow: "8.7 m\u00b3/s", status: "alert" as const, lat: 10.2988, lon: 123.9845 },
];

const CENTER_META: Record<string, { capacity: number; sector: string }> = {
  "Cotcot Barangay Hall": { capacity: 350, sector: "Sector A" },
  "Cotcot Elementary School": { capacity: 600, sector: "Sector B" },
  "Liloan Municipal Gymnasium": { capacity: 800, sector: "Municipal Hub" },
  "Sacred Heart School - Cotcot": { capacity: 400, sector: "Sector C" },
};

const FLOOD_ZONES = [
  { name: "Purok Masagana Lowland", risk: "high" as const, color: "#ba1a1a" },
  { name: "Cotcot River Mouth", risk: "high" as const, color: "#ba1a1a" },
  { name: "Purok Suba Coastal", risk: "moderate" as const, color: "#ea580c" },
  { name: "Inland Low-lying Areas", risk: "low" as const, color: "#eab308" },
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapWithLayers | null>(null);
  const [layers, setLayers] = useState({ hazard: true, sensors: true, centers: true });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [COTCOT.lat, COTCOT.lon],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      }) as MapWithLayers;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      // Flood hazard zones as circular overlays
      const hazardGroup = L.layerGroup();
      const highRiskCoords: [number, number][] = [
        [10.3005, 123.9833],
        [10.2995, 123.9828],
      ];
      highRiskCoords.forEach((coords) => {
        L.circle(coords, { radius: 300, color: "#ba1a1a", fillColor: "#ba1a1a", fillOpacity: 0.15, weight: 2, dashArray: "6 4" }).addTo(hazardGroup);
      });
      L.circle([10.3008, 123.9840], { radius: 250, color: "#ea580c", fillColor: "#ea580c", fillOpacity: 0.12, weight: 1.5, dashArray: "4 4" }).addTo(hazardGroup);
      L.circle([10.2998, 123.9820], { radius: 350, color: "#eab308", fillColor: "#eab308", fillOpacity: 0.1, weight: 1, dashArray: "3 3" }).addTo(hazardGroup);
      hazardGroup.addTo(map);

      // Sensor markers
      const sensorGroup = L.layerGroup();
      SENSOR_MARKERS.forEach((s) => {
        const color = s.status === "alert" ? "#ea580c" : "#00685d";
        const marker = L.circleMarker([s.lat, s.lon], { radius: 8, color: "#ffffff", fillColor: color, fillOpacity: 1, weight: 3 });
        const popup = `
          <div style="font-family:inherit;padding:4px 0;min-width:160px">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${s.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:6px">${s.stationId}</div>
            <div style="font-size:14px;font-weight:700;color:${color}">${s.level.toFixed(2)} m <span style="font-weight:400;font-size:11px;color:#666">/ ${s.normal.toFixed(2)}m</span></div>
            <div style="font-size:11px;color:#666;margin-top:2px">Flow: ${s.flow}</div>
          </div>`;
        marker.bindPopup(popup);
        marker.addTo(sensorGroup);
      });
      sensorGroup.addTo(map);

      // Evacuation center markers
      const centerGroup = L.layerGroup();
      EVACUATION_CENTERS.forEach((c) => {
        const meta = CENTER_META[c.name] ?? { capacity: 0, sector: "" };
        const marker = L.circleMarker([c.lat, c.lon], { radius: 10, color: "#ffffff", fillColor: "#10855a", fillOpacity: 1, weight: 3 });
        const popup = `
          <div style="font-family:inherit;padding:4px 0;min-width:160px">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${c.name}</div>
            <div style="font-size:11px;color:#666;margin-bottom:6px">${meta.sector}</div>
            <div style="font-size:12px;color:#10855a;font-weight:600">Capacity: ${meta.capacity} persons</div>
            <div style="font-size:12px;color:#10855a;font-weight:600;margin-top:2px">Status: Standby / Ready</div>
            <a href="https://maps.google.com/?q=${c.lat},${c.lon}" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;color:#00685d;font-weight:600;text-decoration:none">Get Directions \u2192</a>
          </div>`;
        marker.bindPopup(popup);
        marker.addTo(centerGroup);
      });
      centerGroup.addTo(map);

      // Store for toggling
      mapInstanceRef.current = map;
      map._hazardGroup = hazardGroup;
      map._sensorGroup = sensorGroup;
      map._centerGroup = centerGroup;
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const map = mapInstanceRef.current;
      if (!map) return next;
      const groupKey = key === "hazard" ? "_hazardGroup" : key === "sensors" ? "_sensorGroup" : "_centerGroup";
      const group = map[groupKey];
      if (group) {
        if (next[key]) {
          map.addLayer(group);
        } else {
          map.removeLayer(group);
        }
      }
      return next;
    });
  };

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="top-scrim sticky top-0 z-40">
        <DashboardHeader />
        <TopTabBar />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Action Bar */}
        <Reveal>
          <div className="flex flex-col gap-4 mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-fill text-accent-strong font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-strong animate-pulse" />
                  GIS Spatial Telemetry
                </span>
                <span className="font-label-sm text-label-sm text-on-sky-faint font-medium">EPSG:4326 WGS84</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Interactive Flood Risk & GIS Evacuation Map</h1>
              <p className="font-body-md text-body-md text-on-sky-dim max-w-3xl">Spatial hydrology, monitored stream sensors, flood susceptibility zones, and evacuation routes for Barangay Cotcot.</p>
            </div>

            {/* Layer Filter Toolbar */}
            <div className="w-full lg:w-auto glass-card-flat p-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-3 font-label-sm text-label-sm text-on-sky-faint font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-accent-strong">layers</span>
                  Layers:
                </span>
                {(Object.keys(layers) as (keyof typeof layers)[]).map((key) => {
                  const labels = { hazard: "Flood Hazard Zones", sensors: "River Water Level Sensors", centers: "Evacuation Centers" };
                  const dotColors = { hazard: "bg-danger", sensors: "bg-watch", centers: "bg-safe" };
                  return (
                    <button
                      key={key}
                      onClick={() => toggleLayer(key)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-md font-label-md transition-all ${
                        layers[key]
                          ? "bg-accent-fill text-accent-strong shadow-sm"
                          : "bg-glass text-on-sky-dim"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColors[key]}`} />
                      <span className="">{labels[key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        </Reveal>

        {/* Map Canvas */}
        <Reveal delay={0.05}>
          <div className="relative w-full h-[680px] lg:h-[720px] rounded-3xl overflow-hidden ring-1 ring-glass-border shadow-[var(--sky-shadow)] select-none">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Floating Legend Panel */}
          <div className="absolute top-4 left-4 z-[1000] w-72 max-w-[calc(100%-2rem)] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto glass-card-flat p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-glass-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-watch animate-ping" />
                  <span className="font-title-sm text-title-sm text-on-sky tracking-tight">Hydrological Gauges</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-accent-fill text-accent-strong font-label-sm text-label-sm font-semibold tracking-tight">2 Active</span>
              </div>
              <div className="flex flex-col gap-2">
                {SENSOR_MARKERS.map((s) => (
                  <div key={s.stationId} className="flex items-center justify-between p-2 rounded-xl bg-glass">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-sky font-semibold tracking-tight">{s.name} ({s.stationId})</span>
                      <span className="font-label-sm text-label-sm text-on-sky-dim tracking-tight">Flow rate: {s.flow}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-title-sm text-title-sm ${s.status === "alert" ? "text-warning" : "text-accent-strong"} font-bold tracking-tight`}>{s.level.toFixed(2)} m</span>
                      <div className={`font-label-sm text-label-sm ${s.status === "alert" ? "text-warning" : "text-safe"} font-semibold flex items-center gap-0.5 justify-end`}>
                        <span className="material-symbols-outlined text-[12px]">{s.status === "alert" ? "warning" : "check_circle"}</span> {s.status === "alert" ? "Elevated" : "Normal"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flood Risk Legend */}
            <div className="pointer-events-auto glass-card-flat p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="font-title-sm text-title-sm text-on-sky tracking-tight">Flood Risk Legend</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {FLOOD_ZONES.map((z) => (
                  <div key={z.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color, opacity: 0.7 }} />
                    <span className="font-label-sm text-label-sm text-on-sky-dim">{z.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Status Strip */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-glass/85 backdrop-blur-md z-[1000] flex items-center justify-between px-4 border-t border-glass-border text-on-sky-dim font-label-sm text-label-sm">
            <div className="flex items-center gap-4 truncate">
              <div className="flex items-center gap-1.5 font-medium text-on-sky">
                <span className="material-symbols-outlined text-[16px] text-accent-strong">pin_drop</span>
                <span>Center: {COTCOT.lat}° N, {COTCOT.lon}° E • Cotcot, Liloan, Cebu</span>
              </div>
              <span className="hidden md:inline text-on-sky-faint">• Elevation: 4.2m ASL</span>
              <span className="hidden lg:inline text-on-sky-faint">• Hydrologic Basin: Cotcot-Pangdan Sub-Watershed</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-safe font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" /> Live Telemetry Connected
              </span>
            </div>
          </div>
        </div>
        </Reveal>

        {/* Action Cards */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="glass-card p-4 flex items-start gap-4 interactive-card">
            <div className="w-12 h-12 rounded-2xl bg-accent-fill text-accent-strong flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">location_searching</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-title-sm text-title-sm text-on-sky font-semibold">Center on My Location</span>
              <p className="font-body-md text-body-md text-on-sky-dim text-xs leading-relaxed">Pinpoint your exact Purok location within Cotcot to verify direct flood risk classification.</p>
              <button className="mt-1 font-label-md text-label-md text-accent-strong font-semibold hover:underline text-left inline-flex items-center gap-1">
                Activate GPS Locate <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="glass-card p-4 flex items-start gap-4 interactive-card">
            <div className="w-12 h-12 rounded-2xl bg-accent-fill text-accent-strong flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-title-sm text-title-sm text-on-sky font-semibold">Download Offline Evacuation Map</span>
              <p className="font-body-md text-body-md text-on-sky-dim text-xs leading-relaxed">High-resolution printable PDF featuring elevation contours, dry footpaths, and emergency shelters.</p>
              <button className="mt-1 font-label-md text-label-md text-accent-strong font-semibold hover:underline text-left inline-flex items-center gap-1">
                Download PDF (4.8 MB) <span className="material-symbols-outlined text-[14px]">download</span>
              </button>
            </div>
          </div>
          <div className="glass-card p-4 flex items-start gap-4 interactive-card">
            <div className="w-12 h-12 rounded-2xl bg-warning-fill text-warning flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-title-sm text-title-sm text-on-sky font-semibold">Report Localized Water Pooling</span>
              <p className="font-body-md text-body-md text-on-sky-dim text-xs leading-relaxed">Submit geo-tagged photographic reports to Barangay Cotcot Disaster Dispatchers in real-time.</p>
              <button className="mt-1 font-label-md text-label-md text-warning font-semibold hover:underline text-left inline-flex items-center gap-1">
                Submit Dispatch Report <span className="material-symbols-outlined text-[14px]">send</span>
              </button>
            </div>
          </div>
        </div>
        </Reveal>
      </main>
    </div>
  );
}
