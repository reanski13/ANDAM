# Cotcot Flood Alert — Project Overview

The source of truth for this codebase. Read this and `DESIGN.md` before touching anything.

> **Note on other docs:** `README.md` and `UI_STRUCTURE.md` are stale. `UI_STRUCTURE.md` describes the original pre-redesign UI (sidebar nav, teal palette, placeholder map/admin) and is kept for reference only. This file + `DESIGN.md` are authoritative.

## 1. What this is

A real-time **flood early-warning system and emergencies command center** for **Barangay Cotcot, Liloan, Cebu** (10.3° N, 123.9833° E). It combines:

- A public **dashboard** with live weather, PAGASA advisories, and an automated flood-risk score.
- An interactive **flood map** (Leaflet/OSM) with hazard zones, simulated river-level sensors, and evacuation centers.
- An **evacuation directory + flood safety guide** with one-tap emergency hotlines.
- An **Officials command dashboard** (`/admin`) behind Supabase auth with DRRMO-style modules (several marked "Coming Soon").

**Status:** UI-complete pilot. Live weather/auth are partial — `.env.local` has placeholder keys, so the app runs but some data paths are stubbed. Admin cards are demo UI with a roadmap, not wired to backend features yet.

## 2. Stack (exact versions)

| Concern | Choice |
| --- | --- |
| Framework | Next.js **16.3.4** (App Router, Turbopack) |
| UI | React **19.2.8**, TypeScript **5**, Tailwind CSS **v4** (`@tailwindcss/postcss`) |
| Motion | `motion` (**Framer Motion**) **13.2.0** |
| Maps | Leaflet **1.9.4** + react-leaflet **5** (map page uses Leaflet directly via dynamic import) |
| DB / Auth | Supabase (`@supabase/ssr` 0.12.6, `@supabase/supabase-js` 2.115) |
| Scraping | cheerio **1.2** (PAGASA) |
| Icons | lucide-react + Google Material Symbols |
| Misc | recharts (future charts), web-push (future push/SMS), date-fns |

## 3. Routes & rendering

| Route | File | Mode | Notes |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | `○` static (client logic) | Dashboard; fetches `/api/weather` on mount + every 10 min |
| `/map` | `src/app/map/page.tsx` | `○` static (client logic) | Leaflet flood/GIS map |
| `/evacuation` | `src/app/evacuation/page.tsx` | `○` static (client logic) | Evacuation centers, contacts, safety guide |
| `/admin` | `src/app/admin/page.tsx` | `ƒ` dynamic | Server component; guarded — redirects to `/admin/login` unless official |
| `/admin/login` | `src/app/admin/login/page.tsx` | `○` static | Supabase sign-in + access-request (mailto) |
| `/api/weather` | `src/app/api/weather/route.ts` | `ƒ` | OWM current + PAGASA scrape + flood risk |
| `/api/weather/history` | `src/app/api/weather/history/route.ts` | `ƒ` | Weather readings from Supabase (`?hours=`) |
| `/api/cron/fetch-weather` | `src/app/api/cron/fetch-weather/route.ts` | `ƒ` | Stores readings; requires `Bearer CRON_SECRET` |

Rendering was verified via `npm run build`: all routes compile; `/admin` and the `/api/*` routes are dynamic.

## 4. Data flow

- **Dashboard:** `page.tsx` → `GET /api/weather` → `getCurrentWeather()` (OpenWeatherMap, metric) + `scrapePagasaVisayas()` (cheerio) → `calculateFloodRisk()` (weighted score 0–100 → `safe / watch / warning / danger`) → JSON with `{ current, pagasa, risk, fetchedAt, errors }`. Sources fail independently and are reported in `errors[]`.
- **History:** `/api/weather/history?hours=24` → `getWeatherReadingsSince()`.
- **Cron:** `GET /api/cron/fetch-weather` guarded by `Authorization: Bearer $CRON_SECRET` (guard is skipped if `CRON_SECRET` is unset). It pulls OWM + PAGASA and `insertWeatherReading()` into Supabase. Wire this to Vercel Cron (or any scheduler).
- **Flood risk** (`src/lib/alerts.ts`): rainfall 1h (0–40) + cumulative 6h (0–25) + 24h (0–20) + wind (0–15) + humidity (0–5); `20/40/60` boundary → watch/warning/danger.

## 5. Auth & roles

