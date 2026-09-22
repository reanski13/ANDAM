-- ═════════════════════════════════════════════════════════════════════
-- 0004_evacuation_centers_trust.sql
-- Replaces fabricated evacuation-center demo rows with the documented
-- Liloan roster, adds a verified/data_source/notes trust layer, and
-- recalibrates map coordinates to real Cotcot (10.43°N, 124.00°E).
--
-- Sources (public record, Typhoon Tino Nov 2025 / TD Verbena Nov 2025):
--   • DSWD DROMIC Report #41 on Typhoon Tino (25 Nov 2025, 6PM)
--   • CDN Digital / Inquirer.net — "Liloan orders preemptive evacuation
--     as TD Verbena nears" (24 Nov 2025)
--   • Philippine News Agency — relief ops at Tiltilon Elementary School
--     (article/1262775); PCO coverage of Pres. Marcos Jr. visit
--   • SunStar Cebu (2016) — confirms "Panphil Frasco Kai gym" is Liloan's
--     municipal gymnasium
-- Coordinates from OpenStreetMap Nominatim where a facility is mapped;
-- otherwise marked "approximate location" in notes.
--
-- DROMIC gives occupancy (509, 618 persons) but NOT true capacity, so
-- capacity stays NULL until the Liloan DRRMO publishes design figures.
-- ═════════════════════════════════════════════════════════════════════

-- ── Trust columns ────────────────────────────────────────────────────

alter table evacuation_centers
  add column verified boolean not null default false,
  add column data_source text,
  add column notes text;

-- ── Remove fabricated venues ─────────────────────────────────────────
-- "Cotcot Elementary School", "Liloan Municipal Gymnasium" and
-- "Sacred Heart School - Cotcot" are not in the public record. Liloan's
-- actual municipal gym is Panphil B. Francisco Gymnasium (Frasco Kai),
-- re-inserted as a verified EC below.

delete from evacuation_centers where id in (
  '22222222-2222-4222-8222-222222222222', -- Cotcot Elementary School
  '33333333-3333-4333-8333-333333333333', -- Liloan Municipal Gymnasium
  '44444444-4444-4444-8444-444444444444'  -- Sacred Heart School - Cotcot
);

-- ── Re-gauge Cotcot Barangay Hall as an unconfirmed reference point ──
-- Not documented as an active EC during Tino; kept as a local anchor.
-- Carries no capacity / amenities / contact claims.

update evacuation_centers
set lat = 10.4276,
    lon = 124.0017,
    capacity = null,
    role = null,
    sector = 'Cotcot',
    elevation_m = null,
    elevation_label = null,
    amenities = '{}',
    contact = null,
    verified = false,
    data_source = 'reference',
    notes = 'Local reference point. Not documented as an active evacuation center during Typhoon Tino (Nov 2025) — of the municipal roster below, Tiltilon Elementary School (Barangay Cotcot) was the Cotcot EC.'
where id = '11111111-1111-4111-8111-111111111111';

-- ── Real documented evacuation centers ───────────────────────────────

insert into evacuation_centers
  (id, name, address, lat, lon, capacity, role, sector, image_query, amenities,
   verified, data_source, notes)
