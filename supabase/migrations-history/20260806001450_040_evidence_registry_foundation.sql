-- ==========================================================
-- Smith Enterprises Tax Management
-- Release 0.10 — Sprint 0.10.1A
-- Shared Evidence Registry Database Foundation
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- Evidence sources represent the business meaning and
-- verification state of supporting information.
--
-- A source may reference an existing uploaded document or may
-- represent non-file evidence such as a phone confirmation.
-- ----------------------------------------------------------

create table if not exists
public.organizer_evidence_sources (
  id uuid primary key
    default gen_random_uuid(),

  organizer_id uuid not null
    references public.client_tax_organizers(id)
    on delete cascade,

  return_id uuid
    references public.tax_returns(id)
    on delete set null,

  document_id uuid,

  evidence_type text not null,

  title text not null,

  description text,

  confidence text not null
    default 'unverified',

  verification_status text not null
    default 'unverified',

  created_by uuid
    references public.profiles(id)
    on delete set null,

  verified_by uuid
    references public.profiles(id)
    on delete set null,

  verified_at timestamptz,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint organizer_evidence_type_required
    check (
      char_length(
        trim(evidence_type)
      ) > 0
    ),

  constraint organizer_evidence_title_required
    check (
      char_length(
        trim(title)
      ) > 0
    ),

  constraint organizer_evidence_confidence_valid
    check (
      confidence in (
        'high',
        'medium',
        'low',
        'unverified'
      )
    ),

  constraint organizer_evidence_status_valid
    check (
      verification_status in (
        'unverified',
        'under_review',
        'verified',
        'rejected',
        'needs_replacement'
      )
    ),

  constraint organizer_evidence_verification_valid
    check (
      (
        verification_status <> 'verified'
      )
      or
      (
        verified_by is not null
        and verified_at is not null
      )
    )
);

-- ----------------------------------------------------------
-- Evidence links connect one evidence source to one or more
-- organizer fields or review subjects.
-- ----------------------------------------------------------

create table if not exists
public.organizer_evidence_links (
  id uuid primary key
    default gen_random_uuid(),

  evidence_id uuid not null
    references public.organizer_evidence_sources(id)
    on delete cascade,

  organizer_id uuid not null
    references public.client_tax_organizers(id)
    on delete cascade,

  section_key text not null,

  subject_type text not null,

  subject_id uuid not null,

  field_key text,

  link_type text not null
    default 'supports',

  notes text,

  linked_by uuid
    references public.profiles(id)
    on delete set null,

  linked_at timestamptz not null
    default timezone('utc', now()),

  created_at timestamptz not null
    default timezone('utc', now()),

  constraint organizer_evidence_link_section_valid
    check (
      section_key in (
        'personal_information',
        'filing_status',
        'dependents',
        'income',
        'healthcare',
        'deductions',
        'credits',
        'business',
        'investments',
        'banking',
        'documents',
        'final_review'
      )
    ),

  constraint organizer_evidence_link_subject_valid
    check (
      subject_type in (
        'organizer',
        'personal_information',
        'filing_status',
        'dependent',
        'income_source',
        'healthcare_record',
        'deduction',
        'credit',
        'business_record',
        'investment_record',
        'banking_record',
        'document'
      )
    ),

  constraint organizer_evidence_link_field_valid
    check (
      field_key is null
      or field_key ~ '^[a-z][a-z0-9_]*$'
    ),

  constraint organizer_evidence_link_type_valid
    check (
      link_type in (
        'supports',
        'contradicts',
        'replaces',
        'reference'
      )
    ),

  constraint organizer_evidence_link_notes_length
    check (
      notes is null
      or char_length(notes) <= 5000
    ),

  constraint organizer_evidence_link_unique
    unique (
      evidence_id,
      section_key,
      subject_type,
      subject_id,
      field_key,
      link_type
    )
);

