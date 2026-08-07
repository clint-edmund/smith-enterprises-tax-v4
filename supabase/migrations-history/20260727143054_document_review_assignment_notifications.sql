-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 10.4.7C.3A
-- Document reviewer assignment and in-app notification foundation
-- ============================================================

begin;

alter table public.client_documents
  add column if not exists assigned_reviewer_id uuid null,
  add column if not exists assigned_reviewer_name text null,
  add column if not exists review_due_at timestamptz null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'client_documents_assigned_reviewer_id_fkey'
  ) then
    alter table public.client_documents
      add constraint client_documents_assigned_reviewer_id_fkey
      foreign key (assigned_reviewer_id)
      references public.profiles(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists client_documents_assigned_reviewer_id_idx
on public.client_documents(assigned_reviewer_id)
where archived_at is null;

create index if not exists client_documents_review_queue_idx
on public.client_documents(review_status, assigned_reviewer_id, review_due_at)
where archived_at is null;

create table if not exists public.document_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid null references public.profiles(id) on delete set null,
  document_id uuid null references public.client_documents(id) on delete cascade,
  client_id uuid null references public.clients(id) on delete cascade,
  tax_return_id uuid null references public.tax_returns(id) on delete cascade,
  notification_type text not null,
  title text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint document_notifications_type_check check (
    notification_type in (
      'document_review_requested',
      'document_approved',
      'document_changes_requested',
      'document_review_reset',
      'document_review_reassigned',
      'document_review_overdue'
    )
  )
);

create index if not exists document_notifications_recipient_unread_idx
on public.document_notifications(recipient_user_id, created_at desc)
where read_at is null and archived_at is null;

create index if not exists document_notifications_document_idx
on public.document_notifications(document_id);

alter table public.document_notifications enable row level security;

drop policy if exists "Users can read their own document notifications"
on public.document_notifications;

create policy "Users can read their own document notifications"
on public.document_notifications
for select to authenticated
using (
  recipient_user_id = auth.uid()
  and public.current_user_is_active()
);

drop policy if exists "Users can update their own document notifications"
on public.document_notifications;

create policy "Users can update their own document notifications"
on public.document_notifications
for update to authenticated
using (
  recipient_user_id = auth.uid()
  and public.current_user_is_active()
)
with check (
  recipient_user_id = auth.uid()
  and public.current_user_is_active()
);

revoke all on table public.document_notifications from public;
revoke all on table public.document_notifications from anon;
grant select, update on table public.document_notifications to authenticated;

create or replace function public.list_document_reviewers()
returns table (
  id uuid,
  display_name text,
  email text,
  role public.app_role
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    profile.id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email
    ) as display_name,
    profile.email,
    profile.role
  from public.profiles as profile
  where profile.is_active = true
    and profile.role in (
      'administrator'::public.app_role,
      'manager'::public.app_role,
      'reviewer'::public.app_role
    )
  order by
    case profile.role
      when 'reviewer'::public.app_role then 1
      when 'manager'::public.app_role then 2
      when 'administrator'::public.app_role then 3
      else 4
    end,
    display_name;
end;
$$;

revoke all on function public.list_document_reviewers() from public;
revoke all on function public.list_document_reviewers() from anon;
grant execute on function public.list_document_reviewers() to authenticated;