- Supabase Email/Password. `src/lib/supabase/server.ts` reads cookies via `@supabase/ssr`; `src/lib/supabase/browser.ts` for client.
- `/admin` calls `getCurrentUser()` + `isOfficial()` (**`auth.users.raw_app_meta_data.is_official === true`**), else `redirect("/admin/login")`.
- Provisioning: run `supabase/auth-setup.sql` once in the Supabase SQL editor (enables Email/Password, mark accounts official, set display name/role). Requests for access are **not wired to a backend** — the login page composes a `mailto:` to `drrmo@liloan.gov.ph`.
- There is **no middleware**; the guard lives in the `/admin` server component.

## 6. Environment variables

Copy `.env.local.example` → `.env.local`. All currently placeholder-empty.

| Var | Public? | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon key (safe for client) |
| `OPENWEATHER_API_KEY` | no | OpenWeatherMap current/forecast |
| `CRON_SECRET` | no | Bearer token for `/api/cron/fetch-weather` |

**Never commit `.env.local` or print secrets.**

## 7. Data models (Supabase)

`weather_readings` — `{ id, source ("pagasa"|"openweather"), timestamp, temperature, humidity, rainfall_mm, wind_speed_kmh, wind_direction, pressure_hpa, condition, lat, lon }`
`flood_incidents` — `{ id, timestamp, location, lat, lon, water_level_cm, description, reported_by, verified, severity ("low"|"moderate"|"high"|"critical") }`

Types live in `src/lib/supabase.ts`. The SQL to create tables is **not yet committed** (only `auth-setup.sql` exists) — create them from the interfaces above if enabling history/crowdsourcing.

## 8. Folder structure

```
src/
  app/
    layout.tsx            root layout — fonts, theme pre-paint script, Leaflet + Material Symbols CSS, MotionProvider
    page.tsx              dashboard (client)
    globals.css           full design system: tokens, glass, typography utilities, tab bar, sky gradient
    map/page.tsx          flood map (Leaflet)
    evacuation/page.tsx   evac centers + contacts + safety accordion
    admin/page.tsx        officials dashboard (server, guarded)
    admin/login/page.tsx  officials sign-in
    api/weather/route.ts          GET current weather + risk
    api/weather/history/route.ts  GET readings since N hours
    api/cron/fetch-weather/route.ts  store reading (Bearered)
  components/
    DashboardHeader.tsx   station chip, updated/refresh, theme toggle, bell — shared across pages
    TopTabBar.tsx         iOS-style tab bar with sliding pill (layoutId="top-tab-pill")
    AlertBanner / ConditionCard / EmergencyContacts / FloodGauge
    FloodRiskCard / ForecastStrip / LogoutButton / PagasaInfo
    StatusBanner / WeatherCard / WeatherHeroCard
    motion/
      MotionProvider.tsx  reducedMotion="user"
      Reveal / Stagger / StaggerItem / AnimatedNumber
  lib/
    constants.ts          COTCOT geo, thresholds, evacuation centers, emergency contacts
    alerts.ts             calculateFloodRisk (weighted scoring)
    sky.ts                skyFor(icon, description) → data-sky condition
    openweather.ts        OWM current + forecast
    pagasa-scraper.ts     cheerio scrape of PAGASA Visayas
    supabase.ts           client helpers + proxied client singleton
    supabase/server.ts    SSR client, getCurrentUser, isOfficial
    supabase/browser.ts   browser client
    weather-icon.tsx      OWM icon → component
    motion-tokens.ts      EASE/durations/stagger tokens
supabase/auth-setup.sql
public/manifest.json       PWA manifest (needs real icon PNGs — not present)
DESIGN.md                  design system (AUTHORITATIVE)
PROJECT_OVERVIEW.md        this file
AGENTS.md                  agent rules (Next 16 warning block + this doc pointer)
```

## 9. Design system (summary — see DESIGN.md)

