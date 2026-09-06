-- ═════════════════════════════════════════════════════════════════════
-- Cotcot Flood Alert - Officials access setup
-- Run once in the Supabase SQL Editor AFTER enabling Email/Password and
-- creating the official account(s) under Authentication > Users (Add user).
-- The app only renders the Officials Dashboard when
-- auth.users.raw_app_meta_data.is_official = true.
-- ═════════════════════════════════════════════════════════════════════

-- 1) Grant officials access (replace emails with the accounts you created)
update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{is_official}',
  'true'
)
where email in (
  'liloan.drrmo@example.gov.ph',
  'engr.mendoza@cotcot.gov.ph'
);

-- 2) Optional: display name + role shown on the Officials dashboard.
--    Repeat per official, matching the email above.
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"name":"Liloan DRRMO","role":"Municipal Disaster Risk Reduction Officer"}'::jsonb
where email = 'liloan.drrmo@example.gov.ph';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"name":"Engr. M. Mendoza","role":"Chief Hydrologist"}'::jsonb
where email = 'engr.mendoza@cotcot.gov.ph';

-- 3) Verify
select
  email,
  raw_app_meta_data ->> 'is_official' as is_official,
  raw_user_meta_data ->> 'name' as display_name,
  raw_user_meta_data ->> 'role' as role
from auth.users
order by is_official desc nulls last;