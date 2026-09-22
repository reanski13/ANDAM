"use client";

import { useState, useEffect, ViewTransition } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import Reveal from "@/components/motion/Reveal";
import { EVACUATION_CENTERS, EMERGENCY_CONTACTS } from "@/lib/constants";
import type { MapCenter } from "@/lib/db/reference";

const CENTER_META: Record<string, { role: string; sector: string; verified: boolean; dataSource: string; notes: string }> = {
  "Tiltilon Elementary School": {
    role: "Designated EC - School",
    sector: "Cotcot",
    verified: true,
    dataSource: "PNA / DSWD DROMIC",
    notes: "Housed 509 IDPs during Typhoon Tino (Nov 2025).",
  },
  "Liloan Central School": {
    role: "Designated EC - School",
    sector: "Poblacion",
    verified: true,
    dataSource: "CDN Digital / DSWD DROMIC",
    notes: "137 Cotcot River residents relocated here, 24 Nov 2025.",
  },
  "Panphil B. Francisco Gymnasium": {
    role: "Designated EC - Gymnasium / Relief Hub",
    sector: "Poblacion",
    verified: true,
    dataSource: "DSWD DROMIC",
    notes: "618 IDPs sheltered during Tino. Approximate location.",
  },
  "Weber Hotel": {
    role: "Emergency Overflow Shelter - Private",
    sector: "Poblacion",
    verified: true,
    dataSource: "DSWD DROMIC",
    notes: "Overflow shelter for Tiltilon evacuees (private). Approximate location.",
  },
  "Yati Elementary School": {
    role: "Designated EC - School",
    sector: "Yati",
    verified: true,
    dataSource: "CDN Digital",
    notes: "Active EC, 24 Nov 2025.",
  },
  "Calero Integrated School": {
    role: "Designated EC - School",
    sector: "Calero",
    verified: true,
    dataSource: "CDN Digital",
    notes: "Active EC, 24 Nov 2025.",
  },
};

interface CenterCard {
  key: string;
  name: string;
  address: string | null;
  lat: number;
  lon: number;
  role: string | null;
  sector: string | null;
  capacity: number | null;
  amenities: string[];
  elevation: string | null;
  verified: boolean;
  dataSource: string | null;
  notes: string | null;
}

const FALLBACK_CENTER_CARDS: CenterCard[] = EVACUATION_CENTERS.map((center) => {
  const meta = CENTER_META[center.name] ?? { role: "", sector: "", verified: false, dataSource: null, notes: null };
  return {
    key: center.name,
    name: center.name,
    address: center.address,
    lat: center.lat,
    lon: center.lon,
    role: meta.role || null,
    sector: meta.sector,
    capacity: null,
    amenities: [],
    elevation: null,
    verified: meta.verified,
    dataSource: meta.dataSource,
    notes: meta.notes,
  };
});

const AMENITY_ICONS: Record<string, string> = {
  "Generator Equipped": "electrical_services",
  "Medical First Aid Station": "medical_services",
  "Satellite Comm": "wifi",
  "Multi-classroom Shelter": "school",
  "Elevated Ground (12m)": "landscape",
  "Sanitation Blocks": "wc",
  "Primary Relief Distribution Hub": "inventory_2",
  "Covered Arena Structure": "stadium",
  "Fleet Access": "local_shipping",
  "Kitchen & Hygiene Facilities": "soup_kitchen",
  "Secondary Shelter": "apartment",
  "Rainwater Filtration": "water",
};

const AMENITY_COLORS: Record<string, string> = {
  "electrical_services": "text-accent-strong",
  "medical_services": "text-danger",
  "wifi": "text-accent-strong",
  "school": "text-accent-strong",
  "landscape": "text-safe",
  "wc": "text-accent-strong",
  "inventory_2": "text-safe",
  "stadium": "text-accent-strong",
  "local_shipping": "text-accent-strong",
  "soup_kitchen": "text-safe",
  "apartment": "text-accent-strong",
  "water": "text-accent-strong",
};

