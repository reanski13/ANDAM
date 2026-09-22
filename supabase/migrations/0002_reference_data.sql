-- ═════════════════════════════════════════════════════════════════════
-- 0002_reference_data.sql
-- Seeds reference data currently hardcoded in the app so the database is
-- a faithful superset of the UI. Values are NOT official yet — sensors are
-- flagged simulated and center amenities/elevation text come from the UI.
-- Replace with Liloan DRRMO / barangay figures when supplied.
--
-- Sources:
--   src/lib/constants.ts        EVACUATION_CENTERS
--   src/app/map/page.tsx        SENSOR_MARKERS, CENTER_META, FLOOD_ZONES
--   src/app/evacuation/page.tsx CENTER_META
-- ═════════════════════════════════════════════════════════════════════

-- ── Evacuation centers ───────────────────────────────────────────────

insert into evacuation_centers
  (id, name, address, lat, lon, capacity, role, sector, elevation_label, image_query, amenities, elevation_m, contact)
values
  ('11111111-1111-4111-8111-111111111111', 'Cotcot Barangay Hall', 'Barangay Cotcot, Liloan, Cebu',
   10.3010, 123.9840, 350, 'Primary Command Station', 'Sector A',
   'BDRRMO Operations Room on Level 2', 'Cotcot Barangay Hall, Liloan, Cebu',
   array['Generator Equipped', 'Medical First Aid Station', 'Satellite Comm'], null, '(032) 273-4321'),

  ('22222222-2222-4222-8222-222222222222', 'Cotcot Elementary School', 'Purok Masagana, Cotcot, Liloan',
   10.2990, 123.9820, 600, 'High Elevation Zone', 'Sector B',
   '12m Above Sea Level (Non-inundation)', 'Cotcot Elementary School, Purok Masagana, Liloan, Cebu',
   array['Multi-classroom Shelter', 'Elevated Ground (12m)', 'Sanitation Blocks'], 12, '(032) 273-4321'),

  ('33333333-3333-4333-8333-333333333333', 'Liloan Municipal Gymnasium', 'Poblacion, Liloan, Cebu',
   10.3167, 123.9667, 800, 'Primary Logistics Hub', 'Municipal Hub',
   'Heavy Vehicle Ingress & Supply Depot', 'Liloan Municipal Gymnasium, Poblacion, Liloan, Cebu',
   array['Primary Relief Distribution Hub', 'Covered Arena Structure', 'Fleet Access'], null, '(032) 273-4321'),

  ('44444444-4444-4444-8444-444444444444', 'Sacred Heart School - Cotcot', 'Cotcot, Liloan, Cebu',
   10.3005, 123.9835, 400, 'Highway Corridor Refuge', 'Sector C',
   'Direct Highway Access • Well Lit Perimeter', 'Sacred Heart School, Cotcot, Liloan, Cebu',
   array['Kitchen & Hygiene Facilities', 'Secondary Shelter', 'Rainwater Filtration'], null, '(032) 273-4321')
on conflict (id) do nothing;

-- ── Sensors (simulated — no telemetry hardware yet) ──────────────────

insert into sensors
  (id, station_id, name, type, lat, lon, normal_level_m, warning_level_m, danger_level_m,
   data_source, is_simulated, status)
values
  ('55555555-5555-4555-8555-555555555555', 'Stn-01', 'Cotcot Bridge', 'river_level',
   10.3015, 123.9818, 2.5, 3.0, 3.5, 'simulated', true, 'normal'),

  ('66666666-6666-4666-8666-666666666666', 'Stn-02', 'Masagana Creek', 'river_level',
   10.2988, 123.9845, 1.6, 2.0, 2.5, 'simulated', true, 'alert')
on conflict (id) do nothing;

insert into sensor_readings
  (id, sensor_id, water_level_m, flow_cms, source)
values
  ('b1111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555555', 1.85, 14.2, 'simulated'),
  ('b2222222-2222-4222-8222-222222222222', '66666666-6666-4666-8666-666666666666', 1.20, 8.7, 'simulated')
on conflict (id) do nothing;

-- ── Hazard zones ─────────────────────────────────────────────────────
-- Interim representation: GeoJSON Point + radius_m, matching the circles
-- drawn by the current map. Swap to Polygon geometry when the official
-- hazard shapefile arrives.

insert into hazard_zones (id, name, severity, geometry, radius_m, description)
values
  ('77777777-7777-4777-8777-777777777777', 'Purok Masagana Lowland', 'high',
   '{"type":"Point","coordinates":[123.9833,10.3005]}'::jsonb, 300,
   'Recurring flash-flood lowland; primary inundation corridor.'),

  ('88888888-8888-4888-8888-888888888888', 'Cotcot River Mouth', 'high',
   '{"type":"Point","coordinates":[123.9828,10.2995]}'::jsonb, 300,
   'River confluence; rapid crest response during heavy rainfall.'),

  ('99999999-9999-4999-8999-999999999999', 'Purok Suba Coastal', 'moderate',
   '{"type":"Point","coordinates":[123.9840,10.3008]}'::jsonb, 250,
   'Coastal-adjacent surge zone downstream of the river mouth.'),

  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Inland Low-lying Areas', 'low',
   '{"type":"Point","coordinates":[123.9820,10.2998]}'::jsonb, 350,
   'Low-lying inland pockets prone to ponding after sustained rain.')
on conflict (id) do nothing;
