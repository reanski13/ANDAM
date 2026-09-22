"use client";

import { useState, useEffect, useRef, ViewTransition } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import DashboardHeader from "@/components/DashboardHeader";
import Reveal from "@/components/motion/Reveal";
import { EVACUATION_CENTERS, COTCOT } from "@/lib/constants";
import type { MapCenter, HazardZone, RiverSensor, FloodIncidentSummary } from "@/lib/db/reference";

type MapWithLayers = LeafletMap & {
  _hazardGroup?: LayerGroup;
  _sensorGroup?: LayerGroup;
  _centerGroup?: LayerGroup;
  _incidentGroup?: LayerGroup;
};

interface MapPageData {
  centers: MapCenter[];
  zones: HazardZone[];
  sensors: RiverSensor[];
  incidents: FloodIncidentSummary[];
}

const ZONE_STYLES: Record<string, { color: string; fillOpacity: number; weight: number; dashArray: string }> = {
  critical: { color: "#7f1d1d", fillOpacity: 0.2, weight: 2.5, dashArray: "7 5" },
  high: { color: "#ba1a1a", fillOpacity: 0.15, weight: 2, dashArray: "6 4" },
  moderate: { color: "#ea580c", fillOpacity: 0.12, weight: 1.5, dashArray: "4 4" },
  low: { color: "#eab308", fillOpacity: 0.1, weight: 1, dashArray: "3 3" },
};

const INCIDENT_COLORS: Record<string, string> = {
  critical: "#7f1d1d",
  high: "#dc2626",
  moderate: "#ea580c",
  low: "#eab308",
};

const FALLBACK_SENSORS: RiverSensor[] = [
  {
    id: "fallback-stn-01",
    stationId: "Stn-01",
    name: "Cotcot Bridge",
    purok: null,
    lat: 10.426,
    lon: 124.001,
    normalLevelM: 2.5,
    warningLevelM: null,
    dangerLevelM: null,
    status: "normal",
    dataSource: "simulated",
    isSimulated: true,
    latest: { timestamp: "", waterLevelM: 1.85, flowCms: 14.2, batteryPct: null },
  },
  {
    id: "fallback-stn-02",
    stationId: "Stn-02",
    name: "Masagana Creek",
    purok: null,
    lat: 10.429,
    lon: 124.0035,
    normalLevelM: 1.6,
    warningLevelM: null,
    dangerLevelM: null,
    status: "alert",
    dataSource: "simulated",
    isSimulated: true,
    latest: { timestamp: "", waterLevelM: 1.2, flowCms: 8.7, batteryPct: null },
  },
];

const FALLBACK_CENTERS: MapCenter[] = EVACUATION_CENTERS.map((center) => {
  const meta: Record<string, { sector?: string; role?: string; verified?: boolean; dataSource?: string; notes?: string }> = {
    "Tiltilon Elementary School": {
      sector: "Cotcot",
      role: "Designated EC - School",
      verified: true,
      dataSource: "PNA / DSWD DROMIC",
      notes: "Housed 509 IDPs during Typhoon Tino (Nov 2025).",
    },
    "Liloan Central School": {
      sector: "Poblacion",
      role: "Designated EC - School",
      verified: true,
      dataSource: "CDN Digital / DSWD DROMIC",
      notes: "137 Cotcot River residents relocated here, 24 Nov 2025.",
    },
    "Panphil B. Francisco Gymnasium": {
      sector: "Poblacion",
      role: "Designated EC - Gymnasium / Relief Hub",
      verified: true,
      dataSource: "DSWD DROMIC",
      notes: "618 IDPs sheltered during Tino. Approximate location.",
    },
    "Weber Hotel": {
      sector: "Poblacion",
      role: "Emergency Overflow Shelter - Private",
      verified: true,
      dataSource: "DSWD DROMIC",
      notes: "Overflow shelter (private). Approximate location.",
    },
    "Yati Elementary School": {
      sector: "Yati",
      role: "Designated EC - School",
      verified: true,
      dataSource: "CDN Digital",
      notes: "Active EC, 24 Nov 2025.",
    },
    "Calero Integrated School": {
      sector: "Calero",
      role: "Designated EC - School",
      verified: true,
      dataSource: "CDN Digital",
      notes: "Active EC, 24 Nov 2025.",
    },
  };
  const m = meta[center.name] ?? {};
  return {
    id: `fallback-${center.name.split(" ").join("-").toLowerCase()}`,
    name: center.name,
    address: center.address,
    purok: null,
    lat: center.lat,
    lon: center.lon,
    capacity: null,
    role: m.role ?? null,
    sector: m.sector ?? "",
    elevationM: null,
    elevationLabel: null,
    imageQuery: null,
    amenities: [],
    contact: null,
    verified: m.verified ?? false,
    dataSource: m.dataSource ?? null,
    notes: m.notes ?? null,
  };
});