const CONTACT_ICONS: Record<string, string> = {
  "Liloan DRRMO": "flood",
  "Cebu Provincial DRRMO": "domain",
  "Bureau of Fire Protection - Liloan": "local_fire_department",
  "Philippine Red Cross - Cebu": "health_and_safety",
  "NDRRMC Hotline": "emergency",
};

const CONTACT_ROLES: Record<string, string> = {
  "Liloan DRRMO": "Local Rescue Command",
  "Cebu Provincial DRRMO": "Provincial Headquarters",
  "Bureau of Fire Protection - Liloan": "Fire & Water Rescue",
  "Philippine Red Cross - Cebu": "Medical & Blood Aid",
  "NDRRMC Hotline": "National Emergency",
};

const CONTACT_COLORS: Record<string, string> = {
  "Liloan DRRMO": "bg-accent-fill text-accent-strong",
  "Cebu Provincial DRRMO": "bg-accent-fill text-accent-strong",
  "Bureau of Fire Protection - Liloan": "bg-danger-fill text-danger",
  "Philippine Red Cross - Cebu": "bg-danger-fill text-danger",
  "NDRRMC Hotline": "bg-warning-fill text-warning",
};

const CONTACT_HOVER: Record<string, string> = {
  "Liloan DRRMO": "group-hover:bg-accent group-hover:text-white",
  "Cebu Provincial DRRMO": "group-hover:bg-accent group-hover:text-white",
  "Bureau of Fire Protection - Liloan": "group-hover:bg-danger group-hover:text-white",
  "Philippine Red Cross - Cebu": "group-hover:bg-danger group-hover:text-white",
  "NDRRMC Hotline": "",
};

const CONTACT_PHONE_COLORS: Record<string, string> = {
  "Liloan DRRMO": "text-accent-strong",
  "Cebu Provincial DRRMO": "text-accent-strong",
  "Bureau of Fire Protection - Liloan": "text-danger",
  "Philippine Red Cross - Cebu": "text-on-sky",
  "NDRRMC Hotline": "text-on-sky",
};

interface AccordionItem {
  id: string;
  phase: string;
  phaseColor: string;
  phaseBg: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  items: { icon: string; iconColor: string; title: string; description: string }[];
  footer: string;
  footerIcon: string;
  footerRef: string;
}

