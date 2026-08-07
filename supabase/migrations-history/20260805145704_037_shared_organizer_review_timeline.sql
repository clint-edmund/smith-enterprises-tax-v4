-- Smith Enterprises Tax Management
-- Sprint 12.7.4D-B2A: Shared Organizer Review Timeline

begin;

create table if not exists public.organizer_review_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.client_tax_organizers(id) on delete cascade,
  section_key text not null,
  subject_type text not null,
  subject_id uuid not null,
  event_type text not null,
  note_text text,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint organizer_review_timeline_section_valid check (
    section_key in ('income','dependents','healthcare','deductions','credits','business','investments','final_review')
  ),
  constraint organizer_review_timeline_subject_type_valid check (
    subject_type in ('income_source','dependent','healthcare_record','deduction','credit','business_record','investment_record','organizer')
  ),
  constraint organizer_review_timeline_event_type_valid check (
    event_type in ('staff_note','marked_reviewed','needs_follow_up','returned_to_client','resubmitted','status_changed')
  ),
  constraint organizer_review_timeline_note_length check (
    note_text is null or char_length(note_text) <= 10000
  ),
  constraint organizer_review_timeline_note_required check (
    event_type <> 'staff_note'
    or (note_text is not null and char_length(trim(note_text)) > 0)
  )
);

create index if not exists organizer_review_timeline_subject_index
  on public.organizer_review_timeline_entries(subject_type, subject_id, created_at desc);

create index if not exists organizer_review_timeline_organizer_index
  on public.organizer_review_timeline_entries(organizer_id, section_key, created_at desc);

alter table public.organizer_review_timeline_entries enable row level security;
alter table public.organizer_review_timeline_entries force row level security;

drop policy if exists organizer_review_timeline_select_active_staff
  on public.organizer_review_timeline_entries;
create policy organizer_review_timeline_select_active_staff
  on public.organizer_review_timeline_entries
  for select to authenticated
  using (public.current_user_is_active());

drop policy if exists organizer_review_timeline_insert_authorized_staff
  on public.organizer_review_timeline_entries;
create policy organizer_review_timeline_insert_authorized_staff
  on public.organizer_review_timeline_entries
  for insert to authenticated
  with check (
    public.current_user_can_manage_records()
    and actor_id = auth.uid()
  );

-- Append-only by design: no UPDATE or DELETE policy.

drop function if exists public.get_organizer_review_timeline(uuid, text, uuid);
create function public.get_organizer_review_timeline(
  requested_organizer_id uuid,
  requested_subject_type text,
  requested_subject_id uuid
)
returns table (
  entry_id uuid,
  organizer_id uuid,
  section_key text,
  subject_type text,
  subject_id uuid,
  event_type text,
  note_text text,
  actor_id uuid,
  actor_name text,
  metadata jsonb,
  created_at timestamptz
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

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  if trim(coalesce(requested_subject_type, '')) = '' then
    raise exception 'A timeline subject type is required.';
  end if;

  if requested_subject_id is null then
    raise exception 'A timeline subject identifier is required.';
  end if;

  return query
  select
    entry.id,
    entry.organizer_id,
    entry.section_key,
    entry.subject_type,
    entry.subject_id,
    entry.event_type,
    entry.note_text,
    entry.actor_id,
    case
      when entry.actor_id is null then 'System'
      else coalesce(
        nullif(trim(profile.display_name), ''),
        nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
        profile.email,
        'Unknown Staff Member'
      )
    end,
    entry.metadata,
    entry.created_at
  from public.organizer_review_timeline_entries as entry
  left join public.profiles as profile on profile.id = entry.actor_id
  where entry.organizer_id = requested_organizer_id
    and entry.subject_type = trim(requested_subject_type)
    and entry.subject_id = requested_subject_id
  order by entry.created_at desc, entry.id desc;
end;
$function$;

drop function if exists public.add_organizer_review_staff_note(uuid, text, text, uuid, text);
create function public.add_organizer_review_staff_note(
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid,
  requested_note_text text
)
returns table (
  entry_id uuid,
  organizer_id uuid,
  section_key text,
  subject_type text,
  subject_id uuid,
  event_type text,
  note_text text,
  actor_id uuid,
  actor_name text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
#variable_conflict use_column
declare
  current_user_id uuid;
  normalized_section_key text;
  normalized_subject_type text;
  normalized_note_text text;
  saved_entry public.organizer_review_timeline_entries;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception 'You do not have permission to add review timeline notes.';
  end if;

  normalized_section_key := trim(coalesce(requested_section_key, ''));
  normalized_subject_type := trim(coalesce(requested_subject_type, ''));
  normalized_note_text := trim(coalesce(requested_note_text, ''));

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  if requested_subject_id is null then
    raise exception 'A timeline subject identifier is required.';
  end if;

  if normalized_section_key = '' then
    raise exception 'A review section is required.';
  end if;

  if normalized_subject_type = '' then
    raise exception 'A timeline subject type is required.';
  end if;

  if normalized_note_text = '' then
    raise exception 'A staff note is required.';
  end if;

  if char_length(normalized_note_text) > 10000 then
    raise exception 'The staff note cannot exceed 10,000 characters.';
  end if;

  insert into public.organizer_review_timeline_entries (
    organizer_id,
    section_key,
    subject_type,
    subject_id,
    event_type,
    note_text,
    actor_id,
    metadata
  ) values (
    requested_organizer_id,
    normalized_section_key,
    normalized_subject_type,
    requested_subject_id,
    'staff_note',
    normalized_note_text,
    current_user_id,
    jsonb_build_object('source', 'staff_organizer_review')
  )
  returning * into saved_entry;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  ) values (
    current_user_id,
    'organizer_review_staff_note_added',
    'organizer_review_timeline_entry',
    saved_entry.id,
    jsonb_build_object(
      'section_key', saved_entry.section_key,
      'subject_type', saved_entry.subject_type,
      'subject_id', saved_entry.subject_id,
      'event_type', saved_entry.event_type,
      'note_text', saved_entry.note_text
    ),
    jsonb_build_object('organizer_id', saved_entry.organizer_id)
  );

  return query
  select
    saved_entry.id,
    saved_entry.organizer_id,
    saved_entry.section_key,
    saved_entry.subject_type,
    saved_entry.subject_id,
    saved_entry.event_type,
    saved_entry.note_text,
    saved_entry.actor_id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email,
      'Unknown Staff Member'
    ),
    saved_entry.metadata,
    saved_entry.created_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$function$;

revoke all on function public.get_organizer_review_timeline(uuid, text, uuid) from public, anon;
revoke all on function public.add_organizer_review_staff_note(uuid, text, text, uuid, text) from public, anon;

grant execute on function public.get_organizer_review_timeline(uuid, text, uuid) to authenticated;
grant execute on function public.add_organizer_review_staff_note(uuid, text, text, uuid, text) to authenticated;

commit;