-- ----------------------------------------------------------
-- Append-only evidence verification history.
-- ----------------------------------------------------------

create table if not exists
public.organizer_evidence_verification_events (
  id uuid primary key
    default gen_random_uuid(),

  evidence_id uuid not null
    references public.organizer_evidence_sources(id)
    on delete cascade,

  action text not null,

  actor_id uuid
    references public.profiles(id)
    on delete set null,

  note text,

  previous_confidence text,

  new_confidence text,

  previous_status text,

  new_status text,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default timezone('utc', now()),

  constraint organizer_evidence_event_action_valid
    check (
      action in (
        'created',
        'verification_started',
        'verified',
        'rejected',
        'replacement_requested',
        'confidence_changed',
        'link_added',
        'link_removed',
        'status_changed'
      )
    ),

  constraint organizer_evidence_event_note_length
    check (
      note is null
      or char_length(note) <= 10000
    ),

  constraint organizer_evidence_event_previous_confidence_valid
    check (
      previous_confidence is null
      or previous_confidence in (
        'high',
        'medium',
        'low',
        'unverified'
      )
    ),

  constraint organizer_evidence_event_new_confidence_valid
    check (
      new_confidence is null
      or new_confidence in (
        'high',
        'medium',
        'low',
        'unverified'
      )
    ),

  constraint organizer_evidence_event_previous_status_valid
    check (
      previous_status is null
      or previous_status in (
        'unverified',
        'under_review',
        'verified',
        'rejected',
        'needs_replacement'
      )
    ),

  constraint organizer_evidence_event_new_status_valid
    check (
      new_status is null
      or new_status in (
        'unverified',
        'under_review',
        'verified',
        'rejected',
        'needs_replacement'
      )
    )
);

create index if not exists
organizer_evidence_sources_organizer_index
on public.organizer_evidence_sources (
  organizer_id,
  created_at desc
);

create index if not exists
organizer_evidence_sources_document_index
on public.organizer_evidence_sources (
  document_id
)
where document_id is not null;

create index if not exists
organizer_evidence_sources_status_index
on public.organizer_evidence_sources (
  organizer_id,
  verification_status,
  confidence
);

create index if not exists
organizer_evidence_links_subject_index
on public.organizer_evidence_links (
  organizer_id,
  section_key,
  subject_type,
  subject_id,
  field_key
);

create index if not exists
organizer_evidence_events_evidence_index
on public.organizer_evidence_verification_events (
  evidence_id,
  created_at desc
);

drop trigger if exists
organizer_evidence_sources_set_updated_at
on public.organizer_evidence_sources;

create trigger
organizer_evidence_sources_set_updated_at
before update
on public.organizer_evidence_sources
for each row
execute function public.set_updated_at();

-- ----------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------

alter table
public.organizer_evidence_sources
enable row level security;

alter table
public.organizer_evidence_sources
force row level security;

alter table
public.organizer_evidence_links
enable row level security;

alter table
public.organizer_evidence_links
force row level security;

alter table
public.organizer_evidence_verification_events
enable row level security;

alter table
public.organizer_evidence_verification_events
force row level security;

drop policy if exists
organizer_evidence_sources_active_staff_select
on public.organizer_evidence_sources;

create policy
organizer_evidence_sources_active_staff_select
on public.organizer_evidence_sources
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
organizer_evidence_sources_authorized_staff_manage
on public.organizer_evidence_sources;

create policy
organizer_evidence_sources_authorized_staff_manage
on public.organizer_evidence_sources
for all
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
);

drop policy if exists
organizer_evidence_links_active_staff_select
on public.organizer_evidence_links;

create policy
organizer_evidence_links_active_staff_select
on public.organizer_evidence_links
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
organizer_evidence_links_authorized_staff_manage
on public.organizer_evidence_links;

create policy
organizer_evidence_links_authorized_staff_manage
on public.organizer_evidence_links
for all
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
);

