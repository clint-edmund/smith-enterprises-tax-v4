-- Release 0.10 — Sprint 0.10.4A
-- Intelligent Document Processing Foundation

begin;

create table if not exists public.document_analysis_providers (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null unique,
  display_name text not null,
  provider_type text not null,
  is_enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_analysis_provider_key_valid
    check (provider_key ~ '^[a-z][a-z0-9_]*$'),
  constraint document_analysis_provider_type_valid
    check (provider_type in (
      'manual',
      'azure_document_intelligence',
      'aws_textract',
      'google_document_ai',
      'custom'
    ))
);

create table if not exists public.document_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null
    references public.client_documents(id) on delete cascade,
  organizer_id uuid
    references public.client_tax_organizers(id) on delete set null,
  evidence_id uuid
    references public.organizer_evidence_sources(id) on delete set null,
  provider_id uuid not null
    references public.document_analysis_providers(id) on delete restrict,
  status text not null default 'pending',
  requested_by uuid references public.profiles(id) on delete set null,
  requested_at timestamptz not null default timezone('utc', now()),
  queued_at timestamptz,
  processing_started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  provider_job_reference text,
  failure_code text,
  failure_message text,
  request_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_analysis_job_status_valid
    check (status in (
      'pending',
      'queued',
      'processing',
      'completed',
      'review_required',
      'failed',
      'cancelled'
    )),
  constraint document_analysis_job_attempts_valid
    check (
      attempt_count >= 0
      and max_attempts > 0
      and attempt_count <= max_attempts
    )
);

create table if not exists public.document_analysis_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique
    references public.document_analysis_jobs(id) on delete cascade,
  document_type text,
  overall_confidence numeric(5,4),
  page_count integer,
  raw_provider_result jsonb not null default '{}'::jsonb,
  normalized_result jsonb not null default '{}'::jsonb,
  requires_staff_review boolean not null default true,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_outcome text,
  review_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_analysis_result_confidence_valid
    check (
      overall_confidence is null
      or overall_confidence between 0 and 1
    ),
  constraint document_analysis_result_outcome_valid
    check (
      review_outcome is null
      or review_outcome in (
        'accepted',
        'partially_accepted',
        'rejected',
        'needs_reprocessing'
      )
    )
);

create table if not exists public.document_analysis_extracted_fields (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null
    references public.document_analysis_results(id) on delete cascade,
  field_key text not null,
  display_label text not null,
  extracted_value text,
  normalized_value text,
  confidence numeric(5,4),
  page_number integer,
  bounding_box jsonb,
  source_text text,
  staff_decision text not null default 'pending',
  accepted_value text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint document_analysis_field_key_valid
    check (field_key ~ '^[a-z][a-z0-9_]*$'),
  constraint document_analysis_field_confidence_valid
    check (
      confidence is null
      or confidence between 0 and 1
    ),
  constraint document_analysis_field_decision_valid
    check (staff_decision in (
      'pending',
      'accepted',
      'corrected',
      'rejected'
    ))
);

create table if not exists public.document_analysis_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null
    references public.document_analysis_jobs(id) on delete cascade,
  event_type text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  previous_status text,
  new_status text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint document_analysis_event_type_valid
    check (event_type in (
      'job_created',
      'job_queued',
      'processing_started',
      'processing_completed',
      'review_required',
      'processing_failed',
      'job_cancelled',
      'result_reviewed',
      'field_reviewed'
    ))
);

create index if not exists document_analysis_jobs_document_index
  on public.document_analysis_jobs(document_id, created_at desc);

create index if not exists document_analysis_jobs_status_index
  on public.document_analysis_jobs(status, requested_at);

create index if not exists document_analysis_fields_result_index
  on public.document_analysis_extracted_fields(result_id, field_key);

create index if not exists document_analysis_events_job_index
  on public.document_analysis_events(job_id, created_at desc);

drop trigger if exists document_analysis_providers_set_updated_at
  on public.document_analysis_providers;
