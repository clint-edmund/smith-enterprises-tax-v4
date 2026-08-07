-- ==========================================================
-- Smith Enterprises Tax Management
-- Staff Organizer Dependents Review
--
-- Purpose:
--   Returns staff-safe dependent records for one client and
--   tax year.
--
-- Security:
--   - Requires an authenticated user.
--   - Requires an active staff account.
--   - Uses SECURITY DEFINER with an empty search path.
--   - Does not return Social Security numbers or Secure Vault
--     values.
--
-- Notes:
--   The current dependent schema contains identity and
--   eligibility fields only. Documentation indicators such as
--   birth-certificate status, childcare-document status, and
--   SSN-on-file are intentionally not invented by this RPC.
-- ==========================================================

begin;

create or replace function
public.get_staff_organizer_dependents_review(
  requested_client_id uuid,
  requested_tax_year integer
)
returns table (
  organizer_id uuid,
  dependent_id uuid,
  first_name text,
  middle_name text,
  last_name text,
  suffix text,
  relationship text,
  birth_date date,
  is_full_time_student boolean,
  is_permanently_disabled boolean,
  lived_with_taxpayer_all_year boolean,
  months_lived_with_taxpayer smallint,
  us_citizen_or_resident boolean,
  claimed_by_another_taxpayer boolean,
  display_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  requested_organizer_id uuid;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception
      'A valid tax year is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  select
    organizer.id
  into
    requested_organizer_id
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
      requested_client_id
    and organizer.tax_year =
      requested_tax_year
  order by
    organizer.updated_at desc
  limit 1;

  if requested_organizer_id is null then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  return query
  select
    dependent.organizer_id,
    dependent.id,
    dependent.first_name,
    dependent.middle_name,
    dependent.last_name,
    dependent.suffix,
    dependent.relationship,
    dependent.birth_date,
    dependent.is_full_time_student,
    dependent.is_permanently_disabled,
    dependent.lived_with_taxpayer_all_year,
    dependent.months_lived_with_taxpayer,
    dependent.us_citizen_or_resident,
    dependent.claimed_by_another_taxpayer,
    dependent.display_order,
    dependent.created_at,
    dependent.updated_at
  from public.client_tax_organizer_dependents
    as dependent
  where dependent.organizer_id =
    requested_organizer_id
  order by
    dependent.display_order,
    dependent.created_at,
    dependent.id;
end;
$function$;

comment on function
public.get_staff_organizer_dependents_review(
  uuid,
  integer
)
is
'Returns staff-safe dependent identity and eligibility information for one client organizer and tax year. Social Security numbers and Secure Vault values are excluded.';

revoke all
on function
public.get_staff_organizer_dependents_review(
  uuid,
  integer
)
from public;

revoke all
on function
public.get_staff_organizer_dependents_review(
  uuid,
  integer
)
from anon;

grant execute
on function
public.get_staff_organizer_dependents_review(
  uuid,
  integer
)
to authenticated;

commit;