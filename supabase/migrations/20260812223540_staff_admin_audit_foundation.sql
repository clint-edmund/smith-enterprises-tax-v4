begin;

create table if not exists public.staff_admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  target_staff_id uuid,
  action text not null,
  outcome text not null default 'success',
  previous_role public.app_role,
  new_role public.app_role,
  previous_is_active boolean,
  new_is_active boolean,
  target_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
    default timezone('utc'::text, now())
);

alter table public.staff_admin_audit_events
  enable row level security;

alter table public.staff_admin_audit_events
  force row level security;

create index if not exists
  staff_admin_audit_events_actor_idx
on public.staff_admin_audit_events (
  actor_user_id
);

create index if not exists
  staff_admin_audit_events_target_idx
on public.staff_admin_audit_events (
  target_staff_id
);

create index if not exists
  staff_admin_audit_events_created_idx
on public.staff_admin_audit_events (
  created_at desc
);

create policy
  "Administrators can view staff audit events"
on public.staff_admin_audit_events
for select
to authenticated
using (
  public.current_user_is_admin()
);

revoke all
on table public.staff_admin_audit_events
from public;

grant select
on table public.staff_admin_audit_events
to authenticated;

grant all
on table public.staff_admin_audit_events
to service_role;

commit;