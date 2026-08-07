-- Smith Enterprises Tax Management
-- Sprint 12.7.4B: Staff Dependents Review Database Foundation

begin;

create table if not exists public.client_tax_organizer_dependent_reviews (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null unique
    references public.client_tax_organizer_dependents(id) on delete cascade,
  review_status text not null default 'pending'
    check (review_status in ('pending','reviewed','needs_follow_up','returned_to_client')),
  internal_notes text not null default ''
    check (char_length(internal_notes) <= 10000),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  follow_up_requested_by uuid references public.profiles(id) on delete set null,
  follow_up_requested_at timestamptz,
  returned_to_client_by uuid references public.profiles(id) on delete set null,
  returned_to_client_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dependent_reviews_reviewed_fields_valid check (
    review_status <> 'reviewed' or (reviewed_by is not null and reviewed_at is not null)
  ),
  constraint dependent_reviews_follow_up_fields_valid check (
    review_status <> 'needs_follow_up' or
    (follow_up_requested_by is not null and follow_up_requested_at is not null)
  ),
  constraint dependent_reviews_returned_fields_valid check (
    review_status <> 'returned_to_client' or
    (returned_to_client_by is not null and returned_to_client_at is not null)
  )
);

create index if not exists dependent_reviews_status_index
  on public.client_tax_organizer_dependent_reviews(review_status);
create index if not exists dependent_reviews_reviewed_by_index
  on public.client_tax_organizer_dependent_reviews(reviewed_by);

drop trigger if exists dependent_reviews_set_updated_at
  on public.client_tax_organizer_dependent_reviews;
create trigger dependent_reviews_set_updated_at
before update on public.client_tax_organizer_dependent_reviews
for each row execute function public.set_updated_at();

alter table public.client_tax_organizer_dependent_reviews enable row level security;
alter table public.client_tax_organizer_dependent_reviews force row level security;

drop policy if exists dependent_reviews_select_active_staff
  on public.client_tax_organizer_dependent_reviews;
create policy dependent_reviews_select_active_staff
on public.client_tax_organizer_dependent_reviews
for select to authenticated
using (public.current_user_is_active());

drop policy if exists dependent_reviews_manage_authorized_staff
  on public.client_tax_organizer_dependent_reviews;
create policy dependent_reviews_manage_authorized_staff
on public.client_tax_organizer_dependent_reviews
for all to authenticated
using (public.current_user_can_manage_records())
with check (public.current_user_can_manage_records());

-- Shared return helper pattern: all RPCs return the current review record.