const FALLBACK_ZONES: HazardZone[] = [
  { id: "fallback-zone-1", name: "Cotcot River Lowland", severity: "high", radiusM: 300, lat: 10.4245, lon: 124.0005, description: null },
  { id: "fallback-zone-2", name: "Cotcot River - Masagana Creek Confluence", severity: "high", radiusM: 300, lat: 10.4275, lon: 124.0025, description: null },
  { id: "fallback-zone-3", name: "Masagana Creek Corridor", severity: "moderate", radiusM: 250, lat: 10.43, lon: 124.004, description: null },
  { id: "fallback-zone-4", name: "Inland Low-lying Areas", severity: "low", radiusM: 350, lat: 10.4325, lon: 124.0005, description: null },
];

const FALLBACK_DATA: MapPageData = {
  centers: FALLBACK_CENTERS,
  zones: FALLBACK_ZONES,
  sensors: FALLBACK_SENSORS,
  incidents: [],
};

function sensorPopup(sensor: RiverSensor, color: string): string {
  const level = sensor.latest?.waterLevelM;
  const normal = sensor.normalLevelM;
  const flow = sensor.latest?.flowCms;
  return `
    <div style="font-family:inherit;padding:4px 0;min-width:160px">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">${sensor.name}</div>
      <div style="font-size:12px;color:#666;margin-bottom:6px">${sensor.stationId ?? ""}</div>
      <div style="font-size:14px;font-weight:700;color:${color}">${level != null ? level.toFixed(2) : "--"} m <span style="font-weight:400;font-size:11px;color:#666">${normal != null ? `/ ${normal.toFixed(2)}m` : ""}</span></div>
      <div style="font-size:11px;color:#666;margin-top:2px">Flow: ${flow != null ? `${flow.toFixed(1)} m\u00b3/s` : "--"}</div>
    </div>`;
}

function centerPopup(center: MapCenter): string {
  const statusColor = center.verified ? "#10855a" : "#6b7280";
  const status = center.verified ? "Designated EC — active during Typhoon Tino (Nov 2025)" : "Unconfirmed — reference only";
  const roughly = center.notes?.includes("Approximate") ? `\n      <div style="font-size:11px;color:#b45309;margin-top:2px">Approximate location</div>` : "";
  return `
    <div style="font-family:inherit;padding:4px 0;min-width:180px">
      <div style="font-weight:700;font-size:13px;margin-bottom:2px">${center.name}</div>
      <div style="font-size:11px;color:#666;margin-bottom:6px">${center.sector ?? ""}${center.address ? ` · ${center.address}` : ""}</div>
      <div style="font-size:11px;color:${statusColor};font-weight:600">\u25cf ${status}</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Capacity: ${center.capacity != null ? `${center.capacity} persons` : "— (not documented)"}</div>
      ${center.role ? `\n      <div style="font-size:11px;color:#666;margin-top:2px">${center.role}</div>` : ""}
      ${center.dataSource ? `\n      <div style="font-size:11px;color:#666;margin-top:2px">Source: ${center.dataSource}</div>` : ""}${roughly}
      <a href="https://maps.google.com/?q=${center.lat},${center.lon}" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;color:#00685d;font-weight:600;text-decoration:none">Get Directions \u2192</a>
    </div>`;
}

