> **⚠️ SUPERSEDED** — This document describes the ORIGINAL pre-redesign UI (sidebar navigation, teal palette, placeholder map/admin) and is **out of date**. Kept for reference only. The source of truth is now `PROJECT_OVERVIEW.md` (architecture & conventions) and `DESIGN.md` (design system). Do not use this file to plan or build UI.

# Cotcot Flood Alert — UI Structure & Handoff Spec

## Overview

This document provides a complete UI/UX specification for the Cotcot Flood Alert webapp. It is intended as a handoff reference for redesign in Google Stitch or any other design tool.

**App Name:** Cotcot Flood Alert
**Target:** Barangay Cotcot, Liloan, Cebu, Philippines
**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + lucide-react icons
**Mobile-first:** Yes — primary audience is barangay residents on mobile devices

---

## 1. Design Tokens & Color Palette

### Primary Palette (Teal)

| Token | Hex | Usage |
|---|---|---|
| `teal-deep` | `#0F4C5C` | Sidebar active bg, section headers, dark accents |
| `teal` | `#2A9D8F` | Primary brand color, buttons, icons, links, active states |
| `teal-light` | `#DFF4F2` | Info card backgrounds, hover states, icon containers |
| `aqua-bg` | `#F4F9FB` | Page background, soft card fill |

### Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | Card backgrounds, text on dark |
| `page-bg` | `#F4F9FB` | Main content area background |
| `card-bg` | `#FFFFFF` | All card surfaces |
| `text-primary` | `#1A2332` | Headings, primary text |
| `text-secondary` | `#5A6A7A` | Body text, descriptions |
| `text-muted` | `#9BA8B7` | Timestamps, placeholders |
| `border-light` | `#E8ECF0` | Card borders, dividers |

### Status / Alert Palette

| Token | Hex | Usage |
|---|---|---|
| `safe` | `#16A34A` | Safe level badge, checkmarks |
| `watch` | `#EAB308` | Watch level badge, yellow alert |
| `watch-bg` | `#FEF9C3` | Watch alert banner background |
| `warning` | `#EA580C` | Warning level badge, orange alert |
| `warning-bg` | `#FFF7ED` | Warning alert banner background |
| `danger` | `#DC2626` | Danger level badge, red alert, emergency |
| `danger-bg` | `#FEF2F2` | Danger alert banner background |

---

## 2. Global Layout

### Root Layout (`src/app/layout.tsx`)
- Inter font (weights 400–900) via `next/font/google`
- Leaflet CSS imported globally
- Body class: `bg-page-bg text-text-primary antialiased`
- No global nav bar — navigation is handled by `DashboardSidebar`

### Dashboard Shell (used on `/`)
- **Left:** `DashboardSidebar` (collapsible, 240px expanded / 72px collapsed)
- **Right:** Main content area with `DashboardHeader` at top, scrollable content below

---

## 3. Pages

### 3.1 Dashboard — `/` (Home)

