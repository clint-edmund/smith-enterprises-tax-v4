-- Shared review workflow timeline event RPC

begin;

drop function if exists public.add_organizer_review_workflow_event(uuid,text,text,uuid,text,text,jsonb);

create function public.add_organizer_review_workflow_event(
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid,
  requested_event_type text,
  requested_note_text text,
  requested_metadata jsonb default '{}'::jsonb
)
returns table (
  entry_id uuid, organizer_id uuid, section_key text, subject_type text,
  subject_id uuid, event_type text, note_text text, actor_id uuid,
  actor_name text, metadata jsonb, created_at timestamptz
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
  normalized_event_type text;
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
    raise exception 'You do not have permission to record review workflow events.';
  end if;

  if requested_organizer_id is null or requested_subject_id is null then
    raise exception 'Organizer and review subject identifiers are required.';
  end if;

  normalized_section_key := trim(coalesce(requested_section_key, ''));
  normalized_subject_type := trim(coalesce(requested_subject_type, ''));
  normalized_event_type := trim(coalesce(requested_event_type, ''));
  normalized_note_text := trim(coalesce(requested_note_text, ''));

  if normalized_section_key = '' or normalized_subject_type = '' then
    raise exception 'Review section and subject type are required.';
  end if;

  if normalized_event_type not in (
    'marked_reviewed', 'needs_follow_up', 'returned_to_client',
    'resubmitted', 'status_changed'
  ) then
    raise exception 'Unsupported review workflow event type: %', normalized_event_type;
  end if;

  if normalized_event_type in (
    'marked_reviewed', 'needs_follow_up', 'returned_to_client'
  ) and normalized_note_text = '' then
    raise exception 'A review explanation is required.';
  end if;

  if char_length(normalized_note_text) > 10000 then
    raise exception 'The review explanation cannot exceed 10,000 characters.';
  end if;

  insert into public.organizer_review_timeline_entries (
    organizer_id, section_key, subject_type, subject_id, event_type,
    note_text, actor_id, metadata
  )
  values (
    requested_organizer_id, normalized_section_key, normalized_subject_type,
    requested_subject_id, normalized_event_type, nullif(normalized_note_text, ''),
    current_user_id, coalesce(requested_metadata, '{}'::jsonb) ||
      jsonb_build_object('source', 'staff_organizer_review')
  )
  returning * into saved_entry;

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    current_user_id,
    'organizer_review_workflow_event_added',
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
    saved_entry.id, saved_entry.organizer_id, saved_entry.section_key,
    saved_entry.subject_type, saved_entry.subject_id, saved_entry.event_type,
    saved_entry.note_text, saved_entry.actor_id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email, 'Unknown Staff Member'
    ),
    saved_entry.metadata, saved_entry.created_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$function$;

revoke all on function public.add_organizer_review_workflow_event(uuid,text,text,uuid,text,text,jsonb) from public, anon;
grant execute on function public.add_organizer_review_workflow_event(uuid,text,text,uuid,text,text,jsonb) to authenticated;

commit;
