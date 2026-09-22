-- ═════════════════════════════════════════════════════════════════════
-- 0003_auth_setup.sql
-- Marks official accounts. Idempotent port of supabase/auth-setup.sql.
--
-- IMPORTANT: this is a harmless no-op until the accounts listed below
-- exist. Create them first under Authentication → Users, then re-run the
-- update statements (or add the real addresses here and re-apply).
--
-- The app renders /admin only when auth.users.raw_app_meta_data.is_official
-- is true (see src/lib/supabase/server.ts).
-- ═════════════════════════════════════════════════════════════════════

update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{is_official}',
  'true'::jsonb
)
where email in (
  'liloan.drrmo@example.gov.ph',
  'engr.mendoza@cotcot.gov.ph'
);

update auth.users
set raw_user_meta_data = raw_user_meta_data
  || '{"name":"Liloan DRRMO","role":"Municipal Disaster Risk Reduction Officer"}'::jsonb
where email = 'liloan.drrmo@example.gov.ph';

update auth.users
set raw_user_meta_data = raw_user_meta_data
  || '{"name":"Engr. M. Mendoza","role":"Chief Hydrologist"}'::jsonb
where email = 'engr.mendoza@cotcot.gov.ph';
