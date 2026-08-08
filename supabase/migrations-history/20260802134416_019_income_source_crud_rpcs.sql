-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Income Source CRUD RPCs
-- ==========================================================

begin;

-- ==========================================================
-- Create Income Source
-- ==========================================================

create or replace function
public.create_client_organizer_income_source(
  requested_organizer_id uuid,
  requested_income_type text,
  requested_payer_name text,
  requested_recipient_type text,
  requested_notes text
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

  new_income_source_id uuid;
  next_display_order integer;
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

  if requested_income_type not in (
    'w2',
    '1099_nec',
    '1099_misc',
    '1099_k',
    '1099_int',
    '1099_div',
    '1099_r',
    'ssa_1099',
    '1099_g',
    'other'
  ) then
    raise exception
      'The selected income type is invalid.';
  end if;

  if nullif(
    trim(
      requested_payer_name
    ),
    ''
  ) is null then
    raise exception
      'The payer or employer name is required.';
  end if;

  if requested_recipient_type not in (
    'taxpayer',
    'spouse',
    'dependent',
    'joint'
  ) then
    raise exception
      'The selected recipient type is invalid.';
  end if;

  current_saved_at :=
    now();

  select
    coalesce(
      max(
        income_source.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_income_sources (
      organizer_id,
      income_type,
      payer_name,
      recipient_type,
      record_status,
      document_received,
      notes,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    requested_income_type,

    trim(
      requested_payer_name
    ),

    requested_recipient_type,

    'draft',

    false,

    nullif(
      trim(
        requested_notes
      ),
      ''
    ),

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_income_source_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        25
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
    status =
      case
        when tax_organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else tax_organizer.status
      end,

    current_section =
      'income'
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

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.id =
    new_income_source_id;
end;
$function$;


-- ==========================================================
-- Get Income Sources
-- ==========================================================

create or replace function
public.get_client_organizer_income_sources(
  requested_organizer_id uuid
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

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.organizer_id =
    requested_organizer_id
  order by
    income_source.display_order,
    income_source.created_at,
    income_source.id;
end;
$function$;


-- ==========================================================
-- Update Income Source
-- ==========================================================

create or replace function
public.update_client_organizer_income_source(
  requested_organizer_id uuid,
  requested_income_source_id uuid,
  requested_payer_name text,
  requested_recipient_type text,
  requested_record_status text,
  requested_document_received boolean,
  requested_notes text
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
  ) then
    raise exception
      'The requested income source was not found.';
  end if;

  if nullif(
    trim(
      requested_payer_name
    ),
    ''
  ) is null then
    raise exception
      'The payer or employer name is required.';
  end if;

  if requested_recipient_type not in (
    'taxpayer',
    'spouse',
    'dependent',
    'joint'
  ) then
    raise exception
      'The selected recipient type is invalid.';
  end if;

  if requested_record_status not in (
    'draft',
    'complete',
    'needs_review'
  ) then
    raise exception
      'The selected income status is invalid.';
  end if;

  current_saved_at :=
    now();

  update public.client_tax_organizer_income_sources
    as income_source
  set
    payer_name =
      trim(
        requested_payer_name
      ),

    recipient_type =
      requested_recipient_type,

    record_status =
      requested_record_status,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    notes =
      nullif(
        trim(
          requested_notes
        ),
        ''
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
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

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.id =
    requested_income_source_id;
end;
$function$;


-- ==========================================================
-- Delete Income Source
-- ==========================================================

create or replace function
public.delete_client_organizer_income_source(
  requested_organizer_id uuid,
  requested_income_source_id uuid
)
returns table (
  income_source_id uuid,
  organizer_id uuid,
  payer_name text,
  remaining_income_source_count integer,
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

  income_source_record
    public.client_tax_organizer_income_sources;

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

  select
    existing_income_source.*
  into
    income_source_record
  from public.client_tax_organizer_income_sources
    as existing_income_source
  where existing_income_source.id =
      requested_income_source_id
    and existing_income_source.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested income source was not found.';
  end if;

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_income_sources
      as deleted_income_source
  where deleted_income_source.id =
      requested_income_source_id
    and deleted_income_source.organizer_id =
      requested_organizer_id;

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_income_sources
    as remaining_income_source
  where remaining_income_source.organizer_id =
    requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when remaining_count = 0
        then 'not_started'
          ::public.tax_organizer_section_status
        else 'in_progress'
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
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_income_source_id,

    requested_organizer_id,

    income_source_record.payer_name,

    remaining_count,

    current_deleted_at;
end;
$function$;


-- ==========================================================
-- Comments
-- ==========================================================

comment on function
public.create_client_organizer_income_source(
  uuid,
  text,
  text,
  text,
  text
)
is
'Creates a common organizer income-source record owned by the authenticated client. Type-specific values are stored separately.';

comment on function
public.get_client_organizer_income_sources(uuid)
is
'Returns all common organizer income-source records owned by the authenticated client.';

comment on function
public.update_client_organizer_income_source(
  uuid,
  uuid,
  text,
  text,
  text,
  boolean,
  text
)
is
'Updates common non-sensitive fields for an organizer income source owned by the authenticated client.';

comment on function
public.delete_client_organizer_income_source(
  uuid,
  uuid
)
is
'Deletes an organizer income source owned by the authenticated client. Type-specific detail rows are removed through cascading foreign keys.';


-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function
public.create_client_organizer_income_source(
  uuid,
  text,
  text,
  text,
  text
)
from public;

revoke all
on function
public.create_client_organizer_income_source(
  uuid,
  text,
  text,
  text,
  text
)
from anon;

grant execute
on function
public.create_client_organizer_income_source(
  uuid,
  text,
  text,
  text,
  text
)
to authenticated;


revoke all
on function
public.get_client_organizer_income_sources(uuid)
from public;

revoke all
on function
public.get_client_organizer_income_sources(uuid)
from anon;

grant execute
on function
public.get_client_organizer_income_sources(uuid)
to authenticated;


revoke all
on function
public.update_client_organizer_income_source(
  uuid,
  uuid,
  text,
  text,
  text,
  boolean,
  text
)
from public;

revoke all
on function
public.update_client_organizer_income_source(
  uuid,
  uuid,
  text,
  text,
  text,
  boolean,
  text
)
from anon;

grant execute
on function
public.update_client_organizer_income_source(
  uuid,
  uuid,
  text,
  text,
  text,
  boolean,
  text
)
to authenticated;


revoke all
on function
public.delete_client_organizer_income_source(
  uuid,
  uuid
)
from public;

revoke all
on function
public.delete_client_organizer_income_source(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.delete_client_organizer_income_source(
  uuid,
  uuid
)
to authenticated;

commit;