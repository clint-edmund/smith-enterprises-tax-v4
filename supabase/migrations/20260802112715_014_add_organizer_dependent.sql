-- ==========================================================
-- Smith Enterprises Tax Management
-- Add Organizer Dependent
-- ==========================================================

begin;

create or replace function
public.add_client_organizer_dependent(
  requested_organizer_id uuid,
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

  new_dependent_id uuid;
  next_display_order integer;

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

  if nullif(
    trim(
      requested_relationship
    ),
    ''
  ) is null then
    raise exception
      'The dependent relationship is required.';
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

  select
    coalesce(
      max(
        dependent_record.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_dependents (
      organizer_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      relationship,
      birth_date,
      is_full_time_student,
      is_permanently_disabled,
      lived_with_taxpayer_all_year,
      months_lived_with_taxpayer,
      us_citizen_or_resident,
      claimed_by_another_taxpayer,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    trim(
      requested_first_name
    ),

    nullif(
      trim(
        requested_middle_name
      ),
      ''
    ),

    trim(
      requested_last_name
    ),

    nullif(
      trim(
        requested_suffix
      ),
      ''
    ),

    trim(
      requested_relationship
    ),

    requested_birth_date,

    coalesce(
      requested_is_full_time_student,
      false
    ),

    coalesce(
      requested_is_permanently_disabled,
      false
    ),

    coalesce(
      requested_lived_with_taxpayer_all_year,
      false
    ),

    requested_months_lived_with_taxpayer,

    coalesce(
      requested_us_citizen_or_resident,
      true
    ),

    coalesce(
      requested_claimed_by_another_taxpayer,
      false
    ),

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_dependent_id;

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
    status =
      case
        when tax_organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else tax_organizer.status
      end,

    current_section =
      'dependents'
        ::public.tax_organizer_section_key,

    progress_percentage =
      calculated_organizer_progress,

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
    dependent_record.id,

    dependent_record.organizer_id,

    dependent_record.first_name,

    dependent_record.middle_name,

    dependent_record.last_name,

    dependent_record.suffix,

    dependent_record.relationship,

    dependent_record.birth_date,

    dependent_record.is_full_time_student,

    dependent_record.is_permanently_disabled,

    dependent_record.lived_with_taxpayer_all_year,

    dependent_record.months_lived_with_taxpayer,

    dependent_record.us_citizen_or_resident,

    dependent_record.claimed_by_another_taxpayer,

    dependent_record.display_order,

    'in_progress'
      ::public.tax_organizer_section_status,

    50,

    calculated_organizer_progress,

    dependent_record.created_at,

    dependent_record.updated_at
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.id =
    new_dependent_id;
end;
$function$;

comment on function
public.add_client_organizer_dependent(
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
'Adds a non-sensitive dependent record to an editable tax organizer owned by the authenticated client. Protected identifiers must be stored separately in the Secure Vault.';

revoke all
on function
public.add_client_organizer_dependent(
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
public.add_client_organizer_dependent(
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
public.add_client_organizer_dependent(
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