drop policy if exists
organizer_evidence_events_active_staff_select
on public.organizer_evidence_verification_events;

create policy
organizer_evidence_events_active_staff_select
on public.organizer_evidence_verification_events
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
organizer_evidence_events_authorized_staff_insert
on public.organizer_evidence_verification_events;

create policy
organizer_evidence_events_authorized_staff_insert
on public.organizer_evidence_verification_events
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
  and actor_id = auth.uid()
);

-- Verification history is append-only.
-- No update or delete policy is created for ordinary users.

-- ----------------------------------------------------------
-- Create one evidence source.
-- ----------------------------------------------------------

drop function if exists
public.create_organizer_evidence_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  jsonb
);

create function
public.create_organizer_evidence_source(
  requested_organizer_id uuid,
  requested_return_id uuid,
  requested_document_id uuid,
  requested_evidence_type text,
  requested_title text,
  requested_description text,
  requested_confidence text,
  requested_metadata jsonb default '{}'::jsonb
)
returns table (
  evidence_id uuid,
  organizer_id uuid,
  return_id uuid,
  document_id uuid,
  evidence_type text,
  title text,
  description text,
  confidence text,
  verification_status text,
  created_by uuid,
  created_by_name text,
  verified_by uuid,
  verified_by_name text,
  verified_at timestamptz,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
#variable_conflict use_column
declare
  current_user_id uuid;
  normalized_evidence_type text;
  normalized_title text;
  normalized_description text;
  normalized_confidence text;
  saved_evidence
    public.organizer_evidence_sources;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You do not have permission to create evidence sources.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  normalized_evidence_type :=
    trim(
      coalesce(
        requested_evidence_type,
        ''
      )
    );

  normalized_title :=
    trim(
      coalesce(
        requested_title,
        ''
      )
    );

  normalized_description :=
    nullif(
      trim(
        coalesce(
          requested_description,
          ''
        )
      ),
      ''
    );

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        'unverified'
      )
    );

  if normalized_evidence_type = '' then
    raise exception
      'An evidence type is required.';
  end if;

  if normalized_title = '' then
    raise exception
      'An evidence title is required.';
  end if;

  if normalized_confidence not in (
    'high',
    'medium',
    'low',
    'unverified'
  ) then
    raise exception
      'Unsupported evidence confidence: %',
      normalized_confidence;
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as organizer
    where organizer.id =
      requested_organizer_id
  ) then
    raise exception
      'The requested organizer was not found.';
  end if;

  insert into
  public.organizer_evidence_sources (
    organizer_id,
    return_id,
    document_id,
    evidence_type,
    title,
    description,
    confidence,
    verification_status,
    created_by,
    metadata
  )
  values (
    requested_organizer_id,
    requested_return_id,
    requested_document_id,
    normalized_evidence_type,
    normalized_title,
    normalized_description,
    normalized_confidence,
    'unverified',
    current_user_id,
    coalesce(
      requested_metadata,
      '{}'::jsonb
    )
  )
  returning *
  into saved_evidence;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    new_confidence,
    new_status,
    metadata
  )
  values (
    saved_evidence.id,
    'created',
    current_user_id,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    jsonb_build_object(
      'organizer_id',
      saved_evidence.organizer_id
    )
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'organizer_evidence_source_created',
    'organizer_evidence_source',
    saved_evidence.id,
    jsonb_build_object(
      'evidence_type',
      saved_evidence.evidence_type,
      'title',
      saved_evidence.title,
      'confidence',
      saved_evidence.confidence,
      'verification_status',
      saved_evidence.verification_status,
      'document_id',
      saved_evidence.document_id
    ),
    jsonb_build_object(
      'organizer_id',
      saved_evidence.organizer_id,
      'return_id',
      saved_evidence.return_id
    )
  );

  return query
  select
    saved_evidence.id,
    saved_evidence.organizer_id,
    saved_evidence.return_id,
    saved_evidence.document_id,
    saved_evidence.evidence_type,
    saved_evidence.title,
    saved_evidence.description,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    saved_evidence.created_by,
    coalesce(
      nullif(
        trim(profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            profile.first_name,
            profile.last_name
          )
        ),
        ''
      ),
      profile.email,
      'Unknown Staff Member'
    ),
    saved_evidence.verified_by,
    null,
    saved_evidence.verified_at,
    saved_evidence.metadata,
    saved_evidence.created_at,
    saved_evidence.updated_at
  from public.profiles
    as profile
  where profile.id =
    current_user_id;