create trigger document_analysis_providers_set_updated_at
before update on public.document_analysis_providers
for each row execute function public.set_updated_at();

drop trigger if exists document_analysis_jobs_set_updated_at
  on public.document_analysis_jobs;
create trigger document_analysis_jobs_set_updated_at
before update on public.document_analysis_jobs
for each row execute function public.set_updated_at();

drop trigger if exists document_analysis_results_set_updated_at
  on public.document_analysis_results;
create trigger document_analysis_results_set_updated_at
before update on public.document_analysis_results
for each row execute function public.set_updated_at();

drop trigger if exists document_analysis_fields_set_updated_at
  on public.document_analysis_extracted_fields;
create trigger document_analysis_fields_set_updated_at
before update on public.document_analysis_extracted_fields
for each row execute function public.set_updated_at();

alter table public.document_analysis_providers enable row level security;
alter table public.document_analysis_providers force row level security;
alter table public.document_analysis_jobs enable row level security;
alter table public.document_analysis_jobs force row level security;
alter table public.document_analysis_results enable row level security;
alter table public.document_analysis_results force row level security;
alter table public.document_analysis_extracted_fields enable row level security;
alter table public.document_analysis_extracted_fields force row level security;
alter table public.document_analysis_events enable row level security;
alter table public.document_analysis_events force row level security;

drop policy if exists document_analysis_providers_staff_select
  on public.document_analysis_providers;
create policy document_analysis_providers_staff_select
on public.document_analysis_providers
for select to authenticated
using (public.current_user_is_active());

drop policy if exists document_analysis_jobs_staff_select
  on public.document_analysis_jobs;
create policy document_analysis_jobs_staff_select
on public.document_analysis_jobs
for select to authenticated
using (public.current_user_is_active());

drop policy if exists document_analysis_results_staff_select
  on public.document_analysis_results;
create policy document_analysis_results_staff_select
on public.document_analysis_results
for select to authenticated
using (public.current_user_is_active());

drop policy if exists document_analysis_fields_staff_select
  on public.document_analysis_extracted_fields;
create policy document_analysis_fields_staff_select
on public.document_analysis_extracted_fields
for select to authenticated
using (public.current_user_is_active());

drop policy if exists document_analysis_events_staff_select
  on public.document_analysis_events;
create policy document_analysis_events_staff_select
on public.document_analysis_events
for select to authenticated
using (public.current_user_is_active());

insert into public.document_analysis_providers (
  provider_key,
  display_name,
  provider_type,
  is_enabled,
  configuration
)
values (
  'manual_test',
  'Manual Test Provider',
  'manual',
  true,
  jsonb_build_object(
    'purpose',
    'Development and workflow testing only'
  )
)
on conflict (provider_key)
do update set
  display_name = excluded.display_name,
  provider_type = excluded.provider_type,
  is_enabled = excluded.is_enabled,
  configuration = excluded.configuration;

drop function if exists public.queue_document_analysis_job(
  uuid,
  uuid,
  uuid,
  text,
  jsonb
);

