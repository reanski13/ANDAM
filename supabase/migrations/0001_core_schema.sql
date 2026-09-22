-- ═════════════════════════════════════════════════════════════════════
-- 0001_core_schema.sql
-- Cotcot Flood Alert / ANDAM — core schema
--
-- Tables, indexes, and Row Level Security.
--
-- Column names on weather_readings / flood_incidents intentionally match
-- the existing TypeScript interfaces in src/lib/supabase.ts so that
-- insertWeatherReading / getWeatherReadingsSince keep working unchanged.
-- ═════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Weather ──────────────────────────────────────────────────────────

create table if not exists weather_readings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('pagasa', 'openweather')),
  timestamp timestamptz not null default now(),
  temperature numeric,
  humidity integer,
  rainfall_mm numeric,
  wind_speed_kmh numeric,
  wind_direction text,
  pressure_hpa numeric,
  condition text,
  lat numeric,
  lon numeric,
  -- additive (unused today; populated by rollups later)
  rain_6h_mm numeric,
  rain_24h_mm numeric,
  wind_direction_deg smallint,
  created_at timestamptz not null default now()
);
create index if not exists weather_readings_timestamp_idx
  on weather_readings (timestamp desc);
create index if not exists weather_readings_source_timestamp_idx
  on weather_readings (source, timestamp desc);

create table if not exists weather_forecasts (
  id uuid primary key default gen_random_uuid(),
  fetched_at timestamptz not null default now(),
  valid_at timestamptz not null,
  temperature numeric,
  humidity integer,
  rain_3h_mm numeric,
  wind_speed_kmh numeric,
  wind_direction_deg smallint,
  condition text,
  icon text,
  source text not null default 'openweather'
);
create index if not exists weather_forecasts_valid_at_idx
  on weather_forecasts (valid_at);

create table if not exists risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  level text not null check (level in ('safe', 'watch', 'warning', 'danger')),
  score integer not null,
  reasons jsonb not null default '[]'::jsonb,
  inputs jsonb not null default '{}'::jsonb,
  reading_id uuid references weather_readings (id) on delete set null
);
create index if not exists risk_snapshots_timestamp_idx
  on risk_snapshots (timestamp desc);

create table if not exists flood_incidents (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  location text,
  lat numeric,
  lon numeric,
  water_level_cm numeric,
  description text,
  reported_by text,
  verified boolean not null default false,
  severity text check (severity in ('low', 'moderate', 'high', 'critical')),
  created_at timestamptz not null default now()
);
create index if not exists flood_incidents_timestamp_idx
  on flood_incidents (timestamp desc);

-- ── Sensors (river / rain gauges) ────────────────────────────────────

create table if not exists sensors (
  id uuid primary key default gen_random_uuid(),
  station_id text,
  name text not null,
  purok text,
  type text not null check (type in ('river_level', 'rain_gauge')),
  lat numeric not null,
  lon numeric not null,
  elevation_m numeric,
  normal_level_m numeric,
  warning_level_m numeric,
  danger_level_m numeric,
  data_source text not null default 'manual'
    check (data_source in ('manual', 'simulated', 'telemetry')),
  is_simulated boolean not null default false,
  status text not null default 'normal'
    check (status in ('normal', 'alert', 'offline', 'maintenance')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists sensor_readings (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid not null references sensors (id) on delete cascade,
  timestamp timestamptz not null default now(),
  water_level_m numeric,
  flow_cms numeric,
  battery_pct integer,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists sensor_readings_sensor_timestamp_idx
  on sensor_readings (sensor_id, timestamp desc);

-- ── Map reference data ───────────────────────────────────────────────
-- geometry holds GeoJSON (Point / Polygon / LineString). radius_m is the
-- interim circle representation until official polygons are supplied.

create table if not exists hazard_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  geometry jsonb,
  radius_m numeric,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (geometry is not null or radius_m is not null)
);

create table if not exists evacuation_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  purok text,
  lat numeric not null,
  lon numeric not null,
  capacity integer,
  role text,
  sector text,
  elevation_m numeric,
  elevation_label text,
  image_query text,
  amenities text[] not null default '{}',
  contact text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists evacuation_routes (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references evacuation_centers (id) on delete cascade,
  from_purok text,
  geometry jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists evacuation_routes_center_idx
  on evacuation_routes (center_id);

-- ── Rollups (retention: raw 12 months, rollups kept) ─────────────────

create table if not exists weather_hourly (
  bucket timestamptz not null,
  source text not null,
  avg_temp numeric,
  sum_rain_mm numeric,
  avg_humidity numeric,
  avg_wind_kmh numeric,
  max_wind_kmh numeric,
  avg_pressure numeric,
  primary key (bucket, source)
);

create table if not exists weather_daily (
  bucket date not null,
  source text not null,
  temp_min numeric,
  temp_max numeric,
  rain_total_mm numeric,
  wind_max_kmh numeric,
  primary key (bucket, source)
);

create table if not exists sensor_hourly (
  bucket timestamptz not null,
  sensor_id uuid not null references sensors (id) on delete cascade,
  level_min_m numeric,
  level_max_m numeric,
  level_avg_m numeric,
  battery_min_pct integer,
  primary key (bucket, sensor_id)
);

-- ── Admin / audit ────────────────────────────────────────────────────

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_name text,
  action text not null,
  target_scope text,
  status text,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists admin_actions_timestamp_idx
  on admin_actions (timestamp desc);

create table if not exists access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  position text,
  area text,
  contact_email text not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz
);
create index if not exists access_requests_status_idx
  on access_requests (status, created_at desc);

-- ── ML ───────────────────────────────────────────────────────────────

create table if not exists ml_models (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  algorithm text,
  trained_at timestamptz,
  metrics jsonb not null default '{}'::jsonb,
  params jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ml_predictions (
  id uuid primary key default gen_random_uuid(),
  model_version text not null,
  issued_at timestamptz not null default now(),
  horizon_hours integer not null,
  predicted_level_m numeric,
  confidence numeric,
  sensor_id uuid references sensors (id) on delete cascade
);
create index if not exists ml_predictions_issued_at_idx
  on ml_predictions (issued_at desc);

-- ── Row Level Security ───────────────────────────────────────────────
-- Public (anon) read on reference + telemetry tables.
-- No write policies anywhere: writes happen through the service role,
-- which bypasses RLS. Official-only tables have no public policies.

do $$
declare
  t text;
begin
  foreach t in array array[
    'weather_readings', 'weather_forecasts', 'risk_snapshots', 'flood_incidents',
    'sensors', 'sensor_readings', 'hazard_zones', 'evacuation_centers',
    'evacuation_routes', 'weather_hourly', 'weather_daily', 'sensor_hourly'
  ]::text[]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;

  foreach t in array array[
    'admin_actions', 'access_requests', 'ml_models', 'ml_predictions'
  ]::text[]
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

drop policy if exists "officials read audit" on admin_actions;
create policy "officials read audit" on admin_actions
  for select
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_official')::boolean, false));

drop policy if exists "officials read requests" on access_requests;
create policy "officials read requests" on access_requests
  for select
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_official')::boolean, false));
