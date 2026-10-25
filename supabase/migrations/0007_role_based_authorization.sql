-- 0007_role_based_authorization.sql
-- Database-backed official roles replace JWT metadata as the authorization source.
-- app_metadata.is_official remains synchronized for the legacy route gate only.

create type public.app_role as enum (
  'administrator',
  'incident_commander',
  'shelter_registrar',
  'bdrrmo_coordinator',
  'viewer'
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid not null references auth.users (id) on delete restrict
);

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon, authenticated;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.user_roles
  where user_id = auth.uid()
$$;

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_app_role() = 'administrator'::public.app_role
$$;

grant execute on function public.current_app_role() to authenticated;

drop policy if exists "officials read audit" on public.admin_actions;
drop policy if exists "administrators read audit" on public.admin_actions;
create policy "administrators read audit" on public.admin_actions
  for select to authenticated
  using (public.is_administrator());

revoke insert, update, delete on table public.admin_actions from anon, authenticated;

create or replace function public.prevent_admin_action_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'admin_actions entries are append-only' using errcode = '42501';
end;
$$;

drop trigger if exists prevent_admin_action_update on public.admin_actions;
create trigger prevent_admin_action_update
  before update or delete on public.admin_actions
  for each row execute function public.prevent_admin_action_mutation();

create or replace function public.admin_set_user_role(
  p_target_user_id uuid,
  p_role public.app_role,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_previous_role public.app_role;
  v_actor_name text;
begin
  if v_actor_id is null or not public.is_administrator() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if p_target_user_id = v_actor_id then
    raise exception 'administrators cannot change their own role' using errcode = '22023';
  end if;

  if length(trim(p_reason)) < 5 or length(trim(p_reason)) > 280 then
    raise exception 'reason must be between 5 and 280 characters' using errcode = '22023';
  end if;

  if not exists (select 1 from auth.users where id = p_target_user_id) then
    raise exception 'target account was not found' using errcode = '22023';
  end if;

  select role into v_previous_role from public.user_roles where user_id = p_target_user_id;
  select coalesce(nullif(raw_user_meta_data ->> 'name', ''), email)
    into v_actor_name from auth.users where id = v_actor_id;

  insert into public.user_roles (user_id, role, granted_by)
  values (p_target_user_id, p_role, v_actor_id)
  on conflict (user_id) do update
    set role = excluded.role,
        granted_at = now(),
        granted_by = excluded.granted_by;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{is_official}',
    'true'::jsonb
  )
  where id = p_target_user_id;

  insert into public.admin_actions (actor_id, actor_name, action, target_scope, status, metadata)
  values (
    v_actor_id,
    v_actor_name,
    case when v_previous_role is null then 'role.assigned' else 'role.changed' end,
    'official:' || p_target_user_id::text,
    'success',
    jsonb_build_object(
      'previous_role', v_previous_role,
      'role', p_role,
      'reason', trim(p_reason)
    )
  );
end;
$$;

create or replace function public.admin_revoke_user_role(
  p_target_user_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_previous_role public.app_role;
  v_actor_name text;
begin
  if v_actor_id is null or not public.is_administrator() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if p_target_user_id = v_actor_id then
    raise exception 'administrators cannot revoke their own role' using errcode = '22023';
  end if;

  if length(trim(p_reason)) < 5 or length(trim(p_reason)) > 280 then
    raise exception 'reason must be between 5 and 280 characters' using errcode = '22023';
  end if;

  select role into v_previous_role from public.user_roles where user_id = p_target_user_id;
  if v_previous_role is null then
    raise exception 'target account has no official role' using errcode = '22023';
  end if;

  if v_previous_role = 'administrator'::public.app_role
    and (select count(*) from public.user_roles where role = 'administrator'::public.app_role) <= 1 then
    raise exception 'the final administrator role cannot be revoked' using errcode = '22023';
  end if;

  select coalesce(nullif(raw_user_meta_data ->> 'name', ''), email)
    into v_actor_name from auth.users where id = v_actor_id;

  delete from public.user_roles where user_id = p_target_user_id;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{is_official}',
    'false'::jsonb
  )
  where id = p_target_user_id;

  insert into public.admin_actions (actor_id, actor_name, action, target_scope, status, metadata)
  values (
    v_actor_id,
    v_actor_name,
    'role.revoked',
    'official:' || p_target_user_id::text,
    'success',
    jsonb_build_object('previous_role', v_previous_role, 'reason', trim(p_reason))
  );
end;
$$;

revoke all on function public.admin_set_user_role(uuid, public.app_role, text) from public;
revoke all on function public.admin_revoke_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, public.app_role, text) to authenticated;
grant execute on function public.admin_revoke_user_role(uuid, text) to authenticated;

-- Bootstrap the first Administrator in a controlled database-owner session.
-- Use an existing auth.users UUID for both user_id and granted_by, then record
-- the action in admin_actions in the same transaction. Do not expose this as
-- an application endpoint: it would recreate a self-promotion path.