values
  ('d1111111-1111-4111-8111-111111111111', 'Tiltilon Elementary School',
   'Tiltilon, Barangay Cotcot, Liloan, Cebu',
   10.43316, 123.99296, null, 'Designated EC - School', 'Cotcot',
   'Tiltilon Elementary School, Cotcot, Liloan, Cebu', '{}',
   true, 'PNA / DSWD DROMIC',
   'Primary Cotcot EC during Typhoon Tino (Nov 2025): housed 509 displaced persons; FFP distribution attended by Pres. Marcos Jr., 7 Nov 2025. Sources: DSWD DROMIC #41; PNA article/1262775.'),

  ('d2222222-2222-4222-8222-222222222222', 'Liloan Central School',
   'Cebu North Road, Poblacion, Liloan, Cebu',
   10.40224, 123.99742, null, 'Designated EC - School', 'Poblacion',
   'Liloan Central School, Poblacion, Liloan, Cebu', '{}',
   true, 'CDN Digital / DSWD DROMIC',
   'Cotcot River residents pre-emptively evacuated here during TD Verbena (24 Nov 2025) — 137 individuals relocated; also an EC during the July 2024 floods. Sources: CDN Digital 672426; DSWD DROMIC #3.'),

  ('d3333333-3333-4333-8333-333333333333', 'Panphil B. Francisco Gymnasium',
   'Municipal compound, Poblacion, Liloan, Cebu',
   10.3996, 124.0000, null, 'Designated EC - Gymnasium / Relief Hub', 'Poblacion',
   'Liloan Municipal Gymnasium, Poblacion, Liloan, Cebu', '{}',
   true, 'DSWD DROMIC / SunStar',
   'Liloan town gymnasium (Panphil Frasco Kai Gym). Sheltered 618 IDPs with hot meals (DSWD Mobile Kitchen) and NFI distribution during Typhoon Tino. Approximate location. Sources: DSWD DROMIC #41; SunStar Cebu (2016).'),

  ('d4444444-4444-4444-8444-444444444444', 'Weber Hotel',
   'Poblacion, Liloan, Cebu',
   10.4010, 124.0000, null, 'Emergency Overflow Shelter - Private', 'Poblacion',
   'Liloan town, Poblacion, Cebu', '{}',
   true, 'DSWD DROMIC',
   'Private hotel used as overflow shelter when Tiltilon EC exceeded capacity during Typhoon Tino. Not a designated public EC — shown for completeness only. Approximate location. Source: DSWD DROMIC (Nov 2025 - May 2026).'),

  ('d5555555-5555-4555-8555-555555555555', 'Yati Elementary School',
   'Cebu North Road, Yati, Liloan, Cebu',
   10.39352, 123.98301, null, 'Designated EC - School', 'Yati',
   'Yati Elementary School, Liloan, Cebu', '{}',
   true, 'CDN Digital',
   'Designated EC for Barangay Yati during the TD Verbena preemptive evacuation, 24 Nov 2025. Source: CDN Digital 672426.'),

  ('d6666666-6666-4666-8666-666666666666', 'Calero Integrated School',
   'J. Pepito Street, Calero, Liloan, Cebu',
   10.36374, 123.99849, null, 'Designated EC - School', 'Calero',
   'Calero Integrated School, Liloan, Cebu', '{}',
   true, 'CDN Digital',
   'Designated EC for Barangay Calero during the TD Verbena preemptive evacuation, 24 Nov 2025. Source: CDN Digital 672426.')
on conflict (id) do nothing;

-- Also documented as active ECs during TD Verbena (Labatan NHS 2nd floor /
-- old barangay hall; E. Veloso Elementary School and Kasantos Day Care
-- Center, Cabadiangan) but not mapped on OpenStreetMap — omitted pending
-- coordinates. Source: CDN Digital 672426.

-- ── Recalibrate sensors + hazard zones to real Cotcot ────────────────
-- Cotcot is at ~10.428°N, 124.002°E (OSM). The previous 10.30°N values
-- sat ~14 km offshore/away. Sensors stay simulated; zones are illustrative.

update sensors
set lat = 10.4260, lon = 124.0010
where id = '55555555-5555-4555-8555-555555555555'; -- Cotcot Bridge

update sensors
set lat = 10.4290, lon = 124.0035
where id = '66666666-6666-4666-8666-666666666666'; -- Masagana Creek

update hazard_zones
set name = 'Cotcot River Lowland',
    geometry = '{"type":"Point","coordinates":[124.0005,10.4245]}'::jsonb,
    description = 'Recurring flash-flood lowland along the Cotcot River; primary inundation corridor. Illustrative boundary.'
where id = '77777777-7777-4777-8777-777777777777';

update hazard_zones
set name = 'Cotcot River - Masagana Creek Confluence',
    geometry = '{"type":"Point","coordinates":[124.0025,10.4275]}'::jsonb,
    description = 'River confluence; rapid crest response during heavy rainfall. Illustrative boundary.'
where id = '88888888-8888-4888-8888-888888888888';

update hazard_zones
set name = 'Masagana Creek Corridor',
    geometry = '{"type":"Point","coordinates":[124.0040,10.4300]}'::jsonb,
    description = 'Low-lying creek corridor prone to rapid overflow after sustained rain. Illustrative boundary.'
where id = '99999999-9999-4999-8999-999999999999';

update hazard_zones
set name = 'Inland Low-lying Areas',
    geometry = '{"type":"Point","coordinates":[124.0005,10.4325]}'::jsonb,
    description = 'Low-lying inland pockets prone to ponding after sustained rain. Illustrative boundary.'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';