create or replace function public.request_document_review_assignment(
  p_document_id uuid,
  p_reviewer_id uuid,
  p_review_due_at timestamptz default null
)
returns setof public.client_documents
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile public.profiles%rowtype;
  reviewer_profile public.profiles%rowtype;
  updated_document public.client_documents%rowtype;
  requester_name text;
  reviewer_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select * into current_profile
  from public.profiles
  where id = auth.uid() and is_active = true;

  if not found then
    raise exception 'An active staff account is required.';
  end if;

  if current_profile.role not in (
    'administrator'::public.app_role,
    'manager'::public.app_role,
    'preparer'::public.app_role,
    'receptionist'::public.app_role
  ) then
    raise exception 'Your role is not permitted to submit documents for review.';
  end if;

  select * into reviewer_profile
  from public.profiles
  where id = p_reviewer_id
    and is_active = true
    and role in (
      'administrator'::public.app_role,
      'manager'::public.app_role,
      'reviewer'::public.app_role
    );

  if not found then
    raise exception 'The selected reviewer is not an active authorized reviewer.';
  end if;

  requester_name := coalesce(
    nullif(trim(current_profile.display_name), ''),
    nullif(trim(concat_ws(' ', current_profile.first_name, current_profile.last_name)), ''),
    current_profile.email
  );

  reviewer_name := coalesce(
    nullif(trim(reviewer_profile.display_name), ''),
    nullif(trim(concat_ws(' ', reviewer_profile.first_name, reviewer_profile.last_name)), ''),
    reviewer_profile.email
  );

  update public.client_documents
  set
    review_status = 'pending_review',
    review_requested_by = auth.uid(),
    review_requested_at = now(),
    reviewed_by = null,
    reviewed_by_name = null,
    reviewed_at = null,
    review_comments = null,
    assigned_reviewer_id = reviewer_profile.id,
    assigned_reviewer_name = reviewer_name,
    review_due_at = p_review_due_at,
    updated_at = now()
  where id = p_document_id
    and archived_at is null
    and review_status in ('draft', 'needs_changes')
  returning * into updated_document;

  if not found then
    raise exception 'The document was not found or cannot be submitted from its current review status.';
  end if;

  insert into public.document_notifications (
    recipient_user_id,
    actor_user_id,
    document_id,
    client_id,
    tax_return_id,
    notification_type,
    title,
    message,
    metadata
  )
  values (
    reviewer_profile.id,
    auth.uid(),
    updated_document.id,
    updated_document.client_id,
    updated_document.tax_return_id,
    'document_review_requested',
    'Document awaiting review',
    format('%s submitted "%s" for your review.', requester_name, updated_document.original_file_name),
    jsonb_build_object(
      'reviewerName', reviewer_name,
      'requesterName', requester_name,
      'reviewDueAt', updated_document.review_due_at
    )
  );

  return next updated_document;
end;
$$;

revoke all on function public.request_document_review_assignment(uuid, uuid, timestamptz) from public;
revoke all on function public.request_document_review_assignment(uuid, uuid, timestamptz) from anon;
grant execute on function public.request_document_review_assignment(uuid, uuid, timestamptz) to authenticated;

create or replace function public.list_my_document_notifications(
  p_limit integer default 20
)
returns table (
  id uuid,
  notification_type text,
  title text,
  message text,
  document_id uuid,
  client_id uuid,
  tax_return_id uuid,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  safe_limit integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  safe_limit := least(greatest(coalesce(p_limit, 20), 1), 100);

  return query
  select
    notification.id,
    notification.notification_type,
    notification.title,
    notification.message,
    notification.document_id,
    notification.client_id,
    notification.tax_return_id,
    notification.metadata,
    notification.read_at,
    notification.created_at
  from public.document_notifications as notification
  where notification.recipient_user_id = auth.uid()
    and notification.archived_at is null
  order by notification.created_at desc
  limit safe_limit;
end;
$$;

create or replace function public.get_my_unread_document_notification_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::bigint
  from public.document_notifications as notification
  where notification.recipient_user_id = auth.uid()
    and notification.read_at is null
    and notification.archived_at is null
    and public.current_user_is_active();
$$;

create or replace function public.mark_document_notification_read(
  p_notification_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  update public.document_notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and recipient_user_id = auth.uid()
    and archived_at is null;

  if not found then
    raise exception 'Notification not found.';
  end if;
end;
$$;

create or replace function public.mark_all_document_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  update public.document_notifications
  set read_at = now()
  where recipient_user_id = auth.uid()
    and read_at is null
    and archived_at is null;

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

revoke all on function public.list_my_document_notifications(integer) from public;
revoke all on function public.list_my_document_notifications(integer) from anon;
grant execute on function public.list_my_document_notifications(integer) to authenticated;

revoke all on function public.get_my_unread_document_notification_count() from public;
revoke all on function public.get_my_unread_document_notification_count() from anon;
grant execute on function public.get_my_unread_document_notification_count() to authenticated;

revoke all on function public.mark_document_notification_read(uuid) from public;
revoke all on function public.mark_document_notification_read(uuid) from anon;
grant execute on function public.mark_document_notification_read(uuid) to authenticated;

revoke all on function public.mark_all_document_notifications_read() from public;
revoke all on function public.mark_all_document_notifications_read() from anon;
grant execute on function public.mark_all_document_notifications_read() to authenticated;

commit;