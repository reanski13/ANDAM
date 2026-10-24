# ANDAM - Project Overview

ANDAM, from the Bisaya word for "ready," is a flood monitoring and disaster risk reduction platform for Barangay Cotcot, Liloan, Cebu, Philippines.

This is the engineering source of truth for the application. Read it with `DESIGN.md` before changing the app. `UI_STRUCTURE.md` is a legacy archive only.

## Product Scope

- Public dashboard with live OpenWeather conditions, forecast, PAGASA advisory, weather-based assessment, and rainfall history.
- Flood map with hardcoded hazard zones, simulated river sensors, and evacuation-center markers.
- Evacuation and safety hub with verified local context and direct emergency hotlines.
- Supabase-authenticated officials dashboard. Several official modules remain roadmap/demo UI.

The River Alert Status card is a prototype. Its score is weather-based; Water Level and Rate of Rise are deliberately unavailable until real river sensors are connected.

## Stack

| Concern | Technology |
| --- | --- |
| Framework | Next.js 16.3.4 App Router, React 19.2.8, TypeScript 5 |
| Styling | Tailwind CSS v4, Smart Sky design system |
| Motion | `motion` 13.2.0 |
| Weather | OpenWeatherMap current and forecast APIs |
| Advisory | PAGASA HTML scrape through Cheerio |
| Maps | Leaflet and OpenStreetMap |
| Data and auth | Supabase Postgres and Supabase Auth |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Dashboard shell with independently loaded data sections |
| `/map` | Flood map and evacuation information |
| `/evacuation` | Shelters, hotlines, and flood-safety guidance |
| `/admin` | Officials dashboard, server-side role guarded |
| `/admin/login` | Official sign-in and access-request mailto flow |
| `/api/weather` | Legacy aggregate weather endpoint retained for compatibility |
| `/api/weather/current` | Current OpenWeather conditions |
| `/api/weather/risk` | Weather-based assessment and Supabase rainfall rollups |
| `/api/weather/forecast` | OpenWeather 24-hour forecast in 3-hour intervals |
| `/api/weather/pagasa` | PAGASA Visayas advisory scrape |
| `/api/weather/history?hours=` | Stored Supabase weather readings |
| `/api/cron/fetch-weather` | Authorized scheduled ingestion and rollups |

## Dashboard Data Flow

`src/app/page.tsx` renders `DashboardShell`. The client requests current weather, risk, forecast, and PAGASA independently through `useDashboardResource`. `RainfallTrend` independently requests history.

Each source has its own loading, ready, and unavailable UI. A slow PAGASA scrape must not block current weather or forecast. The browser refreshes resources every 10 minutes and the header refresh triggers all dashboard resources.

### Providers

- `src/lib/openweather.ts` calls OpenWeather current weather and forecast endpoints. Both use a 4-second timeout and require `OPENWEATHER_API_KEY`.
- `src/lib/pagasa-scraper.ts` downloads PAGASA weather HTML, parses the synopsis and forecast tables with Cheerio, and uses an 8-second timeout. It needs no API key but can change when PAGASA changes its page structure.
- `src/lib/dashboard/current-cache.ts` deduplicates current-weather reads for 60 seconds within a server instance.

### Assessment

`src/lib/alerts.ts` calculates a 0-100 weather-risk score from 1-hour rain, 6-hour and 24-hour rain rollups, wind, and humidity. Thresholds map to `safe`, `watch`, `warning`, and `danger`.

This assessment is not a measured river level and must not be described as verified river telemetry.

## Supabase

Schema migrations live in `supabase/migrations/`. Apply them with the Supabase CLI for local or hosted development.

| Data | Use |
| --- | --- |
| `weather_readings` | Individual OpenWeather/PAGASA observations |
| `weather_hourly` | Hourly rainfall rollups for assessment and trend context |
| `flood_incidents` | Typed future incident data |

`src/lib/db/weather.ts` writes readings and builds hourly rollups. Because OpenWeather's `rain.1h` values overlap, the rollup uses the maximum observation inside an hour instead of summing all samples.

## Cron Ingestion

`vercel.json` schedules `/api/cron/fetch-weather` at `0 8 * * *`: daily at 08:00 UTC, roughly 16:00 Philippines time.

The route requires `Authorization: Bearer <CRON_SECRET>`. It fetches OpenWeather and PAGASA, inserts readings with the Supabase service-role client, then rebuilds recent hourly buckets. If `CRON_SECRET` is absent or invalid, it returns `401`; authorization is never skipped.

The current daily schedule creates sparse history. Review Vercel plan limits before increasing cadence.

## Auth And Roles

- Browser auth uses `src/lib/supabase/browser.ts`.
- Server auth uses `src/lib/supabase/server.ts`.
- `/admin` requires `app_metadata.is_official === true`.
- Create users in Supabase Authentication, then use `supabase/auth-setup.sql` as a template to assign official access.
- There is no session-refresh middleware. The `/admin` server component is the access guard.

## Environment

Copy `.env.local.example` to `.env.local`; never commit the filled file.

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `OPENWEATHER_API_KEY` | Server-only | Current weather and forecast |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Auth and database reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Cron writes and hourly rollups |
| `CRON_SECRET` | Server-only | Cron endpoint authorization |

## Development

Run commands from the repository root:

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Lint has two known Next.js Google-font warnings in `src/app/layout.tsx`; there should be no errors.

## Engineering Rules

- Preserve working provider, auth, risk, map, and evacuation behavior unless a change is explicitly requested.
- Keep the Smart Sky UI system and calm, reduced-motion-aware interaction design.
- Use semantic `safe`, `watch`, `warning`, and `danger` status colors with visible indicators.
- Never expose or commit `.env*` values.
- Keep the Google Stitch exports under `stitch_cotcot_flood_alert_redesign/` as reference-only assets.