drop function if exists public.get_staff_dependent_review(uuid);
create function public.get_staff_dependent_review(requested_dependent_id uuid)
returns table (
  review_id uuid, dependent_id uuid, review_status text, internal_notes text,
  reviewed_by uuid, reviewed_by_name text, reviewed_at timestamptz,
  follow_up_requested_at timestamptz, returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $function$
#variable_conflict use_column
declare
  selected_dependent public.client_tax_organizer_dependents;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;

  select d.* into selected_dependent
  from public.client_tax_organizer_dependents d
  where d.id = requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  return query
  select r.id, selected_dependent.id, coalesce(r.review_status,'pending'),
    coalesce(r.internal_notes,''), r.reviewed_by,
    case when r.reviewed_by is null then null else coalesce(
      nullif(trim(p.display_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''), p.email) end,
    r.reviewed_at, r.follow_up_requested_at, r.returned_to_client_at,
    coalesce(r.updated_at, selected_dependent.updated_at)
  from (select 1) x
  left join public.client_tax_organizer_dependent_reviews r
    on r.dependent_id = selected_dependent.id
  left join public.profiles p on p.id = r.reviewed_by;
end;
$function$;

-- Save Notes

drop function if exists public.save_dependent_review_notes(uuid,text);
create function public.save_dependent_review_notes(
  requested_dependent_id uuid, requested_internal_notes text
)
returns table (
  review_id uuid, dependent_id uuid, review_status text, internal_notes text,
  reviewed_by uuid, reviewed_by_name text, reviewed_at timestamptz,
  follow_up_requested_at timestamptz, returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = ''
as $function$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,internal_notes,created_by,updated_by)
  values (d.id,notes,uid,uid)
  on conflict (dependent_id) do update set internal_notes=notes,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_notes_saved','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,r.reviewed_by,
    case when r.reviewed_by is null then null else coalesce(nullif(trim(p.display_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email) end,
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from (select 1) x left join public.profiles p on p.id=r.reviewed_by;
end;
$function$;

-- Mark Reviewed

drop function if exists public.mark_dependent_review_complete(uuid);
create function public.mark_dependent_review_complete(requested_dependent_id uuid)
returns table (
  review_id uuid, dependent_id uuid, review_status text, internal_notes text,
  reviewed_by uuid, reviewed_by_name text, reviewed_at timestamptz,
  follow_up_requested_at timestamptz, returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = ''
as $function$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,reviewed_by,reviewed_at,created_by,updated_by)
  values(d.id,'reviewed',uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='reviewed',reviewed_by=uid,reviewed_at=timezone('utc',now()),
    follow_up_requested_by=null,follow_up_requested_at=null,
    returned_to_client_by=null,returned_to_client_at=null,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_marked_complete','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,r.reviewed_by,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$function$;

-- Needs Follow-up

drop function if exists public.mark_dependent_review_needs_followup(uuid,text);
create function public.mark_dependent_review_needs_followup(
  requested_dependent_id uuid, requested_internal_notes text default null
)
returns table (
  review_id uuid, dependent_id uuid, review_status text, internal_notes text,
  reviewed_by uuid, reviewed_by_name text, reviewed_at timestamptz,
  follow_up_requested_at timestamptz, returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = ''
as $function$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if notes = '' then raise exception 'A follow-up note is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,internal_notes,follow_up_requested_by,
     follow_up_requested_at,created_by,updated_by)
  values(d.id,'needs_follow_up',notes,uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='needs_follow_up',internal_notes=notes,reviewed_by=null,reviewed_at=null,
    follow_up_requested_by=uid,follow_up_requested_at=timezone('utc',now()),
    returned_to_client_by=null,returned_to_client_at=null,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_needs_follow_up','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,uid,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$function$;

-- Return to Client

drop function if exists public.return_dependent_to_client(uuid,text);
create function public.return_dependent_to_client(
  requested_dependent_id uuid, requested_internal_notes text default null
)
returns table (
  review_id uuid, dependent_id uuid, review_status text, internal_notes text,
  reviewed_by uuid, reviewed_by_name text, reviewed_at timestamptz,
  follow_up_requested_at timestamptz, returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = ''
as $function$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if notes = '' then raise exception 'A return-to-client note is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,internal_notes,follow_up_requested_by,
     follow_up_requested_at,returned_to_client_by,returned_to_client_at,created_by,updated_by)
  values(d.id,'returned_to_client',notes,uid,timezone('utc',now()),uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='returned_to_client',internal_notes=notes,reviewed_by=null,reviewed_at=null,
    follow_up_requested_by=uid,follow_up_requested_at=timezone('utc',now()),
    returned_to_client_by=uid,returned_to_client_at=timezone('utc',now()),updated_by=uid
  returning * into r;

  update public.client_tax_organizers set
    status='changes_requested',current_section='dependents',updated_at=timezone('utc',now())
  where id=d.organizer_id;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_returned_to_client','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id,'organizer_status','changes_requested','current_section','dependents'));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,uid,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$function$;

revoke all on function public.get_staff_dependent_review(uuid) from public, anon;
revoke all on function public.save_dependent_review_notes(uuid,text) from public, anon;
revoke all on function public.mark_dependent_review_complete(uuid) from public, anon;
revoke all on function public.mark_dependent_review_needs_followup(uuid,text) from public, anon;
revoke all on function public.return_dependent_to_client(uuid,text) from public, anon;

grant execute on function public.get_staff_dependent_review(uuid) to authenticated;
grant execute on function public.save_dependent_review_notes(uuid,text) to authenticated;
grant execute on function public.mark_dependent_review_complete(uuid) to authenticated;
grant execute on function public.mark_dependent_review_needs_followup(uuid,text) to authenticated;
grant execute on function public.return_dependent_to_client(uuid,text) to authenticated;

commit;
