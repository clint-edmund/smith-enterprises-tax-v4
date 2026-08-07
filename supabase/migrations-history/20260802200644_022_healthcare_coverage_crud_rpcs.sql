-- ==========================================================
-- Smith Enterprises Tax Management
-- Healthcare Coverage CRUD RPCs
-- ==========================================================

begin;

-- ==========================================================
-- Get Healthcare Coverages
-- ==========================================================

create or replace function
public.get_client_organizer_healthcare_coverages(
  requested_organizer_id uuid
)
returns table (
  coverage_id uuid,
  organizer_id uuid,
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
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    coverage.id,

    coverage.organizer_id,

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


-- ==========================================================
-- Create Healthcare Coverage
-- ==========================================================

create or replace function
public.create_client_organizer_healthcare_coverage(
  requested_organizer_id uuid,
  requested_provider_name text,
  requested_coverage_type text,
  requested_covered_person_name text,
  requested_policy_number text,
  requested_start_month integer,
  requested_end_month integer,
  requested_is_full_year_coverage boolean,
  requested_document_received boolean,
  requested_document_type text,
  requested_notes text
)
returns table (
  coverage_id uuid,
  organizer_id uuid,
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
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  normalized_start_month integer;
  normalized_end_month integer;
  next_display_order integer;
  new_coverage_id uuid;
  current_saved_at timestamptz;
  required_fields_complete boolean;
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

  if nullif(
    trim(
      requested_provider_name
    ),
    ''
  ) is null then
    raise exception
      'The healthcare provider name is required.';
  end if;

  if nullif(
    trim(
      requested_covered_person_name
    ),
    ''
  ) is null then
    raise exception
      'The covered person name is required.';
  end if;

  if requested_coverage_type not in (
    'employer',
    'marketplace',
    'medicare',
    'medicaid',
    'cobra',
    'private',
    'military',
    'other'
  ) then
    raise exception
      'The selected healthcare coverage type is invalid.';
  end if;

  if requested_document_type is not null
    and trim(requested_document_type) <> ''
    and requested_document_type not in (
      '1095_a',
      '1095_b',
      '1095_c',
      'insurance_card',
      'other'
    )
  then
    raise exception
      'The selected healthcare document type is invalid.';
  end if;

  if requested_is_full_year_coverage then
    normalized_start_month :=
      1;

    normalized_end_month :=
      12;
  else
    normalized_start_month :=
      requested_start_month;

    normalized_end_month :=
      requested_end_month;
  end if;

  if normalized_start_month is not null
    and normalized_start_month not between 1 and 12
  then
    raise exception
      'The coverage start month is invalid.';
  end if;

  if normalized_end_month is not null
    and normalized_end_month not between 1 and 12
  then
    raise exception
      'The coverage end month is invalid.';
  end if;

  if normalized_start_month is not null
    and normalized_end_month is not null
    and normalized_start_month >
      normalized_end_month
  then
    raise exception
      'The coverage start month cannot be after the end month.';
  end if;

  current_saved_at :=
    now();

  required_fields_complete :=
    nullif(
      trim(
        requested_provider_name
      ),
      ''
    ) is not null
    and nullif(
      trim(
        requested_covered_person_name
      ),
      ''
    ) is not null
    and (
      requested_is_full_year_coverage
      or (
        normalized_start_month is not null
        and normalized_end_month is not null
      )
    )
    and coalesce(
      requested_document_received,
      false
    );

  select
    coalesce(
      max(
        coverage.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_healthcare_coverages (
      organizer_id,
      provider_name,
      coverage_type,
      covered_person_name,
      policy_number,
      start_month,
      end_month,
      is_full_year_coverage,
      document_received,
      document_type,
      notes,
      record_status,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    trim(
      requested_provider_name
    ),

    requested_coverage_type,

    trim(
      requested_covered_person_name
    ),

    nullif(
      trim(
        requested_policy_number
      ),
      ''
    ),

    normalized_start_month,

    normalized_end_month,

    coalesce(
      requested_is_full_year_coverage,
      false
    ),

    coalesce(
      requested_document_received,
      false
    ),

    nullif(
      trim(
        requested_document_type
      ),
      ''
    ),

    nullif(
      trim(
        requested_notes
      ),
      ''
    ),

    case
      when required_fields_complete
      then 'complete'
      else 'draft'
    end,

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_coverage_id;

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
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    status =
      case
        when tax_organizer.status =
          'not_started'
        then
          'in_progress'
            ::public.tax_organizer_status
        else
          tax_organizer.status
      end,

    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    started_at =
      coalesce(
        tax_organizer.started_at,
        current_saved_at
      ),

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    coverage.id,

    coverage.organizer_id,

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

  where coverage.id =
    new_coverage_id;
end;
$function$;


-- ==========================================================
-- Update Healthcare Coverage
-- ==========================================================

create or replace function
public.update_client_organizer_healthcare_coverage(
  requested_organizer_id uuid,
  requested_coverage_id uuid,
  requested_provider_name text,
  requested_coverage_type text,
  requested_covered_person_name text,
  requested_policy_number text,
  requested_start_month integer,
  requested_end_month integer,
  requested_is_full_year_coverage boolean,
  requested_document_received boolean,
  requested_document_type text,
  requested_notes text
)
returns table (
  coverage_id uuid,
  organizer_id uuid,
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
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  normalized_start_month integer;
  normalized_end_month integer;
  current_saved_at timestamptz;
  required_fields_complete boolean;
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

  if requested_coverage_id is null then
    raise exception
      'A healthcare coverage identifier is required.';
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
    from public.client_tax_organizer_healthcare_coverages
      as coverage
    where coverage.id =
        requested_coverage_id
      and coverage.organizer_id =
        requested_organizer_id
  ) then
    raise exception
      'The requested healthcare coverage was not found.';
  end if;

  if nullif(
    trim(
      requested_provider_name
    ),
    ''
  ) is null then
    raise exception
      'The healthcare provider name is required.';
  end if;

  if nullif(
    trim(
      requested_covered_person_name
    ),
    ''
  ) is null then
    raise exception
      'The covered person name is required.';
  end if;

  if requested_coverage_type not in (
    'employer',
    'marketplace',
    'medicare',
    'medicaid',
    'cobra',
    'private',
    'military',
    'other'
  ) then
    raise exception
      'The selected healthcare coverage type is invalid.';
  end if;

  if requested_document_type is not null
    and trim(requested_document_type) <> ''
    and requested_document_type not in (
      '1095_a',
      '1095_b',
      '1095_c',
      'insurance_card',
      'other'
    )
  then
    raise exception
      'The selected healthcare document type is invalid.';
  end if;

  if requested_is_full_year_coverage then
    normalized_start_month :=
      1;

    normalized_end_month :=
      12;
  else
    normalized_start_month :=
      requested_start_month;

    normalized_end_month :=
      requested_end_month;
  end if;

  if normalized_start_month is not null
    and normalized_start_month not between 1 and 12
  then
    raise exception
      'The coverage start month is invalid.';
  end if;

  if normalized_end_month is not null
    and normalized_end_month not between 1 and 12
  then
    raise exception
      'The coverage end month is invalid.';
  end if;

  if normalized_start_month is not null
    and normalized_end_month is not null
    and normalized_start_month >
      normalized_end_month
  then
    raise exception
      'The coverage start month cannot be after the end month.';
  end if;

  current_saved_at :=
    now();

  required_fields_complete :=
    (
      requested_is_full_year_coverage
      or (
        normalized_start_month is not null
        and normalized_end_month is not null
      )
    )
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_healthcare_coverages
    as coverage
  set
    provider_name =
      trim(
        requested_provider_name
      ),

    coverage_type =
      requested_coverage_type,

    covered_person_name =
      trim(
        requested_covered_person_name
      ),

    policy_number =
      nullif(
        trim(
          requested_policy_number
        ),
        ''
      ),

    start_month =
      normalized_start_month,

    end_month =
      normalized_end_month,

    is_full_year_coverage =
      coalesce(
        requested_is_full_year_coverage,
        false
      ),

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    document_type =
      nullif(
        trim(
          requested_document_type
        ),
        ''
      ),

    notes =
      nullif(
        trim(
          requested_notes
        ),
        ''
      ),

    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    updated_at =
      current_saved_at

  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
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
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    coverage.id,

    coverage.organizer_id,

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

  where coverage.id =
    requested_coverage_id;
end;
$function$;


-- ==========================================================
-- Delete Healthcare Coverage
-- ==========================================================

create or replace function
public.delete_client_organizer_healthcare_coverage(
  requested_organizer_id uuid,
  requested_coverage_id uuid
)
returns table (
  coverage_id uuid,
  organizer_id uuid,
  provider_name text,
  remaining_coverage_count integer,
  deleted_at timestamptz
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

  coverage_record
    public.client_tax_organizer_healthcare_coverages;

  remaining_count integer;
  current_deleted_at timestamptz;
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

  if requested_coverage_id is null then
    raise exception
      'A healthcare coverage identifier is required.';
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

  select
    coverage.*
  into
    coverage_record
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested healthcare coverage was not found.';
  end if;

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_healthcare_coverages
      as coverage
  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
      requested_organizer_id;

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_healthcare_coverages
    as remaining_coverage
  where remaining_coverage.organizer_id =
    requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when remaining_count = 0
        then
          'not_started'
            ::public.tax_organizer_section_status
        else
          'in_progress'
            ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when remaining_count = 0
        then 0
        else greatest(
          organizer_section.progress_percentage,
          25
        )
      end,

    started_at =
      case
        when remaining_count = 0
        then null
        else organizer_section.started_at
      end,

    completed_at =
      null,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_coverage_id,

    requested_organizer_id,

    coverage_record.provider_name,

    remaining_count,

    current_deleted_at;
end;
$function$;


-- ==========================================================
-- Function Comments
-- ==========================================================

comment on function
public.get_client_organizer_healthcare_coverages(uuid)
is
'Returns healthcare coverage records owned by the authenticated client.';

comment on function
public.create_client_organizer_healthcare_coverage(
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
is
'Creates a healthcare coverage record owned by the authenticated client.';

comment on function
public.update_client_organizer_healthcare_coverage(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
is
'Updates a healthcare coverage record owned by the authenticated client.';

comment on function
public.delete_client_organizer_healthcare_coverage(
  uuid,
  uuid
)
is
'Deletes a healthcare coverage record owned by the authenticated client.';


-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function
public.get_client_organizer_healthcare_coverages(uuid)
from public;

revoke all
on function
public.get_client_organizer_healthcare_coverages(uuid)
from anon;

grant execute
on function
public.get_client_organizer_healthcare_coverages(uuid)
to authenticated;


revoke all
on function
public.create_client_organizer_healthcare_coverage(
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
from public;

revoke all
on function
public.create_client_organizer_healthcare_coverage(
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
from anon;

grant execute
on function
public.create_client_organizer_healthcare_coverage(
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
to authenticated;


revoke all
on function
public.update_client_organizer_healthcare_coverage(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
from public;

revoke all
on function
public.update_client_organizer_healthcare_coverage(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
from anon;

grant execute
on function
public.update_client_organizer_healthcare_coverage(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  boolean,
  text,
  text
)
to authenticated;


revoke all
on function
public.delete_client_organizer_healthcare_coverage(
  uuid,
  uuid
)
from public;

revoke all
on function
public.delete_client_organizer_healthcare_coverage(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.delete_client_organizer_healthcare_coverage(
  uuid,
  uuid
)
to authenticated;

commit;