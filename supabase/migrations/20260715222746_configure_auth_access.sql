-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 4 authentication access configuration
-- ============================================================
-- ------------------------------------------------------------
-- Allow authenticated users to read their own profile,
-- including inactive users awaiting administrator approval.
-- ------------------------------------------------------------
drop policy if exists "Active users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for
select to authenticated using (id = auth.uid());
-- ------------------------------------------------------------
-- Prevent non-administrators from changing security fields.
--
-- Administrators continue to use the existing administrator
-- update policy. Users will not receive a general self-update
-- policy during this phase.
-- ------------------------------------------------------------
-- ------------------------------------------------------------
-- Current access status function
--
-- Returns the authenticated user's profile and access status.
-- SECURITY INVOKER is sufficient because the user may read
-- their own profile through RLS.
-- ------------------------------------------------------------
create or replace function public.get_current_access_status() returns table (
    id uuid,
    email text,
    first_name text,
    last_name text,
    display_name text,
    role public.app_role,
    is_active boolean
  ) language sql stable security invoker
set search_path = '' as $$
select profile.id,
  profile.email,
  profile.first_name,
  profile.last_name,
  profile.display_name,
  profile.role,
  profile.is_active
from public.profiles as profile
where profile.id = auth.uid();
$$;
revoke all on function public.get_current_access_status()
from public;
revoke all on function public.get_current_access_status()
from anon;
grant execute on function public.get_current_access_status() to authenticated;
comment on function public.get_current_access_status() is 'Returns the authenticated user profile and staff access status.';