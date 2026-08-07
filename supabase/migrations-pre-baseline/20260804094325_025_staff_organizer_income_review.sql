-- ==========================================================
-- Smith Enterprises Tax Management
-- Staff Income Organizer Review
-- ==========================================================

begin;

create or replace function
public.get_staff_organizer_income_review(
  requested_client_id uuid,
  requested_tax_year integer
)
returns table (
  organizer_id uuid,
  income_source_id uuid,
  income_type text,
  payer_name text,
  recipient_type text,
  record_status text,
  document_received boolean,
  notes text,
  display_order integer,
  employer_identification_number text,
  wages numeric,
  federal_income_tax_withheld numeric,
  social_security_wages numeric,
  social_security_tax_withheld numeric,
  medicare_wages numeric,
  medicare_tax_withheld numeric,
  state_code text,
  state_wages numeric,
  state_income_tax_withheld numeric,
  local_wages numeric,
  local_income_tax_withheld numeric,
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
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception 'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception 'A valid tax year is required.';
  end if;

  if not exists (
    select 1
    from public.clients as client
    where client.id = requested_client_id
  ) then
    raise exception 'The requested client was not found.';
  end if;

  select organizer.id
  into requested_organizer_id
  from public.client_tax_organizers as organizer
  where organizer.client_id = requested_client_id
    and organizer.tax_year = requested_tax_year
  order by organizer.updated_at desc
  limit 1;

  if requested_organizer_id is null then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  return query
  select
    income.organizer_id,
    income.id,
    income.income_type,
    income.payer_name,
    income.recipient_type,
    income.record_status,
    income.document_received,
    income.notes,
    income.display_order,
    w2.employer_identification_number,
    w2.wages,
    w2.federal_income_tax_withheld,
    w2.social_security_wages,
    w2.social_security_tax_withheld,
    w2.medicare_wages,
    w2.medicare_tax_withheld,
    w2.state_code,
    w2.state_wages,
    w2.state_income_tax_withheld,
    w2.local_wages,
    w2.local_income_tax_withheld,
    income.created_at,
    greatest(
      income.updated_at,
      coalesce(w2.updated_at, income.updated_at)
    ) as updated_at
  from public.client_tax_organizer_income_sources as income
  left join public.client_tax_organizer_income_w2_details as w2
    on w2.income_source_id = income.id
  where income.organizer_id = requested_organizer_id
  order by
    income.display_order,
    income.created_at,
    income.id;
end;
$function$;

comment on function
public.get_staff_organizer_income_review(uuid, integer)
is
'Returns staff-visible organizer income records and W-2 detail values for one client and tax year. Employee SSNs and Secure Vault values are excluded.';

revoke all
on function public.get_staff_organizer_income_review(uuid, integer)
from public;

revoke all
on function public.get_staff_organizer_income_review(uuid, integer)
from anon;

grant execute
on function public.get_staff_organizer_income_review(uuid, integer)
to authenticated;

commit;