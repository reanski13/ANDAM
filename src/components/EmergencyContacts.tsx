"use client";

import Link from "next/link";
import { EMERGENCY_CONTACTS } from "@/lib/constants";

const contactMeta: Record<string, { role: string; icon: string; iconBg: string; iconColor: string }> = {
  "Liloan DRRMO": { role: "Primary Dispatch", icon: "flood", iconBg: "bg-accent-fill", iconColor: "text-accent-strong" },
  "Cebu Provincial DRRMO": { role: "Provincial Operations", icon: "support_agent", iconBg: "bg-accent-fill", iconColor: "text-accent-strong" },
  "Bureau of Fire Protection - Liloan": { role: "Rescue & Watercraft", icon: "local_fire_department", iconBg: "bg-danger-fill", iconColor: "text-danger" },
  "Philippine Red Cross - Cebu": { role: "Medical & Evac", icon: "health_and_safety", iconBg: "bg-danger-fill", iconColor: "text-danger" },
  "NDRRMC Hotline": { role: "National Emergency", icon: "emergency", iconBg: "bg-warning-fill", iconColor: "text-warning" },
};

export default function EmergencyContacts() {
  const regularContacts = EMERGENCY_CONTACTS.filter((c) => c.name !== "NDRRMC Hotline");
  const ndrrmc = EMERGENCY_CONTACTS.find((c) => c.name === "NDRRMC Hotline");

  return (
    <div className="glass-card p-6 flex flex-col justify-between gap-4 animate-fade-in delay-400">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-danger-fill text-danger flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">contact_phone</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-on-sky font-semibold">Direct Emergency Hotlines</h3>
              <span className="font-label-sm text-label-sm text-on-sky-faint">One-touch emergency dispatch response</span>
            </div>
          </div>
          <Link
            href="/evacuation"
            className="font-label-md text-label-md text-accent-strong hover:underline font-semibold flex items-center gap-1"
          >
            View All Evacuation Centers
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* 2x2 Contact cells */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {regularContacts.map((contact) => {
            const meta = contactMeta[contact.name] || { role: "Emergency", icon: "call", iconBg: "bg-glass", iconColor: "text-on-sky" };
            return (
              <a
                key={contact.name}
                href={`tel:${contact.number.replace(/[^0-9]/g, "")}`}
                className="p-3 rounded-2xl bg-glass hover:bg-glass-elevated transition-all flex items-center gap-3 group active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-on-sky-faint font-semibold uppercase tracking-wider truncate">{meta.role}</span>
                  <span className="font-title-sm text-title-sm text-on-sky font-bold truncate">{contact.name}</span>
                  <span className="font-body-md text-body-md text-on-sky-faint truncate tabular-nums">{contact.number}</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* NDRRMC featured cell */}
        {ndrrmc && (
          <a
            href={`tel:${ndrrmc.number.replace(/[^0-9]/g, "")}`}
            className="mt-2 p-3 rounded-2xl bg-danger-fill hover:bg-danger-fill/80 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center font-bold font-title-sm">911</span>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm text-on-sky font-bold">NDRRMC National Emergency Helpline</span>
                <span className="font-label-sm text-label-sm text-danger font-medium">24/7 Toll-Free Priority Routing</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-danger text-[20px] mr-1">call</span>
          </a>
        )}
      </div>

      {/* Quick action bar */}
      <div className="pt-3 border-t border-glass-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safe" />
          </span>
          <span className="font-label-sm text-label-sm text-on-sky-faint">Radio VHF Ch 142.500 MHz Standing By</span>
        </div>
        <a
          href="tel:0322734321"
          className="pill-btn pill-btn-primary"
        >
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          Initiate Immediate Call
        </a>
      </div>
    </div>
  );
}