**Route:** `/`
**File:** `src/app/page.tsx`
**Client Component:** Yes (`"use client"`)
**Data Fetch:** `GET /api/weather` on mount + manual refresh

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ [Sidebar] │ [DashboardHeader]           │
│           │─────────────────────────────│
│           │ [AlertBanner] (conditional)  │
│           │                              │
│           │ ┌───────────┬──────────────┐ │
│           │ │ FloodRisk │ WeatherHero  │ │
│           │ │   Card    │    Card      │ │
│           │ └───────────┴──────────────┘ │
│           │                              │
│           │ ┌──────┐┌──────┐┌──────┐    │
│           │ │Cond. ││Cond. ││Cond. │    │
│           │ │Card  ││Card  ││Card  │    │
│           │ └──────┘└──────┘└──────┘    │
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │    ForecastStrip        │  │
│           │ └─────────────────────────┘  │
│           │                              │
│           │ ┌───────────┬──────────────┐ │
│           │ │ PagasaInfo│ Emergency    │ │
│           │ │           │ Contacts     │ │
│           │ └───────────┴──────────────┘ │
└─────────────────────────────────────────┘
```

#### Component Tree
1. `DashboardSidebar`
2. `DashboardHeader`
3. `AlertBanner` — shown when risk level is `watch`, `warning`, or `danger`
4. `FloodRiskCard` — hero card with risk score
5. `WeatherHeroCard` — temperature + conditions hero
6. `ConditionCard` × 3 — Humidity, Wind Speed, Pressure
7. `ForecastStrip` — horizontal scrollable forecast
8. `PagasaInfo` — PAGASA advisory
9. `EmergencyContacts` — clickable phone links

#### States
| State | Behavior |
|---|---|
| Loading | Skeleton shimmer cards (pulsing gray placeholders) |
| Error | Red error banner at top with retry button |
| Empty | Shown when OpenWeather returns null — "Weather data unavailable" |
| Normal | Full dashboard with live data |
| Refreshing | Same as normal but with spinning refresh icon in header |

#### Data Flow
```
page.tsx useEffect → GET /api/weather → returns:
{
  location: { name, municipality, province, lat, lon },
  current: { temperature, feelsLike, humidity, pressure, windSpeed, windDirection, rainfall1h, condition, description, icon, visibility },
  pagasa: { synopsis, forecast[], windConditions[] },
  risk: { level, riskScore, reasons[] },
  fetchedAt: ISO string,
  errors: string[]
}
```

---

### 3.2 Officials Dashboard — `/admin`

**Route:** `/admin`
**File:** `src/app/admin/page.tsx`
**Client Component:** No (static placeholder)

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ [Sidebar] │ [DashboardHeader]           │
│           │─────────────────────────────│
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │  Heading + Description  │  │
│           │ └─────────────────────────┘  │
│           │                              │
│           │ ┌───────────┬──────────────┐ │
│           │ │ Feature 1 │ Feature 2    │ │
│           │ │(Weather   │(Flood        │ │
│           │ │ History)  │ Analytics)   │ │
│           │ └───────────┴──────────────┘ │
│           │ ┌───────────┬──────────────┐ │
│           │ │ Feature 3 │ Feature 4    │ │
│           │ │(Push      │(Community    │ │
│           │ │ Notif.)   │ Reports)     │ │
│           │ └───────────┴──────────────┘ │
└─────────────────────────────────────────┘
```

#### Content
- **Heading:** "Officials Dashboard"
- **Description:** "Tools for barangay officials to monitor weather patterns, manage alerts, and coordinate emergency response."
- **4 Feature Cards (placeholder, not functional yet):**
  1. Weather History — "Track historical weather data and identify patterns" — icon: `BarChart3`
  2. Flood Analytics — "Analyze flood risk trends and generate reports" — icon: `TrendingUp`
  3. Push Notifications — "Manage emergency alert subscriptions" — icon: `Bell`
  4. Community Reports — "View and manage community-submitted reports" — icon: `Users`
- Each card has: icon in teal circle, title, description, "Coming Soon" badge

---

### 3.3 Evacuation Centers — `/evacuation`

**Route:** `/evacuation`
**File:** `src/app/evacuation/page.tsx`
**Client Component:** No (static)

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ [Sidebar] │ [DashboardHeader]           │
│           │─────────────────────────────│
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │  Heading + Description  │  │
│           │ └─────────────────────────┘  │
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │  Evacuation Centers     │  │
│           │ │  (4 cards, 2-col grid)  │  │
│           │ │  • Name, Address        │  │
│           │ │  • Lat/Lon              │  │
│           │ │  • "Get Directions"     │  │
│           │ └─────────────────────────┘  │
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │  Emergency Contacts     │  │
│           │ │  (5 contacts)           │  │
│           │ └─────────────────────────┘  │
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │  Safety Guide           │  │
│           │ │  • Before/During/After  │  │
│           │ └─────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Evacuation Center Card
Each card shows:
- Center name (bold)
- Address (gray text)
- Coordinates (small, muted)
- "Get Directions" link → opens Google Maps with lat/lon

#### Emergency Contacts
Same component as dashboard (`EmergencyContacts`), showing:
- Liloan DRRMO: (032) 273-4321
- Cebu Provincial DRRMO: (032) 253-4891
- Bureau of Fire Protection - Liloan: (032) 273-0000
- Philippine Red Cross - Cebu: (032) 255-7018
- NDRRMC Hotline: 911

