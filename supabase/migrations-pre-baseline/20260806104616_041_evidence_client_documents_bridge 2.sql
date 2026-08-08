-- ==========================================================
-- Smith Enterprises Tax Management
-- Release 0.10 — Sprint 0.10.2A
-- Evidence Registry / Client Documents Bridge
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- Link Evidence Registry sources to the existing
-- public.client_documents registry.
-- ----------------------------------------------------------

do $block$
begin
  if to_regclass(
    'public.client_documents'
  ) is null then
    raise exception
      'Required table public.client_documents was not found.';
  end if;
end;
$block$;

alter table
public.organizer_evidence_sources
drop constraint if exists
organizer_evidence_sources_document_id_fkey;

alter table
public.organizer_evidence_sources
add constraint
organizer_evidence_sources_document_id_fkey
foreign key (
  document_id
)
references public.client_documents(id)
on delete set null
not valid;

alter table
public.organizer_evidence_sources
validate constraint
organizer_evidence_sources_document_id_fkey;

-- One uploaded document should have one registry source per organizer.
-- The source can then be linked to multiple fields.
create unique index if not exists
organizer_evidence_sources_organizer_document_unique
on public.organizer_evidence_sources (
  organizer_id,
  document_id
)
where document_id is not null;

-- ----------------------------------------------------------
-- List current, unarchived documents available to one organizer.
--
-- Includes:
--   1. Client-level documents with no return assignment.
--   2. Documents assigned to a tax return for the organizer's
--      client and tax year.
--
-- Existing Evidence Registry state is returned so the UI can
-- distinguish available and already-registered documents.
-- ----------------------------------------------------------

drop function if exists
public.list_organizer_available_documents(
  uuid
);

create function
public.list_organizer_available_documents(
  requested_organizer_id uuid
)
returns table (
  document_id uuid,
  client_id uuid,
  tax_return_id uuid,
  tax_year integer,
  category text,
  document_status text,
  original_file_name text,
  storage_bucket text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  description text,
  uploaded_by uuid,
  uploaded_by_name text,
  uploaded_at timestamptz,
  review_status text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  evidence_id uuid,
  evidence_type text,
  evidence_confidence text,
  evidence_verification_status text,
  is_registered_as_evidence boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
#variable_conflict use_column
declare
  selected_organizer
    public.client_tax_organizers;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.id =
    requested_organizer_id;

  if not found then
    raise exception
      'The requested organizer was not found.';
  end if;

  return query
  select
    document.id,
    document.client_id,
    document.tax_return_id,
    tax_return.tax_year,
    document.category,
    document.status,
    document.original_file_name,
    document.storage_bucket,
    document.storage_path,
    document.mime_type,
    document.size_bytes,
    document.description,
    document.uploaded_by,
    coalesce(
      nullif(
        trim(uploaded_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            uploaded_profile.first_name,
            uploaded_profile.last_name
          )
        ),
        ''
      ),
      uploaded_profile.email,
      'Unknown User'
    ),
    document.created_at,
    document.review_status::text,
    document.reviewed_by,
    coalesce(
      nullif(
        trim(document.reviewed_by_name),
        ''
      ),
      nullif(
        trim(reviewed_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            reviewed_profile.first_name,
            reviewed_profile.last_name
          )
        ),
        ''
      ),
      reviewed_profile.email
    ),
    document.reviewed_at,
    evidence.id,
    evidence.evidence_type,
    evidence.confidence,
    evidence.verification_status,
    evidence.id is not null
  from public.client_documents
    as document
  left join public.tax_returns
    as tax_return
    on tax_return.id =
      document.tax_return_id
  join public.profiles
    as uploaded_profile
    on uploaded_profile.id =
      document.uploaded_by
  left join public.profiles
    as reviewed_profile
    on reviewed_profile.id =
      document.reviewed_by
  left join public.organizer_evidence_sources
    as evidence
    on evidence.organizer_id =
      selected_organizer.id
    and evidence.document_id =
      document.id
  where document.client_id =
      selected_organizer.client_id
    and document.archived_at is null
    and document.is_current_version =
      true
    and (
      document.tax_return_id is null
      or (
        tax_return.client_id =
          selected_organizer.client_id
        and tax_return.tax_year =
          selected_organizer.tax_year
      )
    )
  order by
    document.created_at desc,
    document.id;
end;
$function$;

-- ----------------------------------------------------------
-- Register or reuse one existing client document as evidence,
-- then link it to one organizer subject/field in one transaction.
-- ----------------------------------------------------------

drop function if exists
public.register_document_as_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text
);