end;
$function$;

-- ----------------------------------------------------------
-- Load evidence linked to one organizer review subject.
-- ----------------------------------------------------------

drop function if exists
public.get_organizer_subject_evidence(
  uuid,
  text,
  text,
  uuid
);

create function
public.get_organizer_subject_evidence(
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid
)
returns table (
  evidence_id uuid,
  organizer_id uuid,
  return_id uuid,
  document_id uuid,
  evidence_type text,
  title text,
  description text,
  confidence text,
  verification_status text,
  created_by uuid,
  created_by_name text,
  verified_by uuid,
  verified_by_name text,
  verified_at timestamptz,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  link_id uuid,
  field_key text,
  link_type text,
  link_notes text,
  linked_by uuid,
  linked_by_name text,
  linked_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_organizer_id is null
    or requested_subject_id is null then
    raise exception
      'Organizer and subject identifiers are required.';
  end if;

  return query
  select
    evidence.id,
    evidence.organizer_id,
    evidence.return_id,
    evidence.document_id,
    evidence.evidence_type,
    evidence.title,
    evidence.description,
    evidence.confidence,
    evidence.verification_status,
    evidence.created_by,
    coalesce(
      nullif(
        trim(created_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            created_profile.first_name,
            created_profile.last_name
          )
        ),
        ''
      ),
      created_profile.email,
      'Unknown Staff Member'
    ),
    evidence.verified_by,
    case
      when evidence.verified_by is null
        then null
      else coalesce(
        nullif(
          trim(verified_profile.display_name),
          ''
        ),
        nullif(
          trim(
            concat_ws(
              ' ',
              verified_profile.first_name,
              verified_profile.last_name
            )
          ),
          ''
        ),
        verified_profile.email
      )
    end,
    evidence.verified_at,
    evidence.metadata,
    evidence.created_at,
    evidence.updated_at,
    link.id,
    link.field_key,
    link.link_type,
    link.notes,
    link.linked_by,
    case
      when link.linked_by is null
        then null
      else coalesce(
        nullif(
          trim(linked_profile.display_name),
          ''
        ),
        nullif(
          trim(
            concat_ws(
              ' ',
              linked_profile.first_name,
              linked_profile.last_name
            )
          ),
          ''
        ),
        linked_profile.email
      )
    end,
    link.linked_at
  from public.organizer_evidence_links
    as link
  join public.organizer_evidence_sources
    as evidence
    on evidence.id =
      link.evidence_id
  left join public.profiles
    as created_profile
    on created_profile.id =
      evidence.created_by
  left join public.profiles
    as verified_profile
    on verified_profile.id =
      evidence.verified_by
  left join public.profiles
    as linked_profile
    on linked_profile.id =
      link.linked_by
  where link.organizer_id =
      requested_organizer_id
    and link.section_key =
      trim(
        requested_section_key
      )
    and link.subject_type =
      trim(
        requested_subject_type
      )
    and link.subject_id =
      requested_subject_id
  order by
    evidence.created_at desc,
    link.linked_at desc;
end;
$function$;

-- ----------------------------------------------------------
-- Link evidence to one organizer field or review subject.
-- ----------------------------------------------------------

drop function if exists
public.link_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text
);

