"use client";

import { useState } from "react";
import TopTabBar from "@/components/TopTabBar";
import DashboardHeader from "@/components/DashboardHeader";
import Reveal from "@/components/motion/Reveal";
import { EVACUATION_CENTERS, EMERGENCY_CONTACTS } from "@/lib/constants";

const CENTER_META: Record<string, { role: string; sector: string; capacity: number; imageQuery: string; amenities: string[]; elevation: string }> = {
  "Cotcot Barangay Hall": {
    role: "Primary Command Station",
    sector: "Sector A",
    capacity: 350,
    imageQuery: "Cotcot Barangay Hall, Liloan, Cebu",
    amenities: ["Generator Equipped", "Medical First Aid Station", "Satellite Comm"],
    elevation: "BDRRMO Operations Room on Level 2",
  },
  "Cotcot Elementary School": {
    role: "High Elevation Zone",
    sector: "Sector B",
    capacity: 600,
    imageQuery: "Cotcot Elementary School, Purok Masagana, Liloan, Cebu",
    amenities: ["Multi-classroom Shelter", "Elevated Ground (12m)", "Sanitation Blocks"],
    elevation: "12m Above Sea Level (Non-inundation)",
  },
  "Liloan Municipal Gymnasium": {
    role: "Primary Logistics Hub",
    sector: "Municipal Hub",
    capacity: 800,
    imageQuery: "Liloan Municipal Gymnasium, Poblacion, Liloan, Cebu",
    amenities: ["Primary Relief Distribution Hub", "Covered Arena Structure", "Fleet Access"],
    elevation: "Heavy Vehicle Ingress & Supply Depot",
  },
  "Sacred Heart School - Cotcot": {
    role: "Highway Corridor Refuge",
    sector: "Sector C",
    capacity: 400,
    imageQuery: "Sacred Heart School, Cotcot, Liloan, Cebu",
    amenities: ["Kitchen & Hygiene Facilities", "Secondary Shelter", "Rainwater Filtration"],
    elevation: "Direct Highway Access • Well Lit Perimeter",
  },
};

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
    footerRef: "Cotcot BDRRMO S.O.P. #01",
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

  const totalCapacity = Object.values(CENTER_META).reduce((sum, m) => sum + m.capacity, 0);

  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="top-scrim sticky top-0 z-40">
        <DashboardHeader />
        <TopTabBar />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Status & Quick Navigation Ribbon */}
        <Reveal>
        <section className="flex flex-col gap-4">
          <div className="glass-card-flat p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-safe" />
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-3">
                <span className="font-label-md text-label-md uppercase tracking-wider text-safe font-bold">ALL 4 DESIGNATED CENTERS ARE ON STANDBY STATUS</span>
                <span className="hidden sm:inline text-on-sky-faint">•</span>
                <span className="font-label-sm text-label-sm text-on-sky-dim font-medium">Power & Clean Water Verified by Cotcot BDRRMO</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="bg-safe-fill text-safe px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Grid Normal
              </span>
              <span className="bg-accent-fill text-accent-strong px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">water_drop</span> Reserves 100%
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
                  Designated safe refuge zones, logistical capacities, direct emergency dispatch, and comprehensive flood safety guidelines for Brgy. Cotcot residents.
                </p>
              </div>
              <div className="pt-6 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Total Refuge Pool</span>
                  <span className="font-headline-md text-headline-md text-accent-strong font-bold">{totalCapacity.toLocaleString()}</span>
                  <span className="font-label-sm text-label-sm text-on-sky-faint block mt-0.5">Persons capacity</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Current Occupancy</span>
                  <span className="font-headline-md text-headline-md text-safe font-bold">0%</span>
                  <span className="font-label-sm text-label-sm text-safe block mt-0.5">Pre-activation stage</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Shelters Ready</span>
                  <span className="font-headline-md text-headline-md text-on-sky font-bold">4 / 4</span>
                  <span className="font-label-sm text-label-sm text-accent-strong font-medium block mt-0.5">Inspected & cleared</span>
                </div>
                <div className="bg-glass p-3 rounded-2xl">
                  <span className="font-label-sm text-label-sm text-on-sky-dim uppercase tracking-wider block">Avg. Ingress Time</span>
                  <span className="font-headline-md text-headline-md text-accent-strong font-bold">6.4</span>
                  <span className="font-label-sm text-label-sm text-on-sky-dim block mt-0.5">Mins foot transit</span>
                </div>
              </div>
            </div>

            {/* Quick Dispatch Card */}
            <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-accent-fill rounded-full opacity-60 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-md text-label-md tracking-widest text-accent-strong uppercase font-semibold">Immediate Dispatch</span>
                  <span className="bg-accent-fill text-accent-strong px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">24/7 BDRRMO</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-sky font-bold tracking-tight">Need Assisted Evacuation?</h2>
                <p className="font-body-md text-body-md text-on-sky-dim mt-2">
                  If water enters your residential zone or you have elderly, PWD, or infants needing rescue transport, contact Cotcot Command immediately.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-6 pt-2 relative">
                <a className="w-full pill-btn pill-btn-primary" href="tel:911">
                  <span className="material-symbols-outlined text-danger text-[20px]">sos</span>
                  <span className="font-bold">Call National 911 Hotline</span>
                </a>
                <a className="w-full glass-btn" href="tel:0322734321">
                  <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  <span className="">Liloan DRRMO: (032) 273-4321</span>
                </a>
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
              <h2 className="font-headline-md text-headline-md text-on-sky tracking-tight">Designated Evacuation Shelters</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Real-time status, architectural capacity, and logistical amenities across Barangay Cotcot sectors.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-sky-dim">Live telemetry synched with GIS</span>
              <span className="material-symbols-outlined text-accent-strong text-[18px]">satellite_alt</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EVACUATION_CENTERS.map((center) => {
              const meta = CENTER_META[center.name] ?? { role: "", sector: "", capacity: 0, imageQuery: "", amenities: [], elevation: "" };
              return (
                <article key={center.name} className="glass-card p-6 flex flex-col justify-between interactive-card">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-accent-fill text-accent-strong font-label-sm text-label-sm px-2 py-0.5 rounded-md font-semibold">{meta.role}</span>
                          <span className="text-on-sky-faint">•</span>
                          <span className="font-label-sm text-label-sm text-on-sky-dim font-mono">{center.lat}° N, {center.lon}° E</span>
                        </div>
                        <h3 className="font-title-lg text-title-lg text-on-sky mt-1">{center.name}</h3>
                        <p className="font-body-md text-body-md text-on-sky-dim flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-accent-strong text-[16px]">pin_drop</span>
                          {center.address}
                        </p>
                      </div>
                      <span className="bg-safe-fill text-safe px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-safe" /> Standby / Ready
                      </span>
                    </div>
                    <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-glass-elevated">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-label-sm font-label-sm">
                        <span className="bg-glass-card text-on-sky px-3 py-1 rounded-full font-medium">{meta.elevation}</span>
                        <span className="bg-accent-strong text-on-accent px-3 py-1 rounded-full">{meta.sector}</span>
                      </div>
                    </div>
                    <div className="bg-glass p-4 rounded-2xl flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-sky-dim uppercase font-semibold">Capacity Threshold</span>
                        <span className="font-title-sm text-title-sm text-accent-strong font-bold">{meta.capacity} Persons</span>
                      </div>
                      <div className="w-full bg-glass-strong rounded-full h-2 overflow-hidden">
                        <div className="bg-safe h-full rounded-full" style={{ width: "3%" }} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {meta.amenities.map((a) => {
                          const icon = AMENITY_ICONS[a] ?? "check_circle";
                          const color = AMENITY_COLORS[icon] ?? "text-safe";
                          return (
                            <span key={a} className="bg-glass-card text-on-sky-dim px-2 py-0.5 rounded text-label-sm font-label-sm flex items-center gap-1">
                              <span className={`material-symbols-outlined text-[14px] ${color}`}>{icon}</span> {a}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 grid grid-cols-2 gap-3">
                    <a className="pill-btn pill-btn-primary" href={`https://maps.google.com/?q=${center.lat},${center.lon}`} rel="noopener noreferrer" target="_blank">
                      <span className="material-symbols-outlined text-[18px]">near_me</span>
                      <span className="">Get Directions</span>
                    </a>
                    <a className="glass-btn" href="tel:0322734321">
                      <span className="material-symbols-outlined text-[18px] text-accent-strong">call</span>
                      <span className="">Call Station</span>
                    </a>
                  </div>
                </article>
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
                  className={`${isNDRRMC ? "bg-warning-fill ring-1 ring-warning/40" : "glass-card"} p-4 rounded-3xl flex flex-col justify-between transition-all group`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-2xl ${colors} ${hover} flex items-center justify-center mb-3 transition-colors`}>
                      <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    </div>
                    <span className={`font-label-sm text-label-sm ${isNDRRMC ? "text-warning" : "text-on-sky-dim"} font-semibold uppercase tracking-wider block`}>{role}</span>
                    <h3 className="font-title-sm text-title-sm text-on-sky mt-0.5">{contact.name}</h3>
                    <p className={`font-body-md text-body-md ${isNDRRMC ? "text-on-sky" : phoneColor} font-bold mt-2 font-mono ${isNDRRMC ? "tracking-wider" : ""}`}>{contact.number}</p>
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
                <div key={guide.id} className="glass-card rounded-3xl overflow-hidden transition-all duration-300">
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
      </main>
    </div>
  );
}