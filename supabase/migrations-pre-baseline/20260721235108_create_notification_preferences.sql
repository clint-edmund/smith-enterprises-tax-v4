create table if not exists public.notification_preferences (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    assignment_notifications boolean not null default true,
    client_notifications boolean not null default true,
    return_notifications boolean not null default true,
    payment_notifications boolean not null default true,
    system_notifications boolean not null default true,
    high_priority_notifications boolean not null default true,
    security_notifications boolean not null default true,
    browser_notifications boolean not null default false,
    email_notifications boolean not null default false,
    daily_digest boolean not null default false,
    weekly_digest boolean not null default false,
    quiet_hours_enabled boolean not null default false,
    quiet_hours_start time,
    quiet_hours_end time,
    badge_counter boolean not null default true,
    notification_sound boolean not null default true,
    desktop_toasts boolean not null default true,
    auto_mark_read boolean not null default false,
    retention_days integer not null default 90,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique(user_id)
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists update_notification_preferences_updated_at
on public.notification_preferences;

create trigger update_notification_preferences_updated_at
before update
on public.notification_preferences
for each row
execute function public.update_updated_at_column();

alter table public.notification_preferences
enable row level security;

drop policy if exists
"Users can view their notification preferences"
on public.notification_preferences;

create policy
"Users can view their notification preferences"
on public.notification_preferences
for select
using (
    auth.uid() = user_id
);

drop policy if exists
"Users can update their notification preferences"
on public.notification_preferences;

create policy
"Users can update their notification preferences"
on public.notification_preferences
for update
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

drop policy if exists
"Users can insert their notification preferences"
on public.notification_preferences;

create policy
"Users can insert their notification preferences"
on public.notification_preferences
for insert
with check (
    auth.uid() = user_id
);