const SAFETY_GUIDE: AccordionItem[] = [
  {
    id: "before",
    phase: "Phase 01",
    phaseColor: "text-accent-strong",
    phaseBg: "bg-accent-fill",
    icon: "checklist_rtl",
    iconBg: "bg-accent-fill",
    iconColor: "text-accent-strong",
    title: "Before a Flood: Mitigation & Readiness",
    subtitle: "Preparation & Vigilance",
    subtitleColor: "text-on-sky-dim",
    items: [
      { icon: "backpack", iconColor: "text-accent-strong", title: "Prepare Your 72-Hour \"Go-Bag\"", description: "Pack ready-to-eat rations, 3 liters of potable drinking water per individual, water-purification tablets, and extra prescription medications." },
      { icon: "folder_zip", iconColor: "text-accent-strong", title: "Seal Crucial Documents", description: "Store government IDs, land titles, health records, birth certificates, and insurance policies in heavy-duty waterproof ziplock envelopes." },
      { icon: "electrical_services", iconColor: "text-accent-strong", title: "Elevate Critical Household Utilities", description: "Raise heavy electrical machinery, appliances, gas tanks, and power strips above anticipated inundation flood marks (minimum 1.5 meters from floor)." },
      { icon: "route", iconColor: "text-accent-strong", title: "Family Evacuation Route Mapping", description: "Pre-designate an elevated rendezvous waypoint and monitor Cotcot river hydrograph sensors for real-time crest trends." },
    ],
    footer: "Emergency gear checklist: Flashlight, whistle, battery radio, powerbank, hygiene kit.",
    footerIcon: "check_circle",
    footerRef: "General DRRM practice",
  },
  {
    id: "during",
    phase: "Phase 02",
    phaseColor: "text-danger",
    phaseBg: "bg-danger-fill",
    icon: "warning",
    iconBg: "bg-danger-fill",
    iconColor: "text-danger",
    title: "During a Flood: Life Protection Actions",
    subtitle: "Active Emergency Protocols",
    subtitleColor: "text-danger",
    items: [
      { icon: "power_settings_new", iconColor: "text-danger", title: "Cut Main Circuit Breaker Immediately", description: "If floodwaters approach your home, shut off main electrical switches and LPG valves prior to water contact to avoid fatal electrocution risks." },
      { icon: "no_transfer", iconColor: "text-danger", title: "Never Walk or Drive in Flood Streams", description: "Just 6 inches of rapid water current can sweep an adult off their feet; 12-18 inches can float and overturn cars and passenger vans." },
      { icon: "electric_bolt", iconColor: "text-danger", title: "Steer Clear of Fallen Utility Poles", description: "Assume all submerged cables and dangling wires carry live voltage. Maintain at least a 10-meter clearance perimeter from fallen hardware." },
      { icon: "directions_walk", iconColor: "text-danger", title: "Orderly Evacuation to Shelters", description: "Proceed promptly to your assigned shelter along elevated Purok arterial routes. Keep children and the elderly secured in front of the line." },
    ],
    footer: "Rule of Thumb: \"Turn Around, Don't Drown\". Inundation speeds can escalate within 12 minutes.",
    footerIcon: "priority_high",
    footerRef: "Liloan DRRM Advisory",
  },
  {
    id: "after",
    phase: "Phase 03",
    phaseColor: "text-safe",
    phaseBg: "bg-safe-fill",
    icon: "home_repair_service",
    iconBg: "bg-safe-fill",
    iconColor: "text-safe",
    title: "After a Flood: Safe Repatriation & Sanitization",
    subtitle: "Recovery & Safe Return",
    subtitleColor: "text-safe",
    items: [
      { icon: "campaign", iconColor: "text-safe", title: "Await Official BDRRMO \"All-Clear\"", description: "Do not return to low-lying riverbanks until the Cotcot Barangay Captain and municipal engineers issue an official clearance decree." },
      { icon: "water_drop", iconColor: "text-safe", title: "Boil Water for Minimum 3 Minutes", description: "Assume municipal pipeline supplies and groundwater shallow wells are contaminated by flood runoff. Boil vigorously before drinking or cooking." },
      { icon: "pest_control", iconColor: "text-safe", title: "Inspect for Structural Shifts & Reptiles", description: "Check foundations, load-bearing walls, and ceilings for fissures. Be vigilant: displaced snakes, rodents, and scorpions often harbor in debris." },
      { icon: "photo_camera", iconColor: "text-safe", title: "Document Damage for Municipal Relief", description: "Take photographs and timestamps of structural damage and lost property prior to cleanup to facilitate DSWD and LGU emergency rehabilitation grants." },
    ],
    footer: "Wear thick rubber boots and work gloves during domestic flood cleanups.",
    footerIcon: "health_and_safety",
    footerRef: "DSWD Guidelines",
  },
];