function incidentPopup(incident: FloodIncidentSummary, color: string): string {
  const when = incident.timestamp
    ? new Date(incident.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
  const waterLevelM = incident.waterLevelCm != null ? incident.waterLevelCm / 100 : null;
  return `
    <div style="font-family:inherit;padding:4px 0;min-width:170px">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">${incident.location ?? "Flood Incident"}</div>
      <div style="font-size:12px;color:#fff;background:${color};display:inline-block;padding:1px 8px;border-radius:999px;margin-bottom:4px">${(incident.severity ?? "unknown").toUpperCase()}</div>
      <div style="font-size:12px;color:#666">Water level: ${waterLevelM != null ? `${waterLevelM.toFixed(2)} m` : "--"}</div>
      <div style="font-size:11px;color:#666;margin-top:2px">${when} \u2022 Reported & verified</div>
    </div>`;
}

async function resolveMapData(): Promise<MapPageData> {
  try {
    const res = await fetch("/api/map-data", { headers: { Accept: "application/json" } });
    if (!res.ok) return FALLBACK_DATA;
    const json = (await res.json()) as { data?: Partial<MapPageData> };
    const data = json.data;
    if (!data || !Array.isArray(data.centers) || !Array.isArray(data.zones) || !Array.isArray(data.sensors) || !Array.isArray(data.incidents)) {
      return FALLBACK_DATA;
    }
    if (data.centers.length === 0 && data.zones.length === 0 && data.sensors.length === 0) {
      return FALLBACK_DATA;
    }
    return { centers: data.centers, zones: data.zones, sensors: data.sensors, incidents: data.incidents };
  } catch {
    return FALLBACK_DATA;
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapWithLayers | null>(null);
  const [mapData, setMapData] = useState<MapPageData>(FALLBACK_DATA);
  const [layers, setLayers] = useState({ hazard: true, sensors: true, centers: true });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    (async () => {
      const [resolved, L] = await Promise.all([
        resolveMapData(),
        import("leaflet").then((m) => m.default),
      ]);
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;
      setMapData(resolved);

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
      resolved.zones.forEach((zone) => {
        if (zone.lat == null || zone.lon == null || zone.radiusM == null) return;
        const style = ZONE_STYLES[zone.severity] ?? ZONE_STYLES.low;
        L.circle([zone.lat, zone.lon], {
          radius: zone.radiusM,
          color: style.color,
          fillColor: style.color,
          fillOpacity: style.fillOpacity,
          weight: style.weight,
          dashArray: style.dashArray,
        }).addTo(hazardGroup);
      });
      hazardGroup.addTo(map);

      // River water level sensor markers
      const sensorGroup = L.layerGroup();
      resolved.sensors.forEach((sensor) => {
        const color = sensor.status === "alert" ? "#ea580c" : "#00685d";
        const marker = L.circleMarker([sensor.lat, sensor.lon], { radius: 8, color: "#ffffff", fillColor: color, fillOpacity: 1, weight: 3 });
        marker.bindPopup(sensorPopup(sensor, color));
        marker.addTo(sensorGroup);
      });
      sensorGroup.addTo(map);

      // Evacuation center markers
      const centerGroup = L.layerGroup();
      resolved.centers.forEach((center) => {
        const marker = L.circleMarker([center.lat, center.lon], { radius: 10, color: "#ffffff", fillColor: center.verified ? "#10855a" : "#6b7280", fillOpacity: 1, weight: 3 });
        marker.bindPopup(centerPopup(center));
        marker.addTo(centerGroup);
      });
      centerGroup.addTo(map);

      // Verified flood incident markers
      const incidentGroup = L.layerGroup();
      resolved.incidents.forEach((incident) => {
        if (incident.lat == null || incident.lon == null) return;
        const color = INCIDENT_COLORS[incident.severity ?? ""] ?? "#dc2626";
        const marker = L.circleMarker([incident.lat, incident.lon], { radius: 7, color: "#ffffff", fillColor: color, fillOpacity: 0.9, weight: 2 });
        marker.bindPopup(incidentPopup(incident, color));
        marker.addTo(incidentGroup);
      });
      incidentGroup.addTo(map);

      // Store for toggling
      mapInstanceRef.current = map;
      map._hazardGroup = hazardGroup;
      map._sensorGroup = sensorGroup;
      map._centerGroup = centerGroup;
      map._incidentGroup = incidentGroup;
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
      <div className="top-scrim sticky top-0 z-[1050]">
        <DashboardHeader />
       
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
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-md font-label-md transition ${
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
          <div className="relative w-full h-[800px] lg:h-[720px] rounded-3xl overflow-hidden ring-1 ring-glass-border shadow-[var(--sky-shadow)] select-none">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Floating Legend Panel */}
          <div className="absolute top-4 left-4 z-[1000] w-72 max-w-[calc(100%-2rem)] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto glass-card-float p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-glass-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-watch animate-pulse" />
                  <span className="font-title-sm text-title-sm text-on-sky tracking-tight">Hydrological Gauges</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-accent-fill text-accent-strong font-label-sm text-label-sm font-semibold tracking-tight">{mapData.sensors.length} Simulated</span>
              </div>
              <div className="flex flex-col gap-2">
                {mapData.sensors.map((sensor) => {
                  const level = sensor.latest?.waterLevelM;
                  const flow = sensor.latest?.flowCms;
                  const isAlert = sensor.status === "alert";
                  return (
                    <div key={sensor.stationId ?? sensor.id} className="flex items-center justify-between p-2 rounded-xl bg-glass">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-sky font-semibold tracking-tight">{sensor.name} ({sensor.stationId ?? "—"})</span>
                        <span className="font-label-sm text-label-sm text-on-sky-dim tracking-tight">Flow rate: {flow != null ? `${flow.toFixed(1)} m\u00b3/s` : "—"}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-title-sm text-title-sm ${isAlert ? "text-warning" : "text-accent-strong"} font-bold tracking-tight`}>{level != null ? `${level.toFixed(2)} m` : "--"}</span>
                        <div className={`font-label-sm text-label-sm ${isAlert ? "text-warning" : "text-safe"} font-semibold flex items-center gap-0.5 justify-end`}>
                          <span className="material-symbols-outlined text-[12px]">{isAlert ? "warning" : "check_circle"}</span> {isAlert ? "Elevated" : "Normal"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flood Risk Legend */}
            <div className="pointer-events-auto glass-card-float p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="font-title-sm text-title-sm text-on-sky tracking-tight">Flood Risk Legend</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {mapData.zones.map((zone) => (
                  <div key={zone.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ZONE_STYLES[zone.severity]?.color ?? "#6b7280", opacity: 0.7 }} />
                    <span className="font-label-sm text-label-sm text-on-sky-dim">{zone.name}</span>
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
              <span className="hidden md:inline text-on-sky-faint">• Elevation not yet verified</span>
              <span className="hidden lg:inline text-on-sky-faint">• Illustrative zones &amp; sensors</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-safe font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" /> Reference Telemetry (Simulated)
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
        </ViewTransition>
      </main>
    </div>
  );
}