Each is a clickable `tel:` link.

#### Safety Guide
Three expandable sections:
1. **Before a Flood** — evacuation plan, emergency kit, stay informed, secure home
2. **During a Flood** — move to higher ground, don't walk/drive through floodwater, avoid downed wires
3. **After a Flood** — wait for all-clear, document damage, boil water, watch for hazards

---

### 3.4 Flood Map — `/map`

**Route:** `/map`
**File:** `src/app/map/page.tsx`
**Client Component:** Yes (`"use client"`)
**Library:** Leaflet (react-leaflet)

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ [Sidebar] │ [DashboardHeader]           │
│           │─────────────────────────────│
│           │                              │
│           │ ┌─────────────────────────┐  │
│           │ │   Map Placeholder       │  │
│           │ │   (full width/height)   │  │
│           │ │                         │  │
│           │ │  "Map Integration       │  │
│           │ │   Coming Soon"          │  │
│           │ │                         │  │
│           │ │  Centered: Cotcot icon  │  │
│           │ │  + description text     │  │
│           │ └─────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Planned Map Features (not yet implemented)
- Leaflet map centered on Cotcot (10.3000, 123.9833)
- OpenStreetMap tiles
- Barangay boundary polygon
- Flood-prone area markers (red zones)
- Evacuation center markers (green)
- Real-time weather overlay

---

## 4. Components — Full Spec

### 4.1 DashboardSidebar

**File:** `src/components/DashboardSidebar.tsx`
**Props:** None (manages own state)

#### Behavior
- Collapsed by default on desktop (72px width), expanded on hover or toggle (240px)
- On mobile: renders as a top bar (not a sidebar) with hamburger menu
- State: `isCollapsed` (boolean), `isMobileMenuOpen` (boolean)

#### Desktop Expanded
```
┌──────────────┐
│ 🌊 Cotcot   │  ← brand name + wave icon, teal-deep bg
│ Flood Alert  │
│──────────────│
│ 🏠 Dashboard │  ← active: bg-teal/10, text-teal, left border accent
│ 📊 Officials │
│ 🏫 Evacuation│
│ 🗺️ Map       │
│──────────────│
│ [collapse ←] │  ← toggle button
└──────────────┘
```

#### Desktop Collapsed
```
┌──────┐
│ 🌊   │  ← brand icon only
│──────│
│ 🏠   │  ← icons only, tooltip on hover
│ 📊   │
│ 🏫   │
│ 🗺️   │
│──────│
│ [→]  │  ← expand button
└──────┘
```

#### Mobile Top Bar
```
┌────────────────────────────────────┐
│ ☰  🌊 Cotcot Flood Alert    🔔   │
└────────────────────────────────────┘
```
- Hamburger toggles slide-down nav overlay
- Bell icon for notifications

#### Nav Items
| Label | Icon | Route |
|---|---|---|
| Dashboard | `Home` | `/` |
| Officials Dashboard | `BarChart3` | `/admin` |
| Evacuation Centers | `School` | `/evacuation` |
| Flood Map | `Map` | `/map` |

#### Transitions
- Width: `transition-all duration-300 ease-in-out`
- Mobile menu: slide-down with `animate-in`

---

### 4.2 DashboardHeader

**File:** `src/components/DashboardHeader.tsx`
**Props:** None (receives data from parent via context or props — currently inline)

#### Layout
```
┌──────────────────────────────────────────────────┐
│ 📍 Brgy. Cotcot, Liloan   Updated 2:30 PM  🔄 🔔│
└──────────────────────────────────────────────────┘
```

#### Elements
1. **Location badge** — `MapPin` icon + "Brgy. Cotcot, Liloan" text
2. **Timestamp** — "Updated " + formatted time (en-PH, Asia/Manila timezone)
3. **Refresh button** — `RefreshCw` icon, spins while loading, triggers `onRefresh` callback
4. **Notification bell** — `Bell` icon, placeholder

---

### 4.3 FloodRiskCard

