-- ==========================================================
-- Smith Enterprises Tax Management
-- Get Organizer Dependents
-- ==========================================================

begin;

create or replace function
public.get_client_organizer_dependents(
  requested_organizer_id uuid
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

    dependent_record.created_at,

    dependent_record.updated_at
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.organizer_id =
    requested_organizer_id
  order by
    dependent_record.display_order,
    dependent_record.created_at,
    dependent_record.id;
end;
$function$;

comment on function
public.get_client_organizer_dependents(uuid)
is
'Returns non-sensitive dependents for a tax organizer owned by the authenticated client. Protected identifiers remain in the Secure Vault.';

revoke all
on function
public.get_client_organizer_dependents(uuid)
from public;

revoke all
on function
public.get_client_organizer_dependents(uuid)
from anon;

grant execute
on function
public.get_client_organizer_dependents(uuid)
to authenticated;

commit;