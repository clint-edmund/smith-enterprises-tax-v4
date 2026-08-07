-- ==========================================================
-- Smith Enterprises Tax Management
-- Delete Organizer Dependent
-- ==========================================================

begin;

create or replace function
public.delete_client_organizer_dependent(
  requested_organizer_id uuid,
  requested_dependent_id uuid
)
returns table (
  dependent_id uuid,
  organizer_id uuid,
  dependent_name text,
  remaining_dependent_count integer,
  section_status public.tax_organizer_section_status,
  section_progress_percentage integer,
  organizer_progress_percentage integer,
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

  dependent_record
    public.client_tax_organizer_dependents;

  remaining_count integer;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  calculated_section_status
    public.tax_organizer_section_status;

  calculated_section_progress integer;

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

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_dependents
      as deleted_dependent
  where deleted_dependent.id =
      requested_dependent_id
    and deleted_dependent.organizer_id =
      requested_organizer_id;

  /*
   * Dependent-level vault secrets are removed automatically
   * through the dependent_id foreign key with ON DELETE CASCADE.
   */

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_dependents
    as remaining_dependent
  where remaining_dependent.organizer_id =
    requested_organizer_id;

  calculated_section_status :=
    case
      when remaining_count > 0
      then 'in_progress'
        ::public.tax_organizer_section_status
      else 'not_started'
        ::public.tax_organizer_section_status
    end;

  calculated_section_progress :=
    case
      when remaining_count > 0
      then 50
      else 0
    end;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      calculated_section_status,

    progress_percentage =
      calculated_section_progress,

    started_at =
      case
        when remaining_count > 0
        then coalesce(
          organizer_section.started_at,
          current_deleted_at
        )
        else null
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
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_dependent_id,

    requested_organizer_id,

    concat_ws(
      ' ',
      dependent_record.first_name,
      dependent_record.last_name
    ),

    remaining_count,

    calculated_section_status,

    calculated_section_progress,

    calculated_organizer_progress,

    current_deleted_at;
end;
$function$;

comment on function
public.delete_client_organizer_dependent(
  uuid,
  uuid
)
is
'Deletes a dependent from an editable organizer owned by the authenticated client. Associated dependent-level Secure Vault records are deleted through the dependent foreign-key cascade.';

revoke all
on function
public.delete_client_organizer_dependent(
  uuid,
  uuid
)
from public;

revoke all
on function
public.delete_client_organizer_dependent(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.delete_client_organizer_dependent(
  uuid,
  uuid
)
to authenticated;

commit;