create function
public.register_document_as_organizer_evidence(
  requested_organizer_id uuid,
  requested_document_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid,
  requested_field_key text,
  requested_evidence_type text,
  requested_confidence text,
  requested_link_type text,
  requested_notes text
)
returns table (
  evidence_id uuid,
  link_id uuid,
  document_id uuid,
  original_file_name text,
  evidence_type text,
  confidence text,
  verification_status text,
  was_existing_evidence boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
#variable_conflict use_column
declare
  current_user_id uuid;

  selected_organizer
    public.client_tax_organizers;

  selected_document
    public.client_documents;

  selected_tax_return
    public.tax_returns;

  normalized_section_key text;
  normalized_subject_type text;
  normalized_field_key text;
  normalized_evidence_type text;
  normalized_confidence text;
  normalized_link_type text;
  normalized_notes text;

  saved_evidence
    public.organizer_evidence_sources;

  saved_link
    public.organizer_evidence_links;

  existing_evidence boolean :=
    false;
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
      'You do not have permission to register document evidence.';
  end if;

  if requested_organizer_id is null
    or requested_document_id is null
    or requested_subject_id is null then
    raise exception
      'Organizer, document, and subject identifiers are required.';
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

  normalized_evidence_type :=
    trim(
      coalesce(
        requested_evidence_type,
        ''
      )
    );

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        'unverified'
      )
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
    or normalized_subject_type = ''
    or normalized_evidence_type = '' then
    raise exception
      'Section, subject type, and evidence type are required.';
  end if;

  if normalized_field_key is not null
    and normalized_field_key !~
      '^[a-z][a-z0-9_]*$' then
    raise exception
      'The field key must use lowercase snake_case.';
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

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.id =
    requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested organizer was not found.';
  end if;

  select document.*
  into selected_document
  from public.client_documents
    as document
  where document.id =
      requested_document_id
    and document.client_id =
      selected_organizer.client_id
    and document.archived_at is null
    and document.is_current_version =
      true;

  if not found then
    raise exception
      'The selected current document was not found for this organizer client.';
  end if;

  if selected_document.tax_return_id is not null then
    select tax_return.*
    into selected_tax_return
    from public.tax_returns
      as tax_return
    where tax_return.id =
        selected_document.tax_return_id
      and tax_return.client_id =
        selected_organizer.client_id
      and tax_return.tax_year =
        selected_organizer.tax_year;

    if not found then
      raise exception
        'The selected document belongs to a different tax year.';
    end if;
  end if;

  select evidence.*
  into saved_evidence
  from public.organizer_evidence_sources
    as evidence
  where evidence.organizer_id =
      selected_organizer.id
    and evidence.document_id =
      selected_document.id
  for update;

  if found then
    existing_evidence :=
      true;
  else
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
      selected_organizer.id,
      selected_document.tax_return_id,
      selected_document.id,
      normalized_evidence_type,
      selected_document.original_file_name,
      selected_document.description,
      normalized_confidence,
      'unverified',
      current_user_id,
      jsonb_build_object(
        'source',
        'client_document_library',
        'storage_bucket',
        selected_document.storage_bucket,
        'storage_path',
        selected_document.storage_path,
        'mime_type',
        selected_document.mime_type,
        'size_bytes',
        selected_document.size_bytes,
        'document_category',
        selected_document.category
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
        selected_organizer.id,
        'document_id',
        selected_document.id,
        'source',
        'client_document_library'
      )
    );
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
    saved_evidence.id,
    selected_organizer.id,
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
    saved_evidence.id,
    'link_added',
    current_user_id,
    normalized_notes,
    jsonb_build_object(
      'link_id',
      saved_link.id,
      'organizer_id',
      selected_organizer.id,
      'document_id',
      selected_document.id,
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
    'client_document_registered_as_organizer_evidence',
    'organizer_evidence_link',
    saved_link.id,
    jsonb_build_object(
      'evidence_id',
      saved_evidence.id,
      'document_id',
      selected_document.id,
      'original_file_name',
      selected_document.original_file_name,
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
      selected_organizer.id,
      'client_id',
      selected_organizer.client_id,
      'tax_year',
      selected_organizer.tax_year,
      'reused_existing_evidence',
      existing_evidence
    )
  );

  return query
  select
    saved_evidence.id,
    saved_link.id,
    selected_document.id,
    selected_document.original_file_name,
    saved_evidence.evidence_type,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    existing_evidence;
end;
$function$;

revoke all
on function public.list_organizer_available_documents(
  uuid
)
from public, anon;

revoke all
on function public.register_document_as_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text
)
from public, anon;

grant execute
on function public.list_organizer_available_documents(
  uuid
)
to authenticated;

grant execute
on function public.register_document_as_organizer_evidence(
  uuid,
  uuid,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text
)
to authenticated;

commit;