create function public.queue_document_analysis_job(
  requested_document_id uuid,
  requested_organizer_id uuid,
  requested_evidence_id uuid,
  requested_provider_key text,
  requested_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  selected_provider public.document_analysis_providers;
  selected_document public.client_documents;
  selected_organizer public.client_tax_organizers;
  created_job public.document_analysis_jobs;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active()
    or not public.current_user_can_manage_records() then
    raise exception 'You do not have permission to queue document analysis.';
  end if;

  select provider.*
  into selected_provider
  from public.document_analysis_providers as provider
  where provider.provider_key = trim(coalesce(requested_provider_key, ''))
    and provider.is_enabled = true;

  if not found then
    raise exception 'The requested analysis provider is unavailable.';
  end if;

  select document.*
  into selected_document
  from public.client_documents as document
  where document.id = requested_document_id
    and document.archived_at is null
    and document.is_current_version = true;

  if not found then
    raise exception 'The selected current document was not found.';
  end if;

  if requested_organizer_id is not null then
    select organizer.*
    into selected_organizer
    from public.client_tax_organizers as organizer
    where organizer.id = requested_organizer_id
      and organizer.client_id = selected_document.client_id;

    if not found then
      raise exception 'The document does not belong to the organizer client.';
    end if;
  end if;

  insert into public.document_analysis_jobs (
    document_id,
    organizer_id,
    evidence_id,
    provider_id,
    status,
    requested_by,
    queued_at,
    request_metadata
  )
  values (
    requested_document_id,
    requested_organizer_id,
    requested_evidence_id,
    selected_provider.id,
    'queued',
    current_user_id,
    timezone('utc', now()),
    coalesce(requested_metadata, '{}'::jsonb)
  )
  returning *
  into created_job;

  insert into public.document_analysis_events (
    job_id,
    event_type,
    actor_id,
    previous_status,
    new_status,
    message
  )
  values (
    created_job.id,
    'job_created',
    current_user_id,
    null,
    'queued',
    'Document analysis job created.'
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
    'document_analysis_job_queued',
    'document_analysis_job',
    created_job.id,
    jsonb_build_object(
      'document_id', requested_document_id,
      'organizer_id', requested_organizer_id,
      'evidence_id', requested_evidence_id,
      'provider_key', selected_provider.provider_key,
      'status', created_job.status
    ),
    coalesce(requested_metadata, '{}'::jsonb)
  );

  return created_job.id;
end;
$function$;

drop function if exists public.get_document_analysis_jobs(uuid);

create function public.get_document_analysis_jobs(
  requested_document_id uuid
)
returns table (
  job_id uuid,
  document_id uuid,
  organizer_id uuid,
  evidence_id uuid,
  provider_key text,
  provider_name text,
  status text,
  requested_by uuid,
  requested_by_name text,
  requested_at timestamptz,
  queued_at timestamptz,
  processing_started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  attempt_count integer,
  max_attempts integer,
  failure_code text,
  failure_message text,
  result_id uuid,
  document_type text,
  overall_confidence numeric,
  requires_staff_review boolean,
  review_outcome text,
  reviewed_by_name text,
  reviewed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    job.id,
    job.document_id,
    job.organizer_id,
    job.evidence_id,
    provider.provider_key,
    provider.display_name,
    job.status,
    job.requested_by,
    coalesce(
      nullif(trim(requested_profile.display_name), ''),
      nullif(trim(concat_ws(
        ' ',
        requested_profile.first_name,
        requested_profile.last_name
      )), ''),
      requested_profile.email,
      'Unknown Staff Member'
    ),
    job.requested_at,
    job.queued_at,
    job.processing_started_at,
    job.completed_at,
    job.failed_at,
    job.attempt_count,
    job.max_attempts,
    job.failure_code,
    job.failure_message,
    result.id,
    result.document_type,
    result.overall_confidence,
    result.requires_staff_review,
    result.review_outcome,
    coalesce(
      nullif(trim(reviewed_profile.display_name), ''),
      reviewed_profile.email
    ),
    result.reviewed_at
  from public.document_analysis_jobs as job
  join public.document_analysis_providers as provider
    on provider.id = job.provider_id
  left join public.profiles as requested_profile
    on requested_profile.id = job.requested_by
  left join public.document_analysis_results as result
    on result.job_id = job.id
  left join public.profiles as reviewed_profile
    on reviewed_profile.id = result.reviewed_by
  where job.document_id = requested_document_id
  order by job.created_at desc;
end;
$function$;

revoke all on function public.queue_document_analysis_job(
  uuid,
  uuid,
  uuid,
  text,
  jsonb
) from public, anon;

revoke all on function public.get_document_analysis_jobs(uuid)
from public, anon;

grant execute on function public.queue_document_analysis_job(
  uuid,
  uuid,
  uuid,
  text,
  jsonb
) to authenticated;

grant execute on function public.get_document_analysis_jobs(uuid)
to authenticated;

commit;