export default function EvacuationPage() {
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(["before"]));
  const [openCenterKey, setOpenCenterKey] = useState<string | null>(FALLBACK_CENTER_CARDS[0]?.key ?? null);
  const [centers, setCenters] = useState<CenterCard[]>(FALLBACK_CENTER_CARDS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/map-data", { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: { centers?: MapCenter[] } };
        const list = json?.data?.centers;
        if (!list || list.length === 0) return;
        const cards: CenterCard[] = list.map((center) => ({
          key: center.id,
          name: center.name,
          address: center.address,
          lat: center.lat,
          lon: center.lon,
          role: center.role,
          sector: center.sector,
          capacity: center.capacity ?? null,
          amenities: center.amenities,
          elevation: center.elevationLabel,
          verified: center.verified,
          dataSource: center.dataSource,
          notes: center.notes,
        }));
        if (!cancelled) setCenters(cards);
      } catch {
        // keep fallback centers
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const verifiedCount = centers.filter((center) => center.verified).length;

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="top-scrim sticky top-0 z-40">
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
        {/* Status & Quick Navigation Ribbon */}
        <Reveal>
        <section className="flex flex-col gap-4">
          <div className="glass-card-flat p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-watch" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-3">
                <span className="font-label-md text-label-md uppercase tracking-wider text-warning font-bold">DORMANT OFF-SEASON — DOCUMENTED MUNICIPAL EC ROSTER (TYPHOON TINO, NOV 2025)</span>
                <span className="hidden sm:inline text-on-sky-faint">•</span>
                <span className="font-label-sm text-label-sm text-on-sky-dim font-medium">No centers currently open · capacities not published by LGU</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="bg-safe-fill text-safe px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span> {verifiedCount} Documented ECs
              </span>
              <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">public</span> Public Record
              </span>
            </div>
          </div>

          {/* Page Header with Logistics Overview + Quick Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wider uppercase">DRRM Protocol 3.3</span>
                  <span className="text-on-sky-faint">•</span>
                  <span className="font-label-sm text-label-sm text-on-sky-dim">Liloan Municipal Disaster Network</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-sky tracking-tight leading-tight">Evacuation Centers & Emergency Directory</h1>
                <p className="font-body-lg text-body-lg text-on-sky-dim mt-2 max-w-2xl">
                  Documented municipal evacuation centers, emergency dispatch contacts, and comprehensive flood safety guidelines for Barangay Cotcot residents.
                </p>
              </div>
              <div className="pt-6 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Designated Centers</span>
                  <span className="font-headline-md text-headline-md text-accent-strong font-bold">{centers.length}</span>
                  <span className="font-label-sm text-label-sm text-on-sky-faint block mt-0.5">Full municipal roster</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Documented ECs</span>
                  <span className="font-headline-md text-headline-md text-safe font-bold">{verifiedCount} / {centers.length}</span>
                  <span className="font-label-sm text-label-sm text-safe block mt-0.5">Reported during Tino / Verbena</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Capacity Data</span>
                  <span className="font-headline-md text-headline-md text-on-sky font-bold">—</span>
                  <span className="font-label-sm text-label-sm text-accent-strong font-medium block mt-0.5">Not published by LGU</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Ingress Times</span>
                  <span className="font-headline-md text-headline-md text-accent-strong font-bold">—</span>
                  <span className="font-label-sm text-label-sm text-on-sky-dim block mt-0.5">Not measured</span>
                </div>
              </div>
            </div>

            {/* Quick Dispatch Card */}
            <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-accent-fill rounded-full opacity-60 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-md text-label-md tracking-widest text-accent-strong uppercase font-semibold">Immediate Dispatch</span>
                  <span className="bg-accent-fill text-accent-strong px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">Liloan DRRMC</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-sky font-bold tracking-tight">Need Assisted Evacuation?</h2>
                <p className="font-body-md text-body-md text-on-sky-dim mt-2">
                  If water enters your area or you have elderly, PWD, or infants needing rescue transport, contact the Liloan DRRMO immediately.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-6 pt-2 relative">
                <a className="w-full pill-btn pill-btn-primary" href="tel:911">
                  <span className="material-symbols-outlined text-danger text-[20px]">sos</span>
                  <span className="font-bold">Call National 911 Hotline</span>
                </a>
                <a className="w-full glass-btn" href="tel:09562711967">
                  <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  <span className="">Liloan DRRMO: 0956 271 1967</span>
                </a>
                <p className="font-label-sm text-label-sm text-on-sky-faint text-center">Verified via Cebu PDRRMO hotline list (GMA News, Oct 2025)</p>
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Evacuation Centers Grid */}
        <Reveal delay={0.05}>
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-sky tracking-tight">Municipal Evacuation Centers</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Documented EC roster from the public record (Typhoon Tino, Nov 2025). Capacities and amenities shown only where published. Tap a center to expand details, amenities, and directions.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-sky-dim">Roster verified against DSWD / news reports</span>
              <span className="material-symbols-outlined text-accent-strong text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {centers.map((center) => {
              const isOpen = openCenterKey === center.key;
              return (
                <div key={center.key} className="glass-card rounded-3xl overflow-hidden transition duration-300">
                  <button
                    className="w-full p-5 md:p-6 flex items-center justify-between gap-4 text-left hover:bg-glass-elevated/40 transition-colors cursor-pointer"
                    onClick={() => setOpenCenterKey(isOpen ? null : center.key)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl ${center.verified ? "bg-safe-fill text-safe" : "bg-glass-card text-on-sky-dim"} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[24px]">{center.verified ? "apartment" : "map"}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-accent-fill text-accent-strong font-label-sm text-label-sm px-2 py-0.5 rounded-md font-semibold">{center.role ?? "Reference Site"}</span>
                          {center.verified ? (
                            <span className="bg-safe-fill text-safe px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">verified</span> Designated EC
                            </span>
                          ) : (
                            <span className="bg-glass-card text-on-sky-dim px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">help</span> Unconfirmed
                            </span>
                          )}
                        </div>
                        <h3 className="font-title-lg text-title-lg text-on-sky mt-0.5 truncate">{center.name}</h3>
                        <p className="font-body-md text-body-md text-on-sky-dim flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-accent-strong text-[15px] shrink-0">pin_drop</span>
                          <span className="truncate">{center.address ?? ""}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-sky-dim transition-transform duration-300 transform shrink-0 ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 md:px-6 pb-6 pt-2 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-glass p-4 rounded-2xl flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-on-sky-dim uppercase font-semibold">Capacity Threshold</span>
                            <span className="font-title-sm text-title-sm text-accent-strong font-bold">{center.capacity != null ? `${center.capacity} Persons` : "— Not Published"}</span>
                          </div>
                          {center.capacity != null ? (
                            <div className="w-full bg-glass-strong rounded-full h-2 overflow-hidden">
                              <div className="bg-safe h-full rounded-full" style={{ width: "3%" }} />
                            </div>
                          ) : (
                            <p className="font-label-sm text-label-sm text-on-sky-faint">Design capacity not published by the LGU for this facility.</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {center.amenities.length > 0 ? (
                              center.amenities.map((a) => {
                                const icon = AMENITY_ICONS[a] ?? "check_circle";
                                const color = AMENITY_COLORS[icon] ?? "text-safe";
                                return (
                                  <span key={a} className="bg-glass-card text-on-sky-dim px-2 py-0.5 rounded text-label-sm font-label-sm flex items-center gap-1">
                                    <span className={`material-symbols-outlined text-[14px] ${color}`}>{icon}</span> {a}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="font-label-sm text-label-sm text-on-sky-faint">No amenities documented in the public record.</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-glass p-4 rounded-2xl flex flex-col gap-2">
                          <span className="font-label-sm text-label-sm text-on-sky-dim uppercase font-semibold">Position</span>
                          <p className="font-title-sm text-title-sm text-on-sky font-mono">{center.lat}° N, {center.lon}° E</p>
                          {center.dataSource ? (
                            <p className="font-label-sm text-label-sm text-on-sky-faint">Source: {center.dataSource}</p>
                          ) : null}
                          {center.notes ? (
                            <p className="font-body-md text-body-md text-on-sky-dim">{center.notes}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a className="pill-btn pill-btn-primary" href={`https://maps.google.com/?q=${center.lat},${center.lon}`} rel="noopener noreferrer" target="_blank">
                          <span className="material-symbols-outlined text-[18px]">near_me</span>
                          <span className="">Get Directions</span>
                        </a>
                        <a className="glass-btn" href="tel:09562711967">
                          <span className="material-symbols-outlined text-[18px] text-accent-strong">call</span>
                          <span className="">Call Liloan DRRMO</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        </Reveal>

        {/* Emergency Directory */}
        <Reveal delay={0.1}>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-sky tracking-tight">Direct Emergency Dispatch Directory</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Instant one-tap tactical communication links to municipal, provincial, and national disaster agencies.</p>
            </div>
            <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-md text-label-md font-semibold hidden sm:inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">support_agent</span> Priority Hotlines Active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {EMERGENCY_CONTACTS.map((contact) => {
              const icon = CONTACT_ICONS[contact.name] ?? "phone";
              const role = CONTACT_ROLES[contact.name] ?? "";
              const colors = CONTACT_COLORS[contact.name] ?? "bg-glass text-on-sky";
              const hover = CONTACT_HOVER[contact.name] ?? "";
              const phoneColor = CONTACT_PHONE_COLORS[contact.name] ?? "text-on-sky";
              const isNDRRMC = contact.name === "NDRRMC Hotline";
              return (
                <a
                  key={contact.name}
                  href={`tel:${contact.number.replace(/[^0-9]/g, "")}`}
                  className={`${isNDRRMC ? "bg-warning-fill ring-1 ring-warning/40" : "glass-card"} p-4 rounded-3xl flex flex-col justify-between transition group`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-2xl ${colors} ${hover} flex items-center justify-center mb-3 transition-colors`}>
                      <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    </div>
                    <span className={`font-label-sm text-label-sm ${isNDRRMC ? "text-warning" : "text-on-sky-dim"} font-semibold uppercase tracking-wider block`}>{role}</span>
                    <h3 className="font-title-sm text-title-sm text-on-sky mt-0.5">{contact.name}</h3>
                    <p className={`font-body-md text-body-md ${isNDRRMC ? "text-on-sky" : phoneColor} font-bold mt-2 font-mono ${isNDRRMC ? "tracking-wider" : ""}`}>{contact.number}</p>
                    {contact.altNumber ? (
                      <p className="font-label-sm text-label-sm text-on-sky-dim mt-1">Alt: {contact.altNumber}</p>
                    ) : null}
                    <p className="font-label-sm text-label-sm text-on-sky-faint mt-1">{contact.source}</p>
                  </div>
                  <div className={`mt-4 pt-2 flex items-center justify-between ${isNDRRMC ? "text-warning" : "text-accent-strong"} font-label-sm text-label-sm font-semibold`}>
                    <span className="">{isNDRRMC ? "Toll-Free Immediate" : "Tap to Dial"}</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">call</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
        </Reveal>

        {/* Safety Guide Accordion */}
        <Reveal delay={0.15}>
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-sky tracking-tight">Comprehensive Flood Safety Guide</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Step-by-step standard operating protocols formulated by Cotcot BDRRMO for household readiness.</p>
            </div>
            <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold self-start sm:self-auto">
              Standard DRRM Checklist
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {SAFETY_GUIDE.map((guide) => {
              const isOpen = openAccordions.has(guide.id);
              return (
                <div key={guide.id} className="glass-card rounded-3xl overflow-hidden transition duration-300">
                  <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-glass-elevated/40 transition-colors cursor-pointer"
                    onClick={() => toggleAccordion(guide.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${guide.iconBg} ${guide.iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[26px]">{guide.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-label-sm text-label-sm ${guide.phaseBg} ${guide.phaseColor} px-2 py-0.5 rounded font-semibold uppercase tracking-wider`}>{guide.phase}</span>
                          <span className={`font-label-sm text-label-sm ${guide.subtitleColor} font-medium`}>{guide.subtitle}</span>
                        </div>
                        <h3 className="font-title-lg text-title-lg text-on-sky mt-0.5">{guide.title}</h3>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-sky-dim transition-transform duration-300 transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {guide.items.map((item) => (
                          <div key={item.title} className="bg-glass p-4 rounded-2xl flex items-start gap-3">
                            <span className={`material-symbols-outlined ${item.iconColor} text-[22px] mt-0.5`}>{item.icon}</span>
                            <div>
                              <h4 className="font-title-sm text-title-sm text-on-sky font-semibold">{item.title}</h4>
                              <p className="font-body-md text-body-md text-on-sky-dim mt-1">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`${guide.id === "during" ? "bg-danger-fill text-danger" : "bg-glass text-on-sky-dim"} p-3 rounded-2xl flex items-center justify-between font-label-md text-label-md`}>
                        <span className="flex items-center gap-1 font-medium">
                          <span className={`material-symbols-outlined text-[16px] ${guide.id === "during" ? "" : "text-safe"}`}>{guide.footerIcon}</span> {guide.footer}
                        </span>
                        <span className={`font-mono ${guide.id === "during" ? "text-danger" : "text-on-sky-faint"} font-semibold`}>{guide.footerRef}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        </Reveal>
        </ViewTransition>
      </main>
    </div>
  );
}