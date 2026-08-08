-- ==========================================================
-- Smith Enterprises Tax Management
-- Staff Healthcare Organizer Review
--
-- Purpose:
--   Returns healthcare coverage records for one client organizer
--   and tax year to authenticated, active staff users.
--
-- Security:
--   - Requires an authenticated user.
--   - Requires an active staff account.
--   - Uses SECURITY DEFINER with an empty search path.
--   - Does not return Secure Vault values.
-- ==========================================================

begin;

create or replace function
public.get_staff_organizer_healthcare_review(
  requested_client_id uuid,
  requested_tax_year integer
)
returns table (
  organizer_id uuid,
  coverage_id uuid,
  provider_name text,
  coverage_type text,
  covered_person_name text,
  policy_number text,
  start_month integer,
  end_month integer,
  is_full_year_coverage boolean,
  document_received boolean,
  document_type text,
  notes text,
  record_status text,
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
    coverage.organizer_id,
    coverage.id,
    coverage.provider_name,
    coverage.coverage_type,
    coverage.covered_person_name,
    coverage.policy_number,
    coverage.start_month,
    coverage.end_month,
    coverage.is_full_year_coverage,
    coverage.document_received,
    coverage.document_type,
    coverage.notes,
    coverage.record_status,
    coverage.display_order,
    coverage.created_at,
    coverage.updated_at
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.organizer_id =
    requested_organizer_id
  order by
    coverage.display_order,
    coverage.created_at,
    coverage.id;
end;
$function$;

comment on function
public.get_staff_organizer_healthcare_review(
  uuid,
  integer
)
is
'Returns staff-visible healthcare organizer records for one client and tax year. Secure Vault values are excluded.';

revoke all
on function
public.get_staff_organizer_healthcare_review(
  uuid,
  integer
)
from public;

revoke all
on function
public.get_staff_organizer_healthcare_review(
  uuid,
  integer
)
from anon;

grant execute
on function
public.get_staff_organizer_healthcare_review(
  uuid,
  integer
)
to authenticated;

commit;