import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import TopTabBar from "@/components/TopTabBar";
import LogoutButton from "@/components/LogoutButton";
import Reveal from "@/components/motion/Reveal";
import { getCurrentUser, isOfficial } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Officials Dashboard - ANDAM",
  description: "Tools for barangay officials to monitor weather patterns and coordinate emergency response",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!isOfficial(user)) {
    redirect("/admin/login");
  }

  const displayName =
    (user!.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined ?? user!.email ?? "Official";
  const roleText =
    (user!.user_metadata as Record<string, unknown> | undefined)?.role as string | undefined ?? "Accredited Official";
  return (
    <div className="sky-surface min-h-screen flex flex-col" data-sky="clouds">
      <div className="top-scrim sticky top-0 z-[1050]">
        <TopTabBar />
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
        {/* Top Command Action Bar */}
        <Reveal>
        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 glass-card p-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-fill text-accent-strong font-label-sm font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                BDRRMO Municipal Command Center
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-glass text-on-sky-dim font-label-sm font-medium">
                Station ID: CC-LIL-01
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-sky tracking-tight">Officials Dashboard</h1>
            <p className="font-body-lg text-body-lg text-on-sky-dim">
              Tools for barangay officials to monitor weather patterns, manage alerts, coordinate emergency response, and dispatch rescue teams across Cotcot, Liloan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="glass-chip px-3 py-1.5 text-on-sky-dim font-label-sm text-label-sm font-semibold inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-accent-strong">shield_person</span>
              {displayName} · {roleText}
            </span>
            <LogoutButton />
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-glass text-on-sky hover:bg-glass-elevated font-title-sm transition duration-200 active:scale-95">
              <span className="material-symbols-outlined text-[18px] text-accent-strong">picture_as_pdf</span>
              Export SitRep (PDF)
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-glass text-on-sky hover:bg-glass-elevated font-title-sm transition duration-200 active:scale-95">
              <span className="material-symbols-outlined text-[18px] text-accent-strong">add_notes</span>
              New Incident Log
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-fill text-accent-strong hover:brightness-105 active:scale-95 font-title-sm font-semibold transition duration-200">
              <span className="material-symbols-outlined text-[20px]">cell_tower</span>
              Broadcast Public SMS Alert
            </button>
          </div>
        </section>
        </Reveal>

        {/* Quick Telemetry Metric Row */}
        <Reveal delay={0.05}>
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="flex flex-col justify-between p-5 rounded-3xl glass-card interactive-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-on-sky-dim font-medium">Hydrological Sensors</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-safe-fill text-safe font-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" /> 100% ONLINE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-metric-huge text-metric-huge text-on-sky tracking-tight">4 of 4</span>
              <span className="font-title-sm text-title-sm text-accent-strong font-medium">Reporting</span>
            </div>
            <div className="pt-2">
              <div className="flex flex-wrap gap-1 mt-1">
                {["Purok Masagana", "Cotcot River Bridge", "Suba", "High School"].map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-glass text-on-sky-dim text-[11px] font-label-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 rounded-3xl glass-card interactive-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-on-sky-dim font-medium">Subscribed Citizens</span>
              <span className="inline-flex items-center gap-1 text-safe font-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +142 this week
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-metric-huge text-metric-huge text-on-sky tracking-tight">2,840</span>
              <span className="font-title-sm text-title-sm text-on-sky-dim font-normal">Residents</span>
            </div>
            <p className="font-body-md text-body-md text-on-sky-dim flex items-center gap-1.5 pt-2">
              <span className="material-symbols-outlined text-[16px] text-accent-strong">verified</span>
              82% coverage in flood hazard zones
            </p>
          </div>

          <div className="flex flex-col justify-between p-5 rounded-3xl glass-card interactive-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-on-sky-dim font-medium">Field Incident Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-watch-fill text-watch font-label-sm font-semibold">MONITORING</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-metric-huge text-metric-huge text-on-sky tracking-tight">0</span>
              <span className="font-title-sm text-title-sm text-danger font-medium">Critical</span>
              <span className="text-on-sky-faint font-body-md">/</span>
              <span className="font-headline-md text-headline-md text-accent-strong font-semibold">1</span>
              <span className="font-body-md text-body-md text-on-sky-dim">Minor</span>
            </div>
            <p className="font-body-md text-body-md text-on-sky-dim flex items-center gap-1.5 pt-2">
              <span className="material-symbols-outlined text-[16px] text-accent-strong">info</span>
              Minor waterlogging: Purok Riverside canal
            </p>
          </div>

          <div className="flex flex-col justify-between p-5 rounded-3xl glass-card interactive-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-md text-label-md text-on-sky-dim font-medium">Evacuation Preparedness</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-safe-fill text-safe font-label-sm font-semibold">PRE-POSITIONED</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-metric-huge text-metric-huge text-on-sky tracking-tight">4</span>
              <span className="font-title-sm text-title-sm text-on-sky-dim font-normal">Centers Ready</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-on-sky-dim">
              <span className="font-label-sm text-label-sm">Total Capacity</span>
              <span className="font-title-sm text-title-sm font-semibold text-accent-strong">1,450 pax</span>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Core Feature Modules */}
        <Reveal delay={0.1}>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Municipal Command Modules</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Disaster mitigation sub-systems undergoing continuous rollout for BDRRMO operatives</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather History */}
            <div className="relative overflow-hidden rounded-3xl glass-card p-6 flex flex-col justify-between interactive-card">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-accent-fill flex items-center justify-center text-accent-strong shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">bar_chart</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass text-on-sky-dim font-label-sm font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-sky-faint" />
                    Coming Soon • Q3 Update
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-sky tracking-tight mb-2">Weather History &amp; Precipitation Logs</h3>
                  <p className="font-body-md text-body-md text-on-sky-dim leading-relaxed">
                    Track historical rainfall accumulation, barometric trends, and river gauge telemetry to identify recurring seasonal flood patterns.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 bg-glass rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-sky-dim font-semibold">30-Day Cumulative Precipitation</span>
                  <span className="font-label-md font-semibold text-accent-strong">124.6 mm Basin Mean</span>
                </div>
                <svg className="w-full h-16 text-accent-strong" fill="none" viewBox="0 0 400 64">
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="rainGrad" x1="0" x2="0" y1="0" y2="64">
                      <stop stopColor="currentColor" stopOpacity="0.25" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,52 C30,48 45,55 70,38 C95,20 120,40 150,30 C180,20 210,48 240,36 C270,24 290,12 320,18 C350,24 375,44 400,28 L400,64 L0,64 Z" fill="url(#rainGrad)" />
                  <path d="M0,52 C30,48 45,55 70,38 C95,20 120,40 150,30 C180,20 210,48 240,36 C270,24 290,12 320,18 C350,24 375,44 400,28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  <line opacity="0.6" stroke="#F28B82" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="400" y1="22" y2="22" />
                  <text className="font-label-sm" fontSize="9" fontWeight="600" fill="#F28B82" x="340" y="16">Overflow Mark</text>
                </svg>
              </div>
            </div>

            {/* Flood Analytics */}
            <div className="relative overflow-hidden rounded-3xl glass-card p-6 flex flex-col justify-between interactive-card">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-accent-fill flex items-center justify-center text-accent-strong shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">trending_up</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-safe-fill text-safe font-label-sm font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                    Coming Soon • Beta
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-sky tracking-tight mb-2">Flood Analytics &amp; Machine Learning Forecast</h3>
                  <p className="font-body-md text-body-md text-on-sky-dim leading-relaxed">
                    Analyze multi-year drainage capacity, contour runoff speeds, and generate automated hydrological risk assessments.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 bg-glass rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-sky-dim font-semibold">Hydrological Model Precision</span>
                  <span className="font-title-sm font-bold text-safe">94.2% Acc. Rate</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-glass-strong overflow-hidden">
                  <div className="h-full bg-safe rounded-full" style={{ width: "94.2%" }} />
                </div>
                <span className="font-label-sm text-on-sky-dim pt-1">Calibrated via PAGASA Mactan radar &amp; Cotcot downstream telemetry</span>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="relative overflow-hidden rounded-3xl glass-card p-6 flex flex-col justify-between interactive-card">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-accent-fill flex items-center justify-center text-accent-strong shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">notifications_active</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-watch-fill text-watch font-label-sm font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-watch" />
                    In Integration
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-sky tracking-tight mb-2">Emergency Broadcast &amp; SMS Subscriptions</h3>
                  <p className="font-body-md text-body-md text-on-sky-dim leading-relaxed">
                    Manage barangay-wide early warning sirens, localized cellular SMS broadcasts, and push notifications tailored by purok danger zones.
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-glass rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px] text-accent-strong">contact_phone</span>
                  <div className="flex flex-col">
                    <span className="font-title-sm font-semibold text-on-sky">2,840 Registered Mobiles</span>
                    <span className="font-label-sm text-on-sky-dim">Spans all 7 Puroks</span>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-glass-strong text-on-sky font-label-sm font-semibold">Gateway Live</span>
              </div>
            </div>

            {/* Community Reports */}
            <div className="relative overflow-hidden rounded-3xl glass-card p-6 flex flex-col justify-between interactive-card">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-accent-fill flex items-center justify-center text-accent-strong shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">group_work</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass text-on-sky-dim font-label-sm font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-sky-faint" />
                    Coming Soon • Field App
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-sky tracking-tight mb-2">Citizen Crowdsource &amp; Field Reports</h3>
                  <p className="font-body-md text-body-md text-on-sky-dim leading-relaxed">
                    Review, verify, and geolocate photo submissions of clogged culverts, water levels, and fallen trees from community marshals.
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-watch-fill rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-watch opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-watch" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-sm font-semibold text-on-sky">3 Reports Pending Review</span>
                    <span className="font-label-sm text-on-sky-dim">Incoming photos from Purok Riverside</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-full bg-glass-strong text-watch font-label-md font-semibold hover:bg-glass transition-colors">View Queue</button>
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Administrative Activity Log */}
        <Reveal delay={0.15}>
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-sky tracking-tight">Administrative Activity Log</h2>
              <p className="font-body-md text-body-md text-on-sky-dim">Tamper-evident BDRRMO dispatch logs and siren trigger records</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-full bg-glass text-on-sky-dim font-label-md hover:bg-glass-elevated transition-colors">Filter by Purok</button>
              <button className="px-3 py-1.5 rounded-full bg-glass text-on-sky-dim font-label-md hover:bg-glass-elevated transition-colors">Download CSV</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-glass">
                    <th className="py-3.5 px-6 font-label-md text-label-md text-on-sky-dim font-semibold uppercase tracking-wider">Timestamp</th>
                    <th className="py-3.5 px-6 font-label-md text-label-md text-on-sky-dim font-semibold uppercase tracking-wider">Officer In-Charge</th>
                    <th className="py-3.5 px-6 font-label-md text-label-md text-on-sky-dim font-semibold uppercase tracking-wider">Action Taken</th>
                    <th className="py-3.5 px-6 font-label-md text-label-md text-on-sky-dim font-semibold uppercase tracking-wider">Target Scope</th>
                    <th className="py-3.5 px-6 font-label-md text-label-md text-on-sky-dim font-semibold uppercase tracking-wider">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  <tr className="hover:bg-glass-elevated/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-title-sm text-on-sky">14:15 PM PST</span>
                        <span className="font-label-sm text-on-sky-dim">Today</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent-fill text-accent-strong flex items-center justify-center font-label-sm font-semibold">MM</div>
                        <div className="flex flex-col">
                          <span className="font-title-sm text-title-sm text-on-sky">Engr. M. Mendoza</span>
                          <span className="font-label-sm text-accent-strong">Chief Hydrologist</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="font-body-md text-on-sky font-medium">Recalibrated River Bridge Sensor gauge offset (+0.04m)</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="px-2.5 py-1 rounded-full bg-glass-strong text-on-sky font-label-sm">Station #02</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="inline-flex items-center gap-1 text-safe font-label-md font-semibold"><span className="material-symbols-outlined text-[16px]">check_circle</span> Verified</span></td>
                  </tr>
                  <tr className="hover:bg-glass-elevated/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-title-sm text-on-sky">13:00 PM PST</span>
                        <span className="font-label-sm text-on-sky-dim">Today</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent-fill text-accent-strong flex items-center justify-center font-label-sm font-semibold">RT</div>
                        <div className="flex flex-col">
                          <span className="font-title-sm text-title-sm text-on-sky">R. Tanod Suba</span>
                          <span className="font-label-sm text-accent-strong">Barangay Peacekeeper</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="font-body-md text-on-sky font-medium">Logged drainage clearance at Purok Riverside culvert intake</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="px-2.5 py-1 rounded-full bg-glass-strong text-on-sky font-label-sm">Purok Riverside</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="inline-flex items-center gap-1 text-safe font-label-md font-semibold"><span className="material-symbols-outlined text-[16px]">check_circle</span> Photo Attached</span></td>
                  </tr>
                  <tr className="hover:bg-glass-elevated/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-title-sm text-on-sky">09:42 AM PST</span>
                        <span className="font-label-sm text-on-sky-dim">Today</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-glass-strong text-on-sky flex items-center justify-center font-label-sm font-semibold">BC</div>
                        <div className="flex flex-col">
                          <span className="font-title-sm text-title-sm text-on-sky">Hon. B. Cañete</span>
                          <span className="font-label-sm text-accent-strong">Brgy. Captain / CDRRMC</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="font-body-md text-on-sky font-medium">Issued SitRep #14 to Municipal Liloan DRRMO</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="px-2.5 py-1 rounded-full bg-glass-strong text-on-sky font-label-sm">Municipal MDRRMO</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="inline-flex items-center gap-1 text-accent-strong font-label-md font-semibold"><span className="material-symbols-outlined text-[16px]">task_alt</span> Acknowledged</span></td>
                  </tr>
                  <tr className="hover:bg-glass-elevated/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-title-sm text-on-sky">06:00 AM PST</span>
                        <span className="font-label-sm text-on-sky-dim">Today</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-glass-strong text-on-sky flex items-center justify-center font-label-sm font-semibold">SYS</div>
                        <div className="flex flex-col">
                          <span className="font-title-sm text-title-sm text-on-sky">Automated System</span>
                          <span className="font-label-sm text-accent-strong">Diagnostic Routine</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="font-body-md text-on-sky font-medium">Daily telemetry ping test to all 4 solar repeater towers completed (0 errors)</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="px-2.5 py-1 rounded-full bg-glass-strong text-on-sky font-label-sm">All Sensors</span></td>
                    <td className="py-4 px-6 whitespace-nowrap"><span className="inline-flex items-center gap-1 text-safe font-label-md font-semibold"><span className="material-symbols-outlined text-[16px]">check_circle</span> Automated OK</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-glass flex items-center justify-between">
              <span className="font-label-sm text-on-sky-dim">Displaying latest 4 of 128 registered events this month</span>
              <a className="font-label-md text-accent-strong font-semibold hover:underline flex items-center gap-1" href="#">
                View Complete Command Audit Log
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </section>
        </Reveal>
        </ViewTransition>
      </main>
    </div>
  );
}