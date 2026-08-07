-- ==========================================================
-- Smith Enterprises Tax Management
-- Release 0.10 - Sprint 0.10.4C.1
-- Client Business Organizer
-- ==========================================================

begin;

-- Store the client's yes/no answer even when no business rows exist.
create table if not exists
public.client_tax_organizer_business_responses (
  organizer_id uuid primary key
    references public.client_tax_organizers(id)
    on delete cascade,
  has_business_activity boolean,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists business_responses_set_updated_at
on public.client_tax_organizer_business_responses;

create trigger business_responses_set_updated_at
before update on public.client_tax_organizer_business_responses
for each row execute function public.set_updated_at();

create table if not exists
public.client_tax_organizer_businesses (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null
    references public.client_tax_organizers(id)
    on delete cascade,

  business_name text not null default '',
  dba_name text not null default '',
  entity_type text not null default '',
  employer_identification_number text not null default '',
  principal_business_activity text not null default '',
  business_code text not null default '',

  address_line_1 text not null default '',
  address_line_2 text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  country text not null default 'United States',

  date_started date,
  date_closed date,
  ownership_percentage numeric(5,2),
  accounting_method text not null default '',
  was_active_during_tax_year boolean,

  has_home_office boolean,
  has_employees boolean,
  has_inventory boolean,
  uses_vehicle boolean,
  bookkeeping_complete boolean,

  gross_receipts numeric(14,2) not null default 0,
  returns_and_allowances numeric(14,2) not null default 0,
  other_business_income numeric(14,2) not null default 0,
  cost_of_goods_sold numeric(14,2) not null default 0,

  advertising_expense numeric(14,2) not null default 0,
  car_and_truck_expense numeric(14,2) not null default 0,
  commissions_and_fees_expense numeric(14,2) not null default 0,
  contract_labor_expense numeric(14,2) not null default 0,
  depreciation_expense numeric(14,2) not null default 0,
  employee_benefit_expense numeric(14,2) not null default 0,
  insurance_expense numeric(14,2) not null default 0,
  interest_expense numeric(14,2) not null default 0,
  legal_and_professional_expense numeric(14,2) not null default 0,
  office_expense numeric(14,2) not null default 0,
  pension_and_profit_sharing_expense numeric(14,2) not null default 0,
  rent_or_lease_expense numeric(14,2) not null default 0,
  repairs_and_maintenance_expense numeric(14,2) not null default 0,
  supplies_expense numeric(14,2) not null default 0,
  taxes_and_licenses_expense numeric(14,2) not null default 0,
  travel_expense numeric(14,2) not null default 0,
  deductible_meals_expense numeric(14,2) not null default 0,
  utilities_expense numeric(14,2) not null default 0,
  wages_expense numeric(14,2) not null default 0,
  other_expense numeric(14,2) not null default 0,
  other_expense_description text not null default '',

  notes text not null default '',
  record_status text not null default 'draft',
  display_order integer not null default 0,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint organizer_business_entity_type_valid check (
    entity_type in (
      '', 'sole_proprietorship', 'single_member_llc',
      'partnership', 'multi_member_llc', 's_corporation',
      'c_corporation', 'farm', 'other'
    )
  ),
  constraint organizer_business_accounting_method_valid check (
    accounting_method in ('', 'cash', 'accrual', 'other')
  ),
  constraint organizer_business_record_status_valid check (
    record_status in ('draft', 'complete', 'needs_review')
  ),
  constraint organizer_business_ein_valid check (
    employer_identification_number = ''
    or employer_identification_number ~ '^[0-9]{2}-?[0-9]{7}$'
  ),
  constraint organizer_business_state_valid check (
    state = '' or state ~ '^[A-Z]{2}$'
  ),
  constraint organizer_business_ownership_valid check (
    ownership_percentage is null
    or ownership_percentage between 0 and 100
  ),
  constraint organizer_business_dates_valid check (
    date_closed is null
    or date_started is null
    or date_closed >= date_started
  ),
  constraint organizer_business_display_order_valid check (
    display_order >= 0
  ),
  constraint organizer_business_notes_length check (
    char_length(notes) <= 10000
  ),
  constraint organizer_business_other_description_length check (
    char_length(other_expense_description) <= 1000
  ),
  constraint organizer_business_amounts_nonnegative check (
    gross_receipts >= 0
    and returns_and_allowances >= 0
    and other_business_income >= 0
    and cost_of_goods_sold >= 0
    and advertising_expense >= 0
    and car_and_truck_expense >= 0
    and commissions_and_fees_expense >= 0
    and contract_labor_expense >= 0
    and depreciation_expense >= 0
    and employee_benefit_expense >= 0
    and insurance_expense >= 0
    and interest_expense >= 0
    and legal_and_professional_expense >= 0
    and office_expense >= 0
    and pension_and_profit_sharing_expense >= 0
    and rent_or_lease_expense >= 0
    and repairs_and_maintenance_expense >= 0
    and supplies_expense >= 0
    and taxes_and_licenses_expense >= 0
    and travel_expense >= 0
    and deductible_meals_expense >= 0
    and utilities_expense >= 0
    and wages_expense >= 0
    and other_expense >= 0
  )
);

create index if not exists organizer_businesses_organizer_index
on public.client_tax_organizer_businesses (
  organizer_id, display_order, created_at
);

create index if not exists organizer_businesses_status_index
on public.client_tax_organizer_businesses (
  organizer_id, record_status
);

drop trigger if exists organizer_businesses_set_updated_at
on public.client_tax_organizer_businesses;

create trigger organizer_businesses_set_updated_at
before update on public.client_tax_organizer_businesses
for each row execute function public.set_updated_at();

alter table public.client_tax_organizer_business_responses
enable row level security;
alter table public.client_tax_organizer_business_responses
force row level security;
alter table public.client_tax_organizer_businesses
enable row level security;
alter table public.client_tax_organizer_businesses
force row level security;

revoke all on table public.client_tax_organizer_business_responses
from public, anon, authenticated;
revoke all on table public.client_tax_organizer_businesses
from public, anon, authenticated;

-- Confirm organizer ownership and editability.
create or replace function
public.require_client_business_organizer_access(
  requested_organizer_id uuid,
  requested_require_editable boolean
)
returns public.client_tax_organizers
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_client_id uuid;
  organizer_record public.client_tax_organizers;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  select portal_profile.client_id
  into current_client_id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
    and portal_profile.portal_status = 'active'
  limit 1;

  if current_client_id is null then
    raise exception 'An active client portal profile was not found.';
  end if;

  select tax_organizer.*
  into organizer_record
  from public.client_tax_organizers as tax_organizer
  where tax_organizer.id = requested_organizer_id
    and tax_organizer.client_id = current_client_id;

  if not found then
    raise exception 'The requested tax organizer was not found.';
  end if;

  if requested_require_editable
    and organizer_record.status in (
      'submitted', 'under_review', 'approved'
    )
  then
    raise exception 'This organizer can no longer be edited.';
  end if;

  return organizer_record;
end;
$function$;

revoke all on function
public.require_client_business_organizer_access(uuid, boolean)
from public, anon, authenticated;

-- Recalculate Business section and overall organizer progress.
create or replace function
public.refresh_client_business_organizer_progress(
  requested_organizer_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  saved_at timestamptz := timezone('utc', now());
  has_activity boolean;
  business_count integer;
  complete_count integer;
  next_status public.tax_organizer_section_status;
  next_progress integer;
  completed_sections integer;
  total_sections integer;
begin
  select response.has_business_activity
  into has_activity
  from public.client_tax_organizer_business_responses as response
  where response.organizer_id = requested_organizer_id;

  select
    count(*)::integer,
    count(*) filter (
      where business.record_status = 'complete'
    )::integer
  into business_count, complete_count
  from public.client_tax_organizer_businesses as business
  where business.organizer_id = requested_organizer_id;

  if has_activity is false then
    next_status := 'completed';
    next_progress := 100;
  elsif has_activity is true
    and business_count > 0
    and complete_count = business_count
  then
    next_status := 'completed';
    next_progress := 100;
  elsif has_activity is not null or business_count > 0 then
    next_status := 'in_progress';
    next_progress := case
      when business_count = 0 then 20
      else greatest(
        25,
        round(
          (complete_count::numeric / business_count::numeric) * 100
        )::integer
      )
    end;
  else
    next_status := 'not_started';
    next_progress := 0;
  end if;

  update public.client_tax_organizer_sections as section
  set
    status = next_status,
    progress_percentage = next_progress,
    started_at = case
      when next_status = 'not_started' then null
      else coalesce(section.started_at, saved_at)
    end,
    completed_at = case
      when next_status = 'completed'
      then coalesce(section.completed_at, saved_at)
      else null
    end,
    last_saved_at = case
      when next_status = 'not_started' then section.last_saved_at
      else saved_at
    end,
    updated_at = saved_at
  where section.organizer_id = requested_organizer_id
    and section.section_key = 'business';

  select
    count(*) filter (where section.status = 'completed')::integer,
    count(*)::integer
  into completed_sections, total_sections
  from public.client_tax_organizer_sections as section
  where section.organizer_id = requested_organizer_id;

  update public.client_tax_organizers as organizer
  set
    current_section = case
      when next_status = 'completed' then 'rental'
      else 'business'
    end,
    progress_percentage = case
      when total_sections = 0 then 0
      else round(
        (completed_sections::numeric / total_sections::numeric) * 100
      )::integer
    end,
    started_at = coalesce(organizer.started_at, saved_at),
    last_saved_at = saved_at,
    updated_at = saved_at
  where organizer.id = requested_organizer_id;
end;
$function$;

revoke all on function
public.refresh_client_business_organizer_progress(uuid)
from public, anon, authenticated;

-- Return the yes/no response. Always returns one row.
create or replace function
public.get_client_organizer_business_response(
  requested_organizer_id uuid
)
returns table (
  organizer_id uuid,
  has_business_activity boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, false
  );

  return query
  select
    requested_organizer_id,
    response.has_business_activity,
    response.created_at,
    response.updated_at
  from public.client_tax_organizer_business_responses as response
  where response.organizer_id = requested_organizer_id

  union all

  select
    requested_organizer_id,
    null::boolean,
    null::timestamptz,
    null::timestamptz
  where not exists (
    select 1
    from public.client_tax_organizer_business_responses as existing
    where existing.organizer_id = requested_organizer_id
  )
  limit 1;
end;
$function$;

create or replace function
public.set_client_organizer_business_activity(
  requested_organizer_id uuid,
  requested_has_business_activity boolean
)
returns table (
  organizer_id uuid,
  has_business_activity boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  saved_response public.client_tax_organizer_business_responses;
  saved_at timestamptz := timezone('utc', now());
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  if requested_has_business_activity is null then
    raise exception
      'Select whether you had business or self-employment activity.';
  end if;

  insert into public.client_tax_organizer_business_responses (
    organizer_id,
    has_business_activity,
    created_at,
    updated_at
  )
  values (
    requested_organizer_id,
    requested_has_business_activity,
    saved_at,
    saved_at
  )
  on conflict (organizer_id)
  do update set
    has_business_activity = excluded.has_business_activity,
    updated_at = saved_at
  returning * into saved_response;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_activity_answered',
    'client_tax_organizer',
    requested_organizer_id,
    jsonb_build_object(
      'has_business_activity',
      saved_response.has_business_activity
    ),
    jsonb_build_object('section_key', 'business')
  );

  return query
  select
    saved_response.organizer_id,
    saved_response.has_business_activity,
    saved_response.created_at,
    saved_response.updated_at;
end;
$function$;

create or replace function
public.get_client_organizer_businesses(
  requested_organizer_id uuid
)
returns setof public.client_tax_organizer_businesses
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, false
  );

  return query
  select business.*
  from public.client_tax_organizer_businesses as business
  where business.organizer_id = requested_organizer_id
  order by business.display_order, business.created_at, business.id;
end;
$function$;

-- Payload keys use database snake_case names.
create or replace function
public.create_client_organizer_business(
  requested_organizer_id uuid,
  requested_business jsonb
)
returns setof public.client_tax_organizer_businesses
language plpgsql
security definer
set search_path = ''
as $function$
declare
  saved_at timestamptz := timezone('utc', now());
  next_order integer;
  saved_business public.client_tax_organizer_businesses;
  name_value text;
  dba_value text;
  entity_value text;
  activity_value text;
  active_value boolean;
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  if requested_business is null
    or jsonb_typeof(requested_business) <> 'object'
  then
    raise exception 'Business information is required.';
  end if;

  name_value := trim(coalesce(requested_business->>'business_name', ''));
  dba_value := trim(coalesce(requested_business->>'dba_name', ''));
  entity_value := trim(coalesce(requested_business->>'entity_type', ''));
  activity_value := trim(coalesce(
    requested_business->>'principal_business_activity', ''
  ));
  active_value := case
    when requested_business ? 'was_active_during_tax_year'
    then (requested_business->>'was_active_during_tax_year')::boolean
    else null
  end;

  if name_value = '' and dba_value = '' then
    raise exception 'Enter a business name or DBA.';
  end if;
  if entity_value = '' then
    raise exception 'Select a business entity type.';
  end if;
  if activity_value = '' then
    raise exception 'Enter the principal business activity.';
  end if;
  if active_value is null then
    raise exception
      'Confirm whether the business was active during the tax year.';
  end if;

  select coalesce(max(business.display_order), -1) + 1
  into next_order
  from public.client_tax_organizer_businesses as business
  where business.organizer_id = requested_organizer_id;

  insert into public.client_tax_organizer_businesses
  select
    gen_random_uuid(),
    requested_organizer_id,
    name_value,
    dba_value,
    entity_value,
    trim(coalesce(requested_business->>'employer_identification_number', '')),
    activity_value,
    trim(coalesce(requested_business->>'business_code', '')),
    trim(coalesce(requested_business->>'address_line_1', '')),
    trim(coalesce(requested_business->>'address_line_2', '')),
    trim(coalesce(requested_business->>'city', '')),
    upper(trim(coalesce(requested_business->>'state', ''))),
    trim(coalesce(requested_business->>'postal_code', '')),
    trim(coalesce(nullif(requested_business->>'country', ''), 'United States')),
    nullif(requested_business->>'date_started', '')::date,
    nullif(requested_business->>'date_closed', '')::date,
    nullif(requested_business->>'ownership_percentage', '')::numeric,
    trim(coalesce(requested_business->>'accounting_method', '')),
    active_value,
    (requested_business->>'has_home_office')::boolean,
    (requested_business->>'has_employees')::boolean,
    (requested_business->>'has_inventory')::boolean,
    (requested_business->>'uses_vehicle')::boolean,
    (requested_business->>'bookkeeping_complete')::boolean,
    coalesce((requested_business->>'gross_receipts')::numeric, 0),
    coalesce((requested_business->>'returns_and_allowances')::numeric, 0),
    coalesce((requested_business->>'other_business_income')::numeric, 0),
    coalesce((requested_business->>'cost_of_goods_sold')::numeric, 0),
    coalesce((requested_business->>'advertising_expense')::numeric, 0),
    coalesce((requested_business->>'car_and_truck_expense')::numeric, 0),
    coalesce((requested_business->>'commissions_and_fees_expense')::numeric, 0),
    coalesce((requested_business->>'contract_labor_expense')::numeric, 0),
    coalesce((requested_business->>'depreciation_expense')::numeric, 0),
    coalesce((requested_business->>'employee_benefit_expense')::numeric, 0),
    coalesce((requested_business->>'insurance_expense')::numeric, 0),
    coalesce((requested_business->>'interest_expense')::numeric, 0),
    coalesce((requested_business->>'legal_and_professional_expense')::numeric, 0),
    coalesce((requested_business->>'office_expense')::numeric, 0),
    coalesce((requested_business->>'pension_and_profit_sharing_expense')::numeric, 0),
    coalesce((requested_business->>'rent_or_lease_expense')::numeric, 0),
    coalesce((requested_business->>'repairs_and_maintenance_expense')::numeric, 0),
    coalesce((requested_business->>'supplies_expense')::numeric, 0),
    coalesce((requested_business->>'taxes_and_licenses_expense')::numeric, 0),
    coalesce((requested_business->>'travel_expense')::numeric, 0),
    coalesce((requested_business->>'deductible_meals_expense')::numeric, 0),
    coalesce((requested_business->>'utilities_expense')::numeric, 0),
    coalesce((requested_business->>'wages_expense')::numeric, 0),
    coalesce((requested_business->>'other_expense')::numeric, 0),
    trim(coalesce(requested_business->>'other_expense_description', '')),
    trim(coalesce(requested_business->>'notes', '')),
    'complete',
    next_order,
    saved_at,
    saved_at
  returning * into saved_business;

  insert into public.client_tax_organizer_business_responses (
    organizer_id, has_business_activity, created_at, updated_at
  )
  values (requested_organizer_id, true, saved_at, saved_at)
  on conflict (organizer_id)
  do update set has_business_activity = true, updated_at = saved_at;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_created',
    'client_tax_organizer_business',
    saved_business.id,
    to_jsonb(saved_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return next saved_business;
end;
$function$;

create or replace function
public.update_client_organizer_business(
  requested_organizer_id uuid,
  requested_business_id uuid,
  requested_business jsonb
)
returns setof public.client_tax_organizer_businesses
language plpgsql
security definer
set search_path = ''
as $function$
declare
  old_business public.client_tax_organizer_businesses;
  saved_business public.client_tax_organizer_businesses;
  saved_at timestamptz := timezone('utc', now());
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  select business.*
  into old_business
  from public.client_tax_organizer_businesses as business
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id;

  if not found then
    raise exception 'The requested business record was not found.';
  end if;

  -- Reuse create-style validation by validating the required keys here.
  if trim(coalesce(requested_business->>'business_name', '')) = ''
    and trim(coalesce(requested_business->>'dba_name', '')) = ''
  then
    raise exception 'Enter a business name or DBA.';
  end if;
  if trim(coalesce(requested_business->>'entity_type', '')) = '' then
    raise exception 'Select a business entity type.';
  end if;
  if trim(coalesce(
    requested_business->>'principal_business_activity', ''
  )) = '' then
    raise exception 'Enter the principal business activity.';
  end if;
  if not (requested_business ? 'was_active_during_tax_year') then
    raise exception
      'Confirm whether the business was active during the tax year.';
  end if;

  update public.client_tax_organizer_businesses as business
  set
    business_name = trim(coalesce(requested_business->>'business_name', '')),
    dba_name = trim(coalesce(requested_business->>'dba_name', '')),
    entity_type = trim(coalesce(requested_business->>'entity_type', '')),
    employer_identification_number = trim(coalesce(
      requested_business->>'employer_identification_number', ''
    )),
    principal_business_activity = trim(coalesce(
      requested_business->>'principal_business_activity', ''
    )),
    business_code = trim(coalesce(requested_business->>'business_code', '')),
    address_line_1 = trim(coalesce(requested_business->>'address_line_1', '')),
    address_line_2 = trim(coalesce(requested_business->>'address_line_2', '')),
    city = trim(coalesce(requested_business->>'city', '')),
    state = upper(trim(coalesce(requested_business->>'state', ''))),
    postal_code = trim(coalesce(requested_business->>'postal_code', '')),
    country = trim(coalesce(
      nullif(requested_business->>'country', ''), 'United States'
    )),
    date_started = nullif(requested_business->>'date_started', '')::date,
    date_closed = nullif(requested_business->>'date_closed', '')::date,
    ownership_percentage =
      nullif(requested_business->>'ownership_percentage', '')::numeric,
    accounting_method =
      trim(coalesce(requested_business->>'accounting_method', '')),
    was_active_during_tax_year =
      (requested_business->>'was_active_during_tax_year')::boolean,
    has_home_office = (requested_business->>'has_home_office')::boolean,
    has_employees = (requested_business->>'has_employees')::boolean,
    has_inventory = (requested_business->>'has_inventory')::boolean,
    uses_vehicle = (requested_business->>'uses_vehicle')::boolean,
    bookkeeping_complete =
      (requested_business->>'bookkeeping_complete')::boolean,
    gross_receipts = coalesce((requested_business->>'gross_receipts')::numeric, 0),
    returns_and_allowances =
      coalesce((requested_business->>'returns_and_allowances')::numeric, 0),
    other_business_income =
      coalesce((requested_business->>'other_business_income')::numeric, 0),
    cost_of_goods_sold =
      coalesce((requested_business->>'cost_of_goods_sold')::numeric, 0),
    advertising_expense =
      coalesce((requested_business->>'advertising_expense')::numeric, 0),
    car_and_truck_expense =
      coalesce((requested_business->>'car_and_truck_expense')::numeric, 0),
    commissions_and_fees_expense =
      coalesce((requested_business->>'commissions_and_fees_expense')::numeric, 0),
    contract_labor_expense =
      coalesce((requested_business->>'contract_labor_expense')::numeric, 0),
    depreciation_expense =
      coalesce((requested_business->>'depreciation_expense')::numeric, 0),
    employee_benefit_expense =
      coalesce((requested_business->>'employee_benefit_expense')::numeric, 0),
    insurance_expense =
      coalesce((requested_business->>'insurance_expense')::numeric, 0),
    interest_expense =
      coalesce((requested_business->>'interest_expense')::numeric, 0),
    legal_and_professional_expense =
      coalesce((requested_business->>'legal_and_professional_expense')::numeric, 0),
    office_expense =
      coalesce((requested_business->>'office_expense')::numeric, 0),
    pension_and_profit_sharing_expense =
      coalesce((requested_business->>'pension_and_profit_sharing_expense')::numeric, 0),
    rent_or_lease_expense =
      coalesce((requested_business->>'rent_or_lease_expense')::numeric, 0),
    repairs_and_maintenance_expense =
      coalesce((requested_business->>'repairs_and_maintenance_expense')::numeric, 0),
    supplies_expense =
      coalesce((requested_business->>'supplies_expense')::numeric, 0),
    taxes_and_licenses_expense =
      coalesce((requested_business->>'taxes_and_licenses_expense')::numeric, 0),
    travel_expense =
      coalesce((requested_business->>'travel_expense')::numeric, 0),
    deductible_meals_expense =
      coalesce((requested_business->>'deductible_meals_expense')::numeric, 0),
    utilities_expense =
      coalesce((requested_business->>'utilities_expense')::numeric, 0),
    wages_expense =
      coalesce((requested_business->>'wages_expense')::numeric, 0),
    other_expense =
      coalesce((requested_business->>'other_expense')::numeric, 0),
    other_expense_description = trim(coalesce(
      requested_business->>'other_expense_description', ''
    )),
    notes = trim(coalesce(requested_business->>'notes', '')),
    record_status = 'complete',
    updated_at = saved_at
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id
  returning * into saved_business;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id,
    old_values, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_updated',
    'client_tax_organizer_business',
    saved_business.id,
    to_jsonb(old_business),
    to_jsonb(saved_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return next saved_business;
end;
$function$;

create or replace function
public.delete_client_organizer_business(
  requested_organizer_id uuid,
  requested_business_id uuid
)
returns table (
  deleted_business_id uuid,
  success boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  deleted_business public.client_tax_organizer_businesses;
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  delete from public.client_tax_organizer_businesses as business
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id
  returning * into deleted_business;

  if not found then
    raise exception 'The requested business record was not found.';
  end if;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, old_values, metadata
  )
  values (
    auth.uid(),
    'client_business_deleted',
    'client_tax_organizer_business',
    deleted_business.id,
    to_jsonb(deleted_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return query select deleted_business.id, true;
end;
$function$;

-- RPC privileges
revoke all on function
public.get_client_organizer_business_response(uuid)
from public, anon;
grant execute on function
public.get_client_organizer_business_response(uuid)
to authenticated;

revoke all on function
public.set_client_organizer_business_activity(uuid, boolean)
from public, anon;
grant execute on function
public.set_client_organizer_business_activity(uuid, boolean)
to authenticated;

revoke all on function
public.get_client_organizer_businesses(uuid)
from public, anon;
grant execute on function
public.get_client_organizer_businesses(uuid)
to authenticated;

revoke all on function
public.create_client_organizer_business(uuid, jsonb)
from public, anon;
grant execute on function
public.create_client_organizer_business(uuid, jsonb)
to authenticated;

revoke all on function
public.update_client_organizer_business(uuid, uuid, jsonb)
from public, anon;
grant execute on function
public.update_client_organizer_business(uuid, uuid, jsonb)
to authenticated;

revoke all on function
public.delete_client_organizer_business(uuid, uuid)
from public, anon;
grant execute on function
public.delete_client_organizer_business(uuid, uuid)
to authenticated;

comment on table public.client_tax_organizer_business_responses is
  'Client answer indicating whether the organizer includes business or self-employment activity.';

comment on table public.client_tax_organizer_businesses is
  'Client-entered business organizer records used for staff review and TaxWise preparation.';

commit;