# Cotcot Flood Alert 🌊

Real-time flood early-warning and emergency-response system for **Barangay Cotcot, Liloan, Cebu, Philippines**.

A mobile-first web app for residents and village officials: live weather conditions, an automated flood-risk assessment, PAGASA-backed advisories, an interactive flood/GIS map, an evacuation-center directory with one-tap emergency hotlines, and a officials-only command dashboard.

## Features

- **Live weather dashboard** — temperature, humidity, wind, barometric pressure, rainfall, visibility from OpenWeatherMap, merged with PAGASA Visayas advisories.
- **Automated flood-risk scoring** — weighted `safe / watch / warning / danger` assessment from rainfall intensity, cumulative rain, wind speed, and humidity (`src/lib/alerts.ts`).
- **Interactive flood map** — Leaflet + OpenStreetMap with flood hazard zones, simulated river-gauge sensors, and evacuation-center markers with toggleable layers.
- **Evacuation & safety hub** — designated shelters with capacity/amenities/elevation, a Before/During/After flood safety guide, and direct `tel:` hotlines (DRRMO, BFP, Red Cross, 911).
- **Officials dashboard** (`/admin`) — Supabase-secured command center with DRRMO modules (some marked *Coming Soon*: weather history, flood analytics/ML, SMS & push broadcast, citizen reports). Access requires an accredited-official account.
- **iOS-style "Smart Sky" design** — continuous sky gradient, frosted glass, light/dark theme, subtle Framer Motion animations that respect `prefers-reduced-motion`.
- **PWA-ready** manifest (add real icons before treating installability as a feature).

## Pages

| Route | Description |
| --- | --- |
| `/` | Dashboard — live weather, flood risk, forecast, PAGASA, emergency contacts |
| `/map` | Interactive flood-risk & GIS evacuation map |
| `/evacuation` | Evacuation centers, dispatch hotlines, flood safety guide |
| `/admin` | Officials command dashboard (guarded) |
| `/admin/login` | Officials sign-in + access request |

## Tech stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4**
- **Framer Motion** (`motion`) for UI animation
- **Leaflet** + OpenStreetMap for the flood map
- **Supabase** (SSR auth + Postgres) for officials access and telemetry history
- **cheerio** for PAGASA bulletins; **OpenWeatherMap** for live conditions

## Getting started

Prerequisites: Node 20+ and an npm-compatible package manager.

```bash
npm install
cp .env.local.example .env.local   # then fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for auth/history | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for auth/history | Supabase anon key |
| `OPENWEATHER_API_KEY` | for live weather | OpenWeatherMap API key |
| `CRON_SECRET` | for scheduled fetch | Bearer token for `/api/cron/fetch-weather` |

### Setting up Officials access (Supabase)

1. In Supabase: enable **Email/Password** auth and create official accounts (Authentication → Users → Add user).
2. Run `supabase/auth-setup.sql` in the SQL editor — it marks the listed accounts as `is_official = true` and sets their display name/role.
3. Sign in at `/admin/login`. Non-officials can send an access request that opens a pre-filled email to `drrmo@liloan.gov.ph`.

### Scheduled telemetry ingestion

Point a cron job (e.g. Vercel Cron) at `/api/cron/fetch-weather` with header `Authorization: Bearer <CRON_SECRET>`. It curates conditions into the `weather_readings` table, readable via `/api/weather/history`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Design

The UI follows a "Smart Sky" design system — one continuous sky gradient, frosted-glass surfaces, and a sliding iOS-style tab bar. Full tokens, rules, and motion guidance live in **`DESIGN.md`**. Architecture and conventions live in **`PROJECT_OVERVIEW.md`** (the source of truth for developers).

## Project structure (highlights)

```
src/
  app/                 layout, pages, and API routes
  components/          UI components (incl. motion/ primitives)
  lib/                 weather, PAGASA scraper, flood risk, sky theme, Supabase
supabase/auth-setup.sql
DESIGN.md              design system
PROJECT_OVERVIEW.md    architecture & conventions
```

## Status & roadmap

Pre-alpha pilot. The public-facing UI is complete; some data paths need live keys; the admin's core modules are implemented as a roadmap:

- [ ] Weather History & Precipitation Logs
- [ ] Flood Analytics & ML forecast
- [ ] Emergency Broadcast & SMS/push subscriptions
- [ ] Citizen crowdsource & field reports
- [ ] Real PWA icons

## Disclaimer

This is a community pilot tool and does **not** replace official warnings from PAGASA, the Liloan DRRMO, or the NDRRMC. In an emergency, call **911**.

## License

Currently unlicensed (internal/local-government pilot). Rebrand and choose a license before public distribution.