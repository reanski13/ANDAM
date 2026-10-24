# ANDAM

ANDAM, from the Bisaya word for "ready," is a flood monitoring and disaster risk reduction platform for Barangay Cotcot, Liloan, Cebu, Philippines. It helps residents and local officials review live weather, PAGASA advisories, evacuation information, and a weather-based flood-risk prototype.

> This community pilot supports preparedness. It does not replace official warnings from PAGASA, Liloan DRRMO, NDRRMC, or emergency services. In an emergency, call 911.

## What Is Included

- Live OpenWeather conditions and a 24-hour forecast in 3-hour intervals.
- PAGASA Visayas advisory scraping with a source-specific fallback state.
- A weather-based `safe` / `watch` / `warning` / `danger` assessment. It is not verified river telemetry.
- Interactive flood map, evacuation directory, safety guidance, and officials dashboard.
- Supabase-backed weather history and hourly rainfall rollups.
- A non-blocking dashboard: each data source loads, refreshes, and fails independently.

## Requirements

- Node.js 20 or later.
- npm.
- An OpenWeatherMap API key.
- A Supabase project for auth and weather history.
- Optional for scheduled ingestion: a Vercel project or another scheduler.

## Clone And Run

Clone the default `main` branch into a new directory. The cloned directory itself is the application root.

```bash
git clone --branch main --single-branch https://github.com/reanski13/ANDAM.git
cd ANDAM
npm ci
```

Create your local environment file from the committed template.

```bash
cp .env.local.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.local.example .env.local
```

Fill `.env.local` with your own values. Never commit it or paste values into issues, pull requests, or chat.

```env
OPENWEATHER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `OPENWEATHER_API_KEY` | Current weather, forecast, weather-based assessment | Server-only |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth and weather-history reads | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth and weather-history reads | Public anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Scheduled ingestion and hourly rollups | Server-only. Never expose it to the browser. |
| `CRON_SECRET` | `/api/cron/fetch-weather` authorization | Server-only bearer secret |

## Supabase Setup

The schema is versioned in `supabase/migrations/`.

### Hosted Supabase

1. Create or select a Supabase project.
2. Set the URL, anon key, and service-role key in `.env.local` and your deployment environment.
3. Authenticate the CLI and link the project:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. Enable Email/Password auth and create official accounts in Supabase Authentication.
5. Use `supabase/auth-setup.sql` as a template: replace its example emails with real accounts, then run it in the Supabase SQL editor.

### Local Supabase

With Docker and the Supabase CLI installed:

```bash
npx supabase start
npx supabase db reset
```

The committed migrations create the local schema. No seed file is required.

## Data Flow

The dashboard renders its structure immediately, then the browser independently requests:

```text
/api/weather/current   OpenWeather current observation
/api/weather/risk      weather-based assessment + stored rainfall rollups
/api/weather/forecast  OpenWeather forecast
/api/weather/pagasa    PAGASA Visayas advisory scrape
/api/weather/history   Supabase weather-reading history
```

Live weather and forecasts do not require Supabase. Rainfall Trend requires stored readings. The River Alert Status card remains a prototype: its water-level and rate-of-rise values stay unavailable until real sensors are connected.

## Scheduled Ingestion

`vercel.json` schedules `GET /api/cron/fetch-weather` daily at `08:00 UTC` (about `16:00` in the Philippines).

The endpoint requires:

```text
Authorization: Bearer <CRON_SECRET>
```

It fetches current OpenWeather and PAGASA data, writes readings to Supabase, and updates hourly rollups. Vercel Cron uses the `CRON_SECRET` configured for the project. Another scheduler must send the authorization header itself.

The current daily schedule creates sparse rainfall history. Choose a more frequent schedule only after confirming your Vercel plan and data-retention needs.

## Quality Checks

```bash
npm run lint
npm run build
```

The current lint baseline has two Next.js font warnings in `src/app/layout.tsx`; there should be no lint errors.

## Project Status

- Live provider availability depends on configured credentials and upstream services.
- Map river sensors are simulated; River Alert is a weather-based prototype.
- Several Officials dashboard modules are intentionally marked Coming Soon.
- The manifest icons are present, but the project does not yet ship a service worker, so it is not an offline PWA.

## Contributing And Security

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and [SECURITY.md](SECURITY.md) for responsible reporting. The project is currently unlicensed; do not assume reuse rights.