- **"Smart Sky"** — one continuous `--sky-top/mid/bottom` gradient behind everything; all surfaces are translucent glass. `data-sky` on the page root shifts the hue by live condition (`clear | clouds | rain | storm | night`).
- **Theme** — `data-theme="dark|light"` on `<html>`, key `cotcot-theme` in localStorage, inline no-flash script in `layout.tsx`, dark is default. Header Sun/Moon toggles.
- **Tokens** in `@theme inline` (Tailwind v4): `--on-sky/-dim/-faint`, `--accent/-strong`, `--glass-card/-elevated/-strong/-border`, semantic `--st-safe/watch/warning/danger` (+ `-fill`). Legacy MD3 aliases remapped.
- **Nav** — `TopTabBar` (no sidebar). Active tab = navy text on a bright frosted pill that **slides** via `layoutId="top-tab-pill"`.
- **Typography** — Geist + Material Symbols, custom utilities (`font-display-lg`, `font-metric-huge`, `font-label-sm`, …).
- **Rules:** mobile-first; accessible (`aria-label` on icon buttons, contrast ≥ 4.5:1); no generic-AI aesthetics; all copy is real Cotcot content.

## 10. Motion system

`motion/react`. Primitives in `src/components/motion/`, tokens in `src/lib/motion-tokens.ts` (`EASE [0.2,0.7,0.2,1]`, `DURATION_BASE 0.45`, `STAGGER_STEP 0.07`, `REVEAL_DISTANCE 14`). Tone is **subtle & calm**: fades/rises 300–600 ms, gauge sweeps ~1 s. `MotionProvider` forces `reducedMotion="user"`. Details in DESIGN.md.

## 11. Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | production build |
| `npm run start` | serve production build |
| `npm run lint` | ESLint (baseline: 2 pre-existing warnings in `src/app/layout.tsx:58` — google-font-display / no-page-custom-font) |

`next dev` auto-manages the warning block in `AGENTS.md` — don't fight it.

## 12. Deployment

- Standard Next.js → **Vercel** recommended. Set the 4 env vars in the project settings.
- **Scheduled ingestion:** Vercel Cron (or any scheduler) calling `/api/cron/fetch-weather` with `Authorization: Bearer <CRON_SECRET>`.
- **PWA:** `public/manifest.json` references `icon-192.png` / `icon-512.png` which **do not exist** — add real icons (or remove the manifest) before treating installability as a feature.
- **Rebranding:** the app name "Cotcot Flood Alert" currently lives in `layout.tsx` metadata, `public/manifest.json`, README, and login page copy (see section 15).

## 13. Known gotchas / stale artifacts

- `README.md` — boilerplate/outdated; now replaced with a real public readme.
- `UI_STRUCTURE.md` — describes the **old** design (sidebar, teal, placeholders). Reference only.
- `stitch_cotcot_flood_alert_redesign/` — raw Google Stitch export of mockup HTML/PNGs per page. **Not part of the app; do not import or edit.**
- Admin module cards (`/admin`) are demo UI: Weather History, Flood Analytics & ML, SMS/Push broadcast, Citizen Reports are rosters/roadmap, not live features.
- `ForecastStrip` currently renders **hardcoded** 5-day demo data (see `page.tsx`); OWM forecast helpers exist but aren't wired in.
- `.env.local` is placeholder-empty — the dashboard shows errors if `OPENWEATHER_API_KEY` is missing.

## 14. Working rules for agents

1. Read `DESIGN.md` + this file first. Never plan UI without DESIGN.md.
2. Follow existing conventions: sky/glass surfaces, top-scrim + `TopTabBar` wrapper on any new page, `motion` primitives for animation, semantic status colors, accessible icon buttons.
3. Run `npm run lint` and `npm run build` after changes; keep lint at 0 errors.
4. Never commit `.env.local`; never echo secret values.
5. Keep motion **subtle & calm**; honor `prefers-reduced-motion`.
6. Trust the code over stale docs. If `UI_STRUCTURE.md` contradicts code, code wins.

## 15. Branding / naming candidates

For a deployable (public) identity. Current working name: **"Cotcot Flood Alert"**. Ideas:

1. **BahaWatch** — Tagalog *baha* (flood) + watch. Clear, instant, PWA-friendly short name. *Check domain/trademark.*
2. **Habagat** — the southwest monsoon that brings flood season. Poetic, unmistakably Filipino. *Check existing brands/apps.*
3. **Daluyan** — Tagalog "waterway / channel." Elegant, brandable.
4. **Subaybay** — Cebuano "to monitor / track." Deeply local to Visayas.
5. **Bantay Baha** — "flood guard." Warm, community-first.
6. **Agos** — Tagalog "current / flow." Modern and minimal.

Recommendation: **BahaWatch** for instant recognition, **Habagat** as the more premium brand word. Before committing: verify `.ph`/`.com` availability, app-store collisions, and update `layout.tsx` metadata + `manifest.json` + login copy.