create function
public.link_organizer_evidence(
  requested_evidence_id uuid,
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid,
  requested_field_key text,
  requested_link_type text,
  requested_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  normalized_section_key text;
  normalized_subject_type text;
  normalized_field_key text;
  normalized_link_type text;
  normalized_notes text;
  saved_link
    public.organizer_evidence_links;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You do not have permission to link evidence.';
  end if;

  if requested_evidence_id is null
    or requested_organizer_id is null
    or requested_subject_id is null then
    raise exception
      'Evidence, organizer, and subject identifiers are required.';
  end if;

  normalized_section_key :=
    trim(
      coalesce(
        requested_section_key,
        ''
      )
    );

  normalized_subject_type :=
    trim(
      coalesce(
        requested_subject_type,
        ''
      )
    );

  normalized_field_key :=
    nullif(
      trim(
        coalesce(
          requested_field_key,
          ''
        )
      ),
      ''
    );

  normalized_link_type :=
    trim(
      coalesce(
        requested_link_type,
        'supports'
      )
    );

  normalized_notes :=
    nullif(
      trim(
        coalesce(
          requested_notes,
          ''
        )
      ),
      ''
    );

  if normalized_section_key = ''
    or normalized_subject_type = '' then
    raise exception
      'Section and subject type are required.';
  end if;

  if normalized_field_key is not null
    and normalized_field_key !~ '^[a-z][a-z0-9_]*$' then
    raise exception
      'The field key must use lowercase snake_case.';
  end if;

  if normalized_link_type not in (
    'supports',
    'contradicts',
    'replaces',
    'reference'
  ) then
    raise exception
      'Unsupported evidence link type: %',
      normalized_link_type;
  end if;

  if not exists (
    select 1
    from public.organizer_evidence_sources
      as evidence
    where evidence.id =
        requested_evidence_id
      and evidence.organizer_id =
        requested_organizer_id
  ) then
    raise exception
      'The evidence source was not found for this organizer.';
  end if;

  insert into
  public.organizer_evidence_links (
    evidence_id,
    organizer_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type,
    notes,
    linked_by
  )
  values (
    requested_evidence_id,
    requested_organizer_id,
    normalized_section_key,
    normalized_subject_type,
    requested_subject_id,
    normalized_field_key,
    normalized_link_type,
    normalized_notes,
    current_user_id
  )
  on conflict (
    evidence_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type
  )
  do update set
    notes =
      excluded.notes,
    linked_by =
      current_user_id,
    linked_at =
      timezone(
        'utc',
        now()
      )
  returning *
  into saved_link;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    note,
    metadata
  )
  values (
    requested_evidence_id,
    'link_added',
    current_user_id,
    normalized_notes,
    jsonb_build_object(
      'link_id',
      saved_link.id,
      'organizer_id',
      requested_organizer_id,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    )
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'organizer_evidence_link_added',
    'organizer_evidence_link',
    saved_link.id,
    jsonb_build_object(
      'evidence_id',
      requested_evidence_id,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    ),
    jsonb_build_object(
      'organizer_id',
      requested_organizer_id
    )
  );

  return saved_link.id;
end;
$function$;

-- ----------------------------------------------------------
-- Update confidence and verification status.
-- ----------------------------------------------------------

drop function if exists
public.update_organizer_evidence_verification(
  uuid,
  text,
  text,
  text
);

