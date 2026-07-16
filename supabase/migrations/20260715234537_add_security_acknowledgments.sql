-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 5 security acknowledgment and event logging
-- ============================================================
-- ------------------------------------------------------------
-- Security acknowledgment records
-- ------------------------------------------------------------
create table public.security_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notice_version text not null,
  accepted_at timestamptz not null default timezone('utc', now()),
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint security_acknowledgments_version_length check (
    length(trim(notice_version)) between 1 and 50
  ),
  constraint security_acknowledgments_user_version_unique unique (user_id, notice_version)
);
create index security_acknowledgments_user_index on public.security_acknowledgments(user_id);
create index security_acknowledgments_accepted_at_index on public.security_acknowledgments(accepted_at desc);
-- ------------------------------------------------------------
-- Enable Row Level Security
-- ------------------------------------------------------------
alter table public.security_acknowledgments enable row level security;
alter table public.security_acknowledgments force row level security;
-- ------------------------------------------------------------
-- Security acknowledgment policies
-- ------------------------------------------------------------
create policy "Users can view their own acknowledgments" on public.security_acknowledgments for
select to authenticated using (user_id = auth.uid());
create policy "Active users can create their own acknowledgments" on public.security_acknowledgments for
insert to authenticated with check (
    public.current_user_is_active()
    and user_id = auth.uid()
  );
create policy "Administrators can view all acknowledgments" on public.security_acknowledgments for
select to authenticated using (public.current_user_is_admin());
-- Acknowledgments are append-only.
-- No UPDATE or DELETE policies are intentionally created.
-- ------------------------------------------------------------
-- Table permissions
-- ------------------------------------------------------------
revoke all on table public.security_acknowledgments
from anon;
grant select,
  insert on table public.security_acknowledgments to authenticated;
-- ------------------------------------------------------------
-- Check whether the current user accepted a notice version
-- ------------------------------------------------------------
create or replace function public.has_accepted_security_notice(requested_notice_version text) returns boolean language sql stable security invoker
set search_path = '' as $$
select exists (
    select 1
    from public.security_acknowledgments
    where user_id = auth.uid()
      and notice_version = requested_notice_version
  );
$$;
revoke all on function public.has_accepted_security_notice(text)
from public;
revoke all on function public.has_accepted_security_notice(text)
from anon;
grant execute on function public.has_accepted_security_notice(text) to authenticated;
-- ------------------------------------------------------------
-- Record acknowledgment and audit event atomically
-- ------------------------------------------------------------
create or replace function public.accept_security_notice(
    requested_notice_version text,
    requested_user_agent text default null,
    requested_metadata jsonb default '{}'::jsonb
  ) returns public.security_acknowledgments language plpgsql security definer
set search_path = '' as $$
declare acknowledgment_record public.security_acknowledgments;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
if requested_notice_version is null
or length(trim(requested_notice_version)) = 0 then raise exception 'A notice version is required.';
end if;
insert into public.security_acknowledgments (
    user_id,
    notice_version,
    user_agent,
    metadata
  )
values (
    auth.uid(),
    trim(requested_notice_version),
    nullif(trim(requested_user_agent), ''),
    coalesce(requested_metadata, '{}'::jsonb)
  ) on conflict (user_id, notice_version) do
update
set user_agent = excluded.user_agent,
  metadata = excluded.metadata
returning * into acknowledgment_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
values (
    auth.uid(),
    'security_notice_accepted',
    'security_acknowledgment',
    acknowledgment_record.id,
    jsonb_build_object(
      'notice_version',
      acknowledgment_record.notice_version,
      'accepted_at',
      acknowledgment_record.accepted_at
    ),
    jsonb_build_object(
      'user_agent',
      requested_user_agent
    ) || coalesce(requested_metadata, '{}'::jsonb)
  );
return acknowledgment_record;
end;
$$;
revoke all on function public.accept_security_notice(text, text, jsonb)
from public;
revoke all on function public.accept_security_notice(text, text, jsonb)
from anon;
grant execute on function public.accept_security_notice(text, text, jsonb) to authenticated;
-- ------------------------------------------------------------
-- Record general authenticated security events
-- ------------------------------------------------------------
create or replace function public.record_security_event(
    requested_action text,
    requested_metadata jsonb default '{}'::jsonb
  ) returns bigint language plpgsql security definer
set search_path = '' as $$
declare audit_log_id bigint;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    metadata
  )
values (
    auth.uid(),
    trim(requested_action),
    'authentication',
    coalesce(requested_metadata, '{}'::jsonb)
  )
returning id into audit_log_id;
return audit_log_id;
end;
$$;
revoke all on function public.record_security_event(text, jsonb)
from public;
revoke all on function public.record_security_event(text, jsonb)
from anon;
grant execute on function public.record_security_event(text, jsonb) to authenticated;
-- ------------------------------------------------------------
-- Documentation
-- ------------------------------------------------------------
comment on table public.security_acknowledgments is 'Versioned records showing that an authenticated staff member accepted the system authorized-use notice.';
comment on function public.accept_security_notice(text, text, jsonb) is 'Records an authorized-use acknowledgment and corresponding audit event.';
comment on function public.record_security_event(text, jsonb) is 'Records an authenticated security event in the append-only audit log.';