**File:** `src/components/FloodRiskCard.tsx`
**Props:**
```typescript
{
  level: "safe" | "watch" | "warning" | "danger";
  riskScore: number;        // 0-100
  reasons: string[];        // assessment reasons
  rainfall?: number;        // mm/hr
  windSpeed?: number;       // km/h
}
```

#### Layout
```
┌─────────────────────────────────────────┐
│  ⚠️ Flood Risk Assessment               │
│─────────────────────────────────────────│
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🟡 WATCH                         │  │
│  │                                   │  │
│  │  Risk Score: ████████░░░░ 45/100  │  │
│  │                                   │  │
│  │  ┌─────────┐  ┌───────────────┐  │  │
│  │  │🌧 12mm/h│  │💨 25 km/h     │  │  │
│  │  └─────────┘  └───────────────┘  │  │
│  │                                   │  │
│  │  Assessment:                      │  │
│  │  • Moderate rainfall: 12.0 mm/hr  │  │
│  │  • High cumulative rainfall (6h)  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Risk Score Bar Color
| Score | Color |
|---|---|
| 0–19 | `safe` (green) |
| 20–39 | `watch` (yellow) |
| 40–59 | `warning` (orange) |
| 60–100 | `danger` (red) |

#### Empty State (no data)
```
┌─────────────────────────────────────────┐
│  ⚠️ Flood Risk Assessment               │
│─────────────────────────────────────────│
│  No data available                      │
│  Weather data is not currently          │
│  available. Check back later.           │
└─────────────────────────────────────────┘
```

---

### 4.4 WeatherHeroCard

**File:** `src/components/WeatherHeroCard.tsx`
**Props:**
```typescript
{
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainfall: number;
}
```

#### Layout
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │  (teal gradient background)       │  │
│  │                                   │  │
│  │  ⛅  28°C                        │  │
│  │     Partly Cloudy                 │  │
│  │     Feels like 31°C               │  │
│  │                                   │  │
│  │  ┌──────┐┌──────┐┌──────┐       │  │
│  │  │💧 78%││💨 12 ││🌧 0.5│       │  │
│  │  │Humid.││km/h  ││mm/hr │       │  │
│  │  └──────┘└──────┘└──────┘       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### Background
- Gradient from `teal-deep` to `teal` (diagonal)
- White text

#### Weather Emoji Mapping (from icon code)
| Icon starts with | Emoji |
|---|---|
| `01` | ☀️ |
| `02` | ⛅ |
| `03` or `04` | ☁️ |
| `09` or `10` | 🌧️ |
| `11` | ⛈️ |
| `13` | ❄️ |
| `50` | 🌫️ |

---

### 4.5 ConditionCard

**File:** `src/components/ConditionCard.tsx`
**Props:**
```typescript
{
  icon: LucideIcon;        // any lucide-react icon component
  label: string;           // e.g. "Humidity"
  value: string;           // e.g. "78%"
  status: "good" | "moderate" | "poor";
  trend?: "up" | "down" | "stable";
}
```

#### Layout
```
┌─────────────────┐
│  💧             │  ← icon in teal-light circle
│  78%            │  ← value (large, bold)
│  Humidity       │  ← label (small, muted)
│  [Moderate]     │  ← status badge (colored pill)
│  ↑              │  ← trend arrow (optional)
└─────────────────┘
```

#### Status Badge Colors
| Status | Background | Text |
|---|---|---|
| good | `bg-teal-light` | `text-teal-deep` |
| moderate | `bg-watch-bg` | `text-watch` |
| poor | `bg-danger-bg` | `text-danger` |

---

### 4.6 ForecastStrip

**File:** `src/components/ForecastStrip.tsx`
**Props:**
```typescript
{
  forecasts: Array<{
    time: string;           // "3 PM", "6 PM", etc.
    temperature: number;
    condition: string;
    icon: string;
    rainfall: number;
  }>;
}
```

#### Layout
```
┌──────────────────────────────────────────────────────────┐
│  24-Hour Forecast                                        │
│──────────────────────────────────────────────────────────│
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐→     │
│  │ 3 PM ││ 6 PM ││ 9 PM ││12 AM ││ 3 AM ││ 6 AM │ ...  │
│  │ ⛅   ││ 🌧️   ││ 🌧️   ││ ☁️   ││ ☁️   ││ ⛅   │      │
│  │ 28°  ││ 26°  ││ 24°  ││ 23°  ││ 22°  ││ 24°  │      │
│  │ 0mm  ││ 2mm  ││ 5mm  ││ 1mm  ││ 0mm  ││ 0mm  │      │
│  └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘      │
└──────────────────────────────────────────────────────────┘
```

#### Behavior
- Horizontal scroll on mobile (`overflow-x-auto`)
- Snap scrolling (`scroll-snap-type: x mandatory`)
- Each card: min-width 80px, `scroll-snap-align: start`
- Rainfall > 0: show blue rain indicator bar at bottom of card

---

### 4.7 AlertBanner

**File:** `src/components/AlertBanner.tsx`
**Props:**
```typescript
{
  level: "info" | "watch" | "warning" | "danger";
  title: string;
  message: string;
  timestamp?: string;
  dismissible?: boolean;    // default: true
}
```

#### Layout
```
┌──────────────────────────────────────────────────┐
│  ⚠️  [Title]                              [✕]   │
│      [Message text]                               │
│      Updated 2:30 PM                              │
└──────────────────────────────────────────────────┘
```

#### Style by Level
| Level | Background | Border | Icon Color |
|---|---|---|---|
| info | `bg-teal-light` | `border-teal/20` | `text-teal` |
| watch | `bg-watch-bg` | `border-watch/20` | `text-watch` |
| warning | `bg-warning-bg` | `border-warning/20` | `text-warning` |
| danger | `bg-danger-bg` | `border-danger/20` | `text-danger` |

#### Behavior
- Dismissible: clicking ✕ sets `dismissed = true`, returns `null`
- Animate in: `animate-fade-in`

---

### 4.8 PagasaInfo

**File:** `src/components/PagasaInfo.tsx`
**Props:**
```typescript
{
  synopsis: string;
  forecast: Array<{
    place: string;
    condition: string;
    causedBy: string;
    impacts: string;
  }>;
}
```

#### Layout
```
┌─────────────────────────────────────────┐
│  ☁️ PAGASA Advisory                     │
│  Philippine Atmospheric, Geophysical... │
│─────────────────────────────────────────│
│  SYNOPSIS                               │
│  (light aqua-bg background)             │
│  [Synopsis text paragraph]              │
│                                         │
│  FORECAST                               │
│  • Visayas — Cloudy with rain           │
│    ⚠️ Possible flooding in low-lying    │
│  • Cebu — Thunderstorms                │
│    ⚠️ Heavy rainfall expected           │
└─────────────────────────────────────────┘
```

#### Empty State
When no Visayas-specific forecast:
```
No specific advisory for Visayas region right now.
```

---

### 4.9 EmergencyContacts

**File:** `src/components/EmergencyContacts.tsx`
**Props:** None (uses `EMERGENCY_CONTACTS` from constants)

#### Layout
```
┌─────────────────────────────────────────┐
│  📞 Emergency Contacts    Evacuation →  │
│─────────────────────────────────────────│
│  ┌──────────────────┐ ┌──────────────┐ │
│  │ 📞 Liloan DRRMO  │ │ 📞 Cebu      │ │
│  │    (032) 273-...  │ │    (032) 253-│ │
│  └──────────────────┘ └──────────────┘ │
│  ┌──────────────────┐ ┌──────────────┐ │
│  │ 📞 BFP Liloan    │ │ 📞 Red Cross │ │
│  │    (032) 273-...  │ │    (032) 255-│ │
│  └──────────────────┘ └──────────────┘ │
│  ┌──────────────────┐                  │
│  │ 📞 NDRRMC 911    │                  │
│  └──────────────────┘                  │
└─────────────────────────────────────────┘
```

#### Behavior
- Grid: `sm:grid-cols-2` (1 col on mobile, 2 on desktop)
- Each contact is a `tel:` link
- Hover: background transitions from `aqua-bg/60` to `teal-light`
- "Evacuation Centers" link in header → navigates to `/evacuation`

---

## 5. API Routes

### 5.1 GET `/api/weather`

**File:** `src/app/api/weather/route.ts`
**Auth:** None
**Response:**
```json
{
  "location": {
    "name": "Barangay Cotcot",
    "municipality": "Liloan",
    "province": "Cebu",
    "lat": 10.3,
    "lon": 123.9833
  },
  "current": {
    "temperature": 28.5,
    "feelsLike": 31.2,
    "humidity": 78,
    "pressure": 1012,
    "windSpeed": 12.3,
    "windDirection": 180,
    "rainfall1h": 2.5,
    "condition": "Rain",
    "description": "light rain",
    "icon": "10d",
    "visibility": 8000
  },
  "pagasa": {
    "synopsis": "...",
    "forecast": [...],
    "windConditions": [...]
  },
  "risk": {
    "level": "watch",
    "riskScore": 35,
    "reasons": ["Moderate rainfall: 2.5 mm/hr"]
  },
  "fetchedAt": "2026-09-04T06:30:00.000Z",
  "errors": []
}
```

**Behavior:**
- Fetches OpenWeatherMap current weather
- Scrapes PAGASA Visayas page
- Calculates flood risk via `calculateFloodRisk()`
- Gracefully handles individual source failures (adds to `errors[]`)

---

### 5.2 GET `/api/weather/history`

**File:** `src/app/api/weather/history/route.ts`
**Auth:** None
**Query Params:** `hours` (default: 24)
**Response:**
```json
{
  "readings": [...],
  "count": 48,
  "period": "Last 24 hours"
}
```
**Note:** Requires Supabase to be configured. Returns empty array if not.

---

### 5.3 GET `/api/cron/fetch-weather`

**File:** `src/app/api/cron/fetch-weather/route.ts`
**Auth:** Bearer token via `CRON_SECRET` env var
**Purpose:** Periodic job to store weather data in Supabase
**Response:**
```json
{
  "success": true,
  "results": {
    "openWeather": true,
    "pagasa": true,
    "stored": true,
    "errors": []
  },
  "timestamp": "2026-09-04T06:30:00.000Z"
}
```

---

## 6. Data Models

### WeatherReading (Supabase)
```typescript
{
  id: string;
  source: "pagasa" | "openweather";
  timestamp: string;
  temperature: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  wind_direction: string;
  pressure_hpa: number;
  condition: string;
  lat: number;
  lon: number;
}
```

### FloodIncident (Supabase)
```typescript
{
  id: string;
  timestamp: string;
  location: string;
  lat: number;
  lon: number;
  water_level_cm: number | null;
  description: string;
  reported_by: string;
  verified: boolean;
  severity: "low" | "moderate" | "high" | "critical";
}
```

### Flood Risk Calculation (alerts.ts)
```
Score 0-100, weighted:
- Rainfall 1h: 0–40 pts (light/moderate/heavy/intense/torrential)
- Cumulative 6h: 0–25 pts (watch/warning/danger thresholds)
- Cumulative 24h: 0–20 pts (100mm/150mm thresholds)
- Wind speed: 0–15 pts (strong/gale/storm-force)
- Humidity: 0–5 pts (≥95%)