create function
public.update_organizer_evidence_verification(
  requested_evidence_id uuid,
  requested_confidence text,
  requested_verification_status text,
  requested_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  normalized_confidence text;
  normalized_status text;
  normalized_note text;
  existing_evidence
    public.organizer_evidence_sources;
  updated_evidence
    public.organizer_evidence_sources;
  event_action text;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You do not have permission to verify evidence.';
  end if;

  if requested_evidence_id is null then
    raise exception
      'An evidence identifier is required.';
  end if;

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        ''
      )
    );

  normalized_status :=
    trim(
      coalesce(
        requested_verification_status,
        ''
      )
    );

  normalized_note :=
    nullif(
      trim(
        coalesce(
          requested_note,
          ''
        )
      ),
      ''
    );

  if normalized_confidence not in (
    'high',
    'medium',
    'low',
    'unverified'
  ) then
    raise exception
      'Unsupported evidence confidence: %',
      normalized_confidence;
  end if;

  if normalized_status not in (
    'unverified',
    'under_review',
    'verified',
    'rejected',
    'needs_replacement'
  ) then
    raise exception
      'Unsupported evidence verification status: %',
      normalized_status;
  end if;

  if normalized_status in (
    'rejected',
    'needs_replacement'
  ) and normalized_note is null then
    raise exception
      'A verification note is required for rejected or replacement evidence.';
  end if;

  select evidence.*
  into existing_evidence
  from public.organizer_evidence_sources
    as evidence
  where evidence.id =
    requested_evidence_id;

  if not found then
    raise exception
      'The evidence source was not found.';
  end if;

  update
  public.organizer_evidence_sources
  set
    confidence =
      normalized_confidence,
    verification_status =
      normalized_status,
    verified_by =
      case
        when normalized_status =
          'verified'
          then current_user_id
        else null
      end,
    verified_at =
      case
        when normalized_status =
          'verified'
          then timezone(
            'utc',
            now()
          )
        else null
      end
  where id =
    requested_evidence_id
  returning *
  into updated_evidence;

  event_action :=
    case
      when normalized_status =
        'verified'
        then 'verified'
      when normalized_status =
        'rejected'
        then 'rejected'
      when normalized_status =
        'needs_replacement'
        then 'replacement_requested'
      when normalized_status =
        'under_review'
        then 'verification_started'
      when existing_evidence.confidence <>
        normalized_confidence
        then 'confidence_changed'
      else 'status_changed'
    end;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    note,
    previous_confidence,
    new_confidence,
    previous_status,
    new_status,
    metadata
  )
  values (
    requested_evidence_id,
    event_action,
    current_user_id,
    normalized_note,
    existing_evidence.confidence,
    updated_evidence.confidence,
    existing_evidence.verification_status,
    updated_evidence.verification_status,
    jsonb_build_object(
      'organizer_id',
      updated_evidence.organizer_id
    )
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'organizer_evidence_verification_updated',
    'organizer_evidence_source',
    requested_evidence_id,
    jsonb_build_object(
      'confidence',
      existing_evidence.confidence,
      'verification_status',
      existing_evidence.verification_status,
      'verified_by',
      existing_evidence.verified_by,
      'verified_at',
      existing_evidence.verified_at
    ),
    jsonb_build_object(
      'confidence',
      updated_evidence.confidence,
      'verification_status',
      updated_evidence.verification_status,
      'verified_by',
      updated_evidence.verified_by,
      'verified_at',
      updated_evidence.verified_at,
      'note',
      normalized_note
    ),
    jsonb_build_object(
      'organizer_id',
      updated_evidence.organizer_id,
      'return_id',
      updated_evidence.return_id
    )
  );
end;
$function$;

revoke all
on function public.create_organizer_evidence_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
from public, anon;

revoke all
on function public.get_organizer_subject_evidence(
  uuid,
  text,
  text,
  uuid
)
from public, anon;

revoke all
on function public.link_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text
)
from public, anon;

revoke all
on function public.update_organizer_evidence_verification(
  uuid,
  text,
  text,
  text
)
from public, anon;

grant execute
on function public.create_organizer_evidence_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
to authenticated;

grant execute
on function public.get_organizer_subject_evidence(
  uuid,
  text,
  text,
  uuid
)
to authenticated;

grant execute
on function public.link_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text
)
to authenticated;

grant execute
on function public.update_organizer_evidence_verification(
  uuid,
  text,
  text,
  text
)
to authenticated;

commit;
