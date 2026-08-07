-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer W-2 Read and Save RPCs
-- ==========================================================

begin;

-- ==========================================================
-- Get W-2 Details
-- ==========================================================

create or replace function
public.get_client_organizer_income_w2_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid
)
returns table (
  income_source_id uuid,
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
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        'w2'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested W-2 income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

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

    w2.created_at,

    w2.updated_at

  from (
    select
      stored_w2.employer_identification_number,
      stored_w2.wages,
      stored_w2.federal_income_tax_withheld,
      stored_w2.social_security_wages,
      stored_w2.social_security_tax_withheld,
      stored_w2.medicare_wages,
      stored_w2.medicare_tax_withheld,
      stored_w2.state_code,
      stored_w2.state_wages,
      stored_w2.state_income_tax_withheld,
      stored_w2.local_wages,
      stored_w2.local_income_tax_withheld,
      stored_w2.created_at,
      stored_w2.updated_at
    from public.client_tax_organizer_income_w2_details
      as stored_w2
    where stored_w2.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_w2_details
        as existing_w2
      where existing_w2.income_source_id =
        requested_income_source_id
    )
  ) as w2

  limit 1;
end;
$function$;


-- ==========================================================
-- Save W-2 Details
-- ==========================================================

create or replace function
public.save_client_organizer_income_w2_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid,
  requested_employer_identification_number text,
  requested_wages numeric,
  requested_federal_income_tax_withheld numeric,
  requested_social_security_wages numeric,
  requested_social_security_tax_withheld numeric,
  requested_medicare_wages numeric,
  requested_medicare_tax_withheld numeric,
  requested_state_code text,
  requested_state_wages numeric,
  requested_state_income_tax_withheld numeric,
  requested_local_wages numeric,
  requested_local_income_tax_withheld numeric,
  requested_document_received boolean
)
returns table (
  income_source_id uuid,
  organizer_id uuid,
  income_type text,
  payer_name text,
  recipient_type text,
  record_status text,
  document_received boolean,
  notes text,
  display_order integer,
  income_created_at timestamptz,
  income_updated_at timestamptz,
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
  w2_created_at timestamptz,
  w2_updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        'w2'
  ) then
    raise exception
      'The requested W-2 income source was not found.';
  end if;

  if requested_employer_identification_number
      is not null
    and trim(
      requested_employer_identification_number
    ) <> ''
    and trim(
      requested_employer_identification_number
    ) !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The employer identification number is invalid.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(
      trim(requested_state_code)
    ) !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_wages is not null
    and requested_wages < 0
  then
    raise exception
      'Wages cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_social_security_wages is not null
    and requested_social_security_wages < 0
  then
    raise exception
      'Social Security wages cannot be negative.';
  end if;

  if requested_social_security_tax_withheld is not null
    and requested_social_security_tax_withheld < 0
  then
    raise exception
      'Social Security tax withheld cannot be negative.';
  end if;

  if requested_medicare_wages is not null
    and requested_medicare_wages < 0
  then
    raise exception
      'Medicare wages cannot be negative.';
  end if;

  if requested_medicare_tax_withheld is not null
    and requested_medicare_tax_withheld < 0
  then
    raise exception
      'Medicare tax withheld cannot be negative.';
  end if;

  if requested_state_wages is not null
    and requested_state_wages < 0
  then
    raise exception
      'State wages cannot be negative.';
  end if;

  if requested_state_income_tax_withheld is not null
    and requested_state_income_tax_withheld < 0
  then
    raise exception
      'State income tax withheld cannot be negative.';
  end if;

  if requested_local_wages is not null
    and requested_local_wages < 0
  then
    raise exception
      'Local wages cannot be negative.';
  end if;

  if requested_local_income_tax_withheld is not null
    and requested_local_income_tax_withheld < 0
  then
    raise exception
      'Local income tax withheld cannot be negative.';
  end if;

  current_saved_at :=
    now();

  insert into
    public.client_tax_organizer_income_w2_details (
      income_source_id,
      employer_identification_number,
      wages,
      federal_income_tax_withheld,
      social_security_wages,
      social_security_tax_withheld,
      medicare_wages,
      medicare_tax_withheld,
      state_code,
      state_wages,
      state_income_tax_withheld,
      local_wages,
      local_income_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,

    nullif(
      trim(
        requested_employer_identification_number
      ),
      ''
    ),

    requested_wages,

    requested_federal_income_tax_withheld,

    requested_social_security_wages,

    requested_social_security_tax_withheld,

    requested_medicare_wages,

    requested_medicare_tax_withheld,

    nullif(
      upper(
        trim(
          requested_state_code
        )
      ),
      ''
    ),

    requested_state_wages,

    requested_state_income_tax_withheld,

    requested_local_wages,

    requested_local_income_tax_withheld,

    current_saved_at,

    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_w2_details_pkey
  do update
  set
    employer_identification_number =
      excluded.employer_identification_number,

    wages =
      excluded.wages,

    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,

    social_security_wages =
      excluded.social_security_wages,

    social_security_tax_withheld =
      excluded.social_security_tax_withheld,

    medicare_wages =
      excluded.medicare_wages,

    medicare_tax_withheld =
      excluded.medicare_tax_withheld,

    state_code =
      excluded.state_code,

    state_wages =
      excluded.state_wages,

    state_income_tax_withheld =
      excluded.state_income_tax_withheld,

    local_wages =
      excluded.local_wages,

    local_income_tax_withheld =
      excluded.local_income_tax_withheld,

    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_wages is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at
  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,

    income_source.organizer_id,

    income_source.income_type,

    income_source.payer_name,

    income_source.recipient_type,

    income_source.record_status,

    income_source.document_received,

    income_source.notes,

    income_source.display_order,

    income_source.created_at,

    income_source.updated_at,

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

    w2.created_at,

    w2.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_w2_details
    as w2
    on w2.income_source_id =
      income_source.id

  where income_source.id =
    requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$function$;


-- ==========================================================
-- Comments and Permissions
-- ==========================================================

comment on function
public.get_client_organizer_income_w2_details(
  uuid,
  uuid
)
is
'Returns non-sensitive W-2 detail values for an organizer income source owned by the authenticated client.';

comment on function
public.save_client_organizer_income_w2_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  boolean
)
is
'Creates or updates non-sensitive W-2 detail values for an organizer income source owned by the authenticated client.';


revoke all
on function
public.get_client_organizer_income_w2_details(
  uuid,
  uuid
)
from public;

revoke all
on function
public.get_client_organizer_income_w2_details(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.get_client_organizer_income_w2_details(
  uuid,
  uuid
)
to authenticated;


revoke all
on function
public.save_client_organizer_income_w2_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  boolean
)
from public;

revoke all
on function
public.save_client_organizer_income_w2_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  boolean
)
from anon;

grant execute
on function
public.save_client_organizer_income_w2_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  boolean
)
to authenticated;

commit;