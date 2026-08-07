begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  recipient_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null,
  message text not null,

  category text not null
    default 'system'
    check (
      category in (
        'assignment',
        'deadline',
        'payment',
        'client',
        'document',
        'system'
      )
    ),

  priority text not null
    default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'critical'
      )
    ),

  action_url text,
  related_entity_id uuid,
  related_entity_type text,

  is_read boolean not null
    default false,

  read_at timestamptz,

  created_at timestamptz not null
    default now(),

  expires_at timestamptz,

  metadata jsonb not null
    default '{}'::jsonb,

  constraint notifications_read_state_check
    check (
      (
        is_read = false
        and read_at is null
      )
      or
      (
        is_read = true
        and read_at is not null
      )
    )
);

create index if not exists
  notifications_recipient_created_at_idx
on public.notifications (
  recipient_user_id,
  created_at desc
);

create index if not exists
  notifications_recipient_unread_idx
on public.notifications (
  recipient_user_id,
  is_read,
  created_at desc
);

create index if not exists
  notifications_related_entity_idx
on public.notifications (
  related_entity_type,
  related_entity_id
)
where related_entity_id is not null;

alter table public.notifications
  enable row level security;

drop policy if exists
  "Staff can view their notifications"
on public.notifications;

create policy
  "Staff can view their notifications"
on public.notifications
for select
to authenticated
using (
  (select auth.uid()) is not null
  and
  recipient_user_id =
    (select auth.uid())
);

drop policy if exists
  "Staff can update their notifications"
on public.notifications;

create policy
  "Staff can update their notifications"
on public.notifications
for update
to authenticated
using (
  (select auth.uid()) is not null
  and
  recipient_user_id =
    (select auth.uid())
)
with check (
  recipient_user_id =
    (select auth.uid())
);

drop policy if exists
  "Staff can delete their notifications"
on public.notifications;

create policy
  "Staff can delete their notifications"
on public.notifications
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and
  recipient_user_id =
    (select auth.uid())
);

revoke all
on public.notifications
from anon;

grant select, update, delete
on public.notifications
to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime
      add table public.notifications;
  end if;
end
$$;

commit;