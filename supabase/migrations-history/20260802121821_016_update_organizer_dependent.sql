-- ==========================================================
-- Smith Enterprises Tax Management
-- Update Organizer Dependent
-- ==========================================================

begin;

create or replace function
public.update_client_organizer_dependent(
  requested_organizer_id uuid,
  requested_dependent_id uuid,
  requested_first_name text,
  requested_middle_name text,
  requested_last_name text,
  requested_suffix text,
  requested_relationship text,
  requested_birth_date date,
  requested_is_full_time_student boolean,
  requested_is_permanently_disabled boolean,
  requested_lived_with_taxpayer_all_year boolean,
  requested_months_lived_with_taxpayer smallint,
  requested_us_citizen_or_resident boolean,
  requested_claimed_by_another_taxpayer boolean
)
returns table (
  dependent_id uuid,
  organizer_id uuid,
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
  section_status public.tax_organizer_section_status,
  section_progress_percentage integer,
  organizer_progress_percentage integer,
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

  dependent_record
    public.client_tax_organizer_dependents;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

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

  if requested_dependent_id is null then
    raise exception
      'A dependent identifier is required.';
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
    existing_dependent.*
  into
    dependent_record
  from public.client_tax_organizer_dependents
    as existing_dependent
  where existing_dependent.id =
      requested_dependent_id
    and existing_dependent.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested dependent was not found.';
  end if;

  if nullif(
    trim(
      requested_first_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent first name is required.';
  end if;

  if nullif(
    trim(
      requested_last_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent last name is required.';
  end if;

  if requested_relationship not in (
    'son',
    'daughter',
    'stepson',
    'stepdaughter',
    'foster_child',
    'brother',
    'sister',
    'stepbrother',
    'stepsister',
    'half_brother',
    'half_sister',
    'grandchild',
    'parent',
    'grandparent',
    'niece',
    'nephew',
    'other_relative',
    'non_relative'
  ) then
    raise exception
      'The selected dependent relationship is invalid.';
  end if;

  if requested_birth_date is null then
    raise exception
      'The dependent date of birth is required.';
  end if;

  if requested_birth_date >
      current_date then
    raise exception
      'The dependent date of birth cannot be in the future.';
  end if;

  if requested_months_lived_with_taxpayer
      is null
    or requested_months_lived_with_taxpayer
      not between 0 and 12
  then
    raise exception
      'Months lived with the taxpayer must be between 0 and 12.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = true
    and requested_months_lived_with_taxpayer <> 12
  ) then
    raise exception
      'A dependent who lived with the taxpayer all year must have 12 months recorded.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = false
    and requested_months_lived_with_taxpayer = 12
  ) then
    raise exception
      'Select lived all year when 12 months are recorded.';
  end if;

  current_saved_at :=
    now();

  update
    public.client_tax_organizer_dependents
      as updated_dependent
  set
    first_name =
      trim(
        requested_first_name
      ),

    middle_name =
      nullif(
        trim(
          requested_middle_name
        ),
        ''
      ),

    last_name =
      trim(
        requested_last_name
      ),

    suffix =
      nullif(
        trim(
          requested_suffix
        ),
        ''
      ),

    relationship =
      trim(
        requested_relationship
      ),

    birth_date =
      requested_birth_date,

    is_full_time_student =
      coalesce(
        requested_is_full_time_student,
        false
      ),

    is_permanently_disabled =
      coalesce(
        requested_is_permanently_disabled,
        false
      ),

    lived_with_taxpayer_all_year =
      coalesce(
        requested_lived_with_taxpayer_all_year,
        false
      ),

    months_lived_with_taxpayer =
      requested_months_lived_with_taxpayer,

    us_citizen_or_resident =
      coalesce(
        requested_us_citizen_or_resident,
        true
      ),

    claimed_by_another_taxpayer =
      coalesce(
        requested_claimed_by_another_taxpayer,
        false
      ),

    updated_at =
      current_saved_at

  where updated_dependent.id =
      requested_dependent_id
    and updated_dependent.organizer_id =
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
        50
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
      'dependents';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'dependents'
        ::public.tax_organizer_section_key,

    progress_percentage =
      calculated_organizer_progress,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    saved_dependent.id,

    saved_dependent.organizer_id,

    saved_dependent.first_name,

    saved_dependent.middle_name,

    saved_dependent.last_name,

    saved_dependent.suffix,

    saved_dependent.relationship,

    saved_dependent.birth_date,

    saved_dependent.is_full_time_student,

    saved_dependent.is_permanently_disabled,

    saved_dependent.lived_with_taxpayer_all_year,

    saved_dependent.months_lived_with_taxpayer,

    saved_dependent.us_citizen_or_resident,

    saved_dependent.claimed_by_another_taxpayer,

    saved_dependent.display_order,

    'in_progress'
      ::public.tax_organizer_section_status,

    50,

    calculated_organizer_progress,

    saved_dependent.created_at,

    saved_dependent.updated_at
  from public.client_tax_organizer_dependents
    as saved_dependent
  where saved_dependent.id =
    requested_dependent_id;
end;
$function$;

comment on function
public.update_client_organizer_dependent(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  date,
  boolean,
  boolean,
  boolean,
  smallint,
  boolean,
  boolean
)
is
'Updates a non-sensitive dependent owned by the authenticated client. Protected identifiers remain in the Secure Vault.';

revoke all
on function
public.update_client_organizer_dependent(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  date,
  boolean,
  boolean,
  boolean,
  smallint,
  boolean,
  boolean
)
from public;

revoke all
on function
public.update_client_organizer_dependent(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  date,
  boolean,
  boolean,
  boolean,
  smallint,
  boolean,
  boolean
)
from anon;

grant execute
on function
public.update_client_organizer_dependent(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  date,
  boolean,
  boolean,
  boolean,
  smallint,
  boolean,
  boolean
)
to authenticated;

commit;