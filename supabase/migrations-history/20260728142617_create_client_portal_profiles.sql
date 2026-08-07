-- ============================================================
-- Phase 10.8.2A
-- Client Portal Authentication Foundation
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Client portal status
-- ------------------------------------------------------------

create type public.client_portal_status as enum (
  'invited',
  'active',
  'disabled'
);

-- ------------------------------------------------------------
-- Client portal profiles
--
-- One portal identity may belong to one client record.
-- One client record may have one portal identity during the MVP.
--
-- The authentication user is stored separately from the staff
-- profiles table so client and staff authorization remain
-- independent.
-- ------------------------------------------------------------

create table public.client_portal_profiles (
  id uuid primary key
    default gen_random_uuid(),

  auth_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  email text not null,

  portal_status public.client_portal_status not null
    default 'invited',

  invited_at timestamptz,

  activated_at timestamptz,

  last_login_at timestamptz,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint client_portal_profiles_auth_user_unique
    unique (auth_user_id),

  constraint client_portal_profiles_client_unique
    unique (client_id),

  constraint client_portal_profiles_email_length
    check (
      length(email) between 3 and 320
    ),

  constraint client_portal_profiles_email_normalized
    check (
      email = lower(trim(email))
    ),

  constraint client_portal_profiles_activation_status
    check (
      portal_status <> 'active'
      or activated_at is not null
    )
);

comment on table public.client_portal_profiles is
  'Links Supabase authentication users to Smith Enterprises client records.';

comment on column public.client_portal_profiles.auth_user_id is
  'Supabase auth.users identifier for the client portal account.';

comment on column public.client_portal_profiles.client_id is
  'Existing Smith Enterprises client record associated with the portal account.';

comment on column public.client_portal_profiles.portal_status is
  'Controls whether the client account is invited, active, or disabled.';

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

create index client_portal_profiles_email_index
  on public.client_portal_profiles (
    lower(email)
  );

create index client_portal_profiles_status_index
  on public.client_portal_profiles (
    portal_status
  );

create index client_portal_profiles_client_index
  on public.client_portal_profiles (
    client_id
  );

-- ------------------------------------------------------------
-- Updated-at trigger
-- ------------------------------------------------------------

create or replace function public.set_client_portal_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  new.updated_at := timezone('utc', now());

  return new;
end;
$$;

create trigger set_client_portal_profile_updated_at
before insert or update
on public.client_portal_profiles
for each row
execute function public.set_client_portal_profile_updated_at();

-- ------------------------------------------------------------
-- Current-client helper functions
--
-- Security-definer helpers prevent application code from
-- supplying or choosing a client_id. The value always comes
-- from the authenticated Supabase user.
-- ------------------------------------------------------------

create or replace function public.current_client_portal_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select portal_profile.id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select portal_profile.client_id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
    and portal_profile.portal_status = 'active'
  limit 1;
$$;

create or replace function public.current_client_portal_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.client_portal_profiles as portal_profile
    where portal_profile.auth_user_id = auth.uid()
      and portal_profile.portal_status = 'active'
  );
$$;

-- ------------------------------------------------------------
-- Current-client profile RPC
--
-- This returns safe portal identity information and selected
-- client contact fields. It deliberately excludes internal
-- notes, staff audit fields, and other administrative data.
-- ------------------------------------------------------------

create or replace function public.get_current_client_profile()
returns table (
  portal_profile_id uuid,
  auth_user_id uuid,
  client_id uuid,
  client_number bigint,
  email text,
  first_name text,
  middle_name text,
  last_name text,
  preferred_name text,
  phone text,
  portal_status public.client_portal_status,
  invited_at timestamptz,
  activated_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    portal_profile.id,
    portal_profile.auth_user_id,
    portal_profile.client_id,
    client.client_number,
    portal_profile.email,
    client.first_name,
    client.middle_name,
    client.last_name,
    client.preferred_name,
    client.phone,
    portal_profile.portal_status,
    portal_profile.invited_at,
    portal_profile.activated_at,
    portal_profile.last_login_at,
    portal_profile.created_at,
    portal_profile.updated_at
  from public.client_portal_profiles as portal_profile
  inner join public.clients as client
    on client.id = portal_profile.client_id
  where portal_profile.auth_user_id = auth.uid()
  limit 1;
$$;

-- ------------------------------------------------------------
-- Record a successful client login
--
-- A client may update only the login timestamp belonging to
-- their own authenticated portal profile.
-- ------------------------------------------------------------

create or replace function public.record_client_portal_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.client_portal_profiles
  set
    last_login_at = timezone('utc', now())
  where auth_user_id = auth.uid()
    and portal_status = 'active';

  if not found then
    raise exception
      'An active client portal profile was not found.';
  end if;
end;
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.client_portal_profiles
  enable row level security;

alter table public.client_portal_profiles
  force row level security;

-- Clients may view only their own portal-profile row.
create policy "Clients can view their own portal profile"
on public.client_portal_profiles
for select
to authenticated
using (
  auth_user_id = auth.uid()
);

-- Active staff may view portal profiles for administration.
create policy "Active staff can view client portal profiles"
on public.client_portal_profiles
for select
to authenticated
using (
  public.current_user_is_active()
);

-- Authorized staff may create portal-profile links.
--
-- The actual auth-user invitation will later be performed by
-- a protected Edge Function using the service role. This policy
-- supports staff-side administration after the auth user exists.
create policy "Authorized staff can create client portal profiles"
on public.client_portal_profiles
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
);

-- Authorized staff may update invitation and account status.
create policy "Authorized staff can update client portal profiles"
on public.client_portal_profiles
for update
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
);

-- Only administrators may remove a portal-profile association.
create policy "Administrators can delete client portal profiles"
on public.client_portal_profiles
for delete
to authenticated
using (
  public.current_user_is_admin()
);

-- ------------------------------------------------------------
-- Privileges
-- ------------------------------------------------------------

revoke all
on table public.client_portal_profiles
from anon;

grant select
on table public.client_portal_profiles
to authenticated;

grant insert, update, delete
on table public.client_portal_profiles
to authenticated;

revoke all
on function public.current_client_portal_profile_id()
from public;

revoke all
on function public.current_client_id()
from public;

revoke all
on function public.current_client_portal_is_active()
from public;

revoke all
on function public.get_current_client_profile()
from public;

revoke all
on function public.record_client_portal_login()
from public;

grant execute
on function public.current_client_portal_profile_id()
to authenticated;

grant execute
on function public.current_client_id()
to authenticated;

grant execute
on function public.current_client_portal_is_active()
to authenticated;

grant execute
on function public.get_current_client_profile()
to authenticated;

grant execute
on function public.record_client_portal_login()
to authenticated;

commit;