Level mapping:
- 0–19: safe (green)
- 20–39: watch (yellow)
- 40–59: warning (orange)
- 60–100: danger (red)
```

---

## 7. Constants & Static Data

### Location
- **Barangay:** Cotcot, Liloan, Cebu
- **Coordinates:** lat 10.3000, lon 123.9833
- **PAGASA Region:** Visayas

### Evacuation Centers
| Name | Address | Coordinates |
|---|---|---|
| Cotcot Barangay Hall | Brgy. Cotcot, Liloan, Cebu | 10.3010, 123.9840 |
| Cotcot Elementary School | Purok Masagana, Cotcot | 10.2990, 123.9820 |
| Liloan Municipal Gymnasium | Poblacion, Liloan | 10.3167, 123.9667 |
| Sacred Heart School - Cotcot | Cotcot, Liloan | 10.3005, 123.9835 |

### Emergency Contacts
| Name | Number |
|---|---|
| Liloan DRRMO | (032) 273-4321 |
| Cebu Provincial DRRMO | (032) 253-4891 |
| Bureau of Fire Protection - Liloan | (032) 273-0000 |
| Philippine Red Cross - Cebu | (032) 255-7018 |
| NDRRMC Hotline | 911 |

### Flood Thresholds
| Metric | Light | Moderate | Heavy | Intense | Torrential |
|---|---|---|---|---|---|
| Rainfall (mm/hr) | 1 | 7.5 | 15 | 30 | 50 |

| Metric | Watch | Warning | Danger |
|---|---|---|---|
| Cumulative 6h (mm) | 30 | 60 | 100 |

| Metric | Strong | Gale | Storm Force |
|---|---|---|---|
| Wind (km/h) | 39 | 62 | 88 |

---

## 8. Navigation Map

```
/ (Dashboard)          ← main page, live weather + flood risk
/admin                 ← officials dashboard (placeholder)
/evacuation            ← evacuation centers + contacts + safety guide
/map                   ← flood map (placeholder)
```

### Sidebar Nav Order
1. Dashboard (`/`)
2. Officials Dashboard (`/admin`)
3. Evacuation Centers (`/evacuation`)
4. Flood Map (`/map`)

---

## 9. Responsive Behavior

| Breakpoint | Sidebar | Grid | Cards |
|---|---|---|---|
| < 640px (mobile) | Top bar + hamburger | 1 column | Full width |
| 640–1024px (tablet) | Collapsible sidebar | 2 columns | Half width |
| > 1024px (desktop) | Persistent sidebar | 2 columns | Half width |

### Mobile-Specific
- Sidebar becomes top bar with hamburger
- ForecastStrip scrolls horizontally
- ConditionCards stack vertically (1 col)
- FloodRiskCard + WeatherHeroCard stack vertically
- PagasaInfo + EmergencyContacts stack vertically
- Evacuation centers: 1 column

### Desktop-Specific
- Sidebar: 240px expanded, 72px collapsed
- Dashboard header is sticky at top
- ConditionCards: 3 columns in a row
- PagasaInfo + EmergencyContacts: side by side

---

## 10. Icon Inventory

All icons from `lucide-react`:

| Component | Icons Used |
|---|---|
| DashboardSidebar | `Home`, `BarChart3`, `School`, `Map`, `ChevronLeft`, `ChevronRight`, `Menu`, `X`, `Bell`, `Waves` |
| DashboardHeader | `MapPin`, `RefreshCw`, `Bell` |
| FloodRiskCard | `AlertTriangle`, `CloudRain`, `Wind`, `Info` |
| WeatherHeroCard | (none — uses weather emoji) |
| ConditionCard | (dynamic — passed as prop) |
| ForecastStrip | (none — uses weather emoji) |
| AlertBanner | `AlertTriangle`, `Info`, `X` |
| PagasaInfo | `Cloud`, `AlertTriangle` |
| EmergencyContacts | `Phone`, `ExternalLink` |

---

## 11. CSS Classes & Tokens (globals.css)

### Card System
```css
.card {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

### Animations
```css
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
```

### Sidebar Classes
```css
.sidebar-expanded { width: 240px; }
.sidebar-collapsed { width: 72px; }
.sidebar-transition { transition: width 300ms ease-in-out; }
.sidebar-nav-item { padding, border-radius, hover, active states }
```

---

## 12. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `CRON_SECRET` | No | Auth token for cron endpoint |

---

## 13. Tech Stack Summary

| Library | Version | Purpose |
|---|---|---|
| Next.js | 16.3.4 | Framework |
| React | 19.2.8 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| lucide-react | ^1.41.0 | Icons |
| @supabase/supabase-js | ^2.115.0 | Database client |
| cheerio | ^1.2.0 | HTML scraping (PAGASA) |
| leaflet | ^1.9.4 | Maps |
| react-leaflet | ^5.0.0 | React Leaflet bindings |
| recharts | ^3.10.1 | Charts (for future analytics) |
| web-push | ^3.6.7 | Push notifications (for future) |
| date-fns | ^4.4.0 | Date formatting |
