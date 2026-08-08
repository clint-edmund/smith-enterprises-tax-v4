-- Phase 8.5.3C
-- Tax return activity and audit logging
--
-- Apply this migration in Supabase before testing Recent Activity.

begin;

create table if not exists public.tax_return_activity (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null
    references public.tax_returns(id)
    on delete cascade,
  action text not null,
  actor_id uuid null
    references auth.users(id)
    on delete set null,
  occurred_at timestamptz not null default now()
);

create index if not exists
  tax_return_activity_return_id_occurred_at_idx
on public.tax_return_activity (
  return_id,
  occurred_at desc
);

alter table public.tax_return_activity
  enable row level security;

drop policy if exists
  "Authenticated users can read return activity"
on public.tax_return_activity;

create policy
  "Authenticated users can read return activity"
on public.tax_return_activity
for select
to authenticated
using (true);

revoke all
on public.tax_return_activity
from anon;

grant select
on public.tax_return_activity
to authenticated;

create or replace function public.describe_tax_return_change(
  old_record public.tax_returns,
  new_record public.tax_returns
)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  change_messages text[] := array[]::text[];
begin
  if old_record.status is distinct from new_record.status then
    change_messages := array_append(
      change_messages,
      format(
        'Workflow status changed from %s to %s',
        replace(old_record.status::text, '_', ' '),
        replace(new_record.status::text, '_', ' ')
      )
    );
  end if;

  if old_record.assigned_preparer_id
      is distinct from
      new_record.assigned_preparer_id then
    change_messages := array_append(
      change_messages,
      case
        when new_record.assigned_preparer_id is null
          then 'Assigned preparer was cleared'
        when old_record.assigned_preparer_id is null
          then 'A preparer was assigned'
        else 'Assigned preparer was changed'
      end
    );
  end if;

  if old_record.assigned_reviewer_id
      is distinct from
      new_record.assigned_reviewer_id then
    change_messages := array_append(
      change_messages,
      case
        when new_record.assigned_reviewer_id is null
          then 'Assigned reviewer was cleared'
        when old_record.assigned_reviewer_id is null
          then 'A reviewer was assigned'
        else 'Assigned reviewer was changed'
      end
    );
  end if;

  if old_record.date_received
      is distinct from
      new_record.date_received then
    change_messages := array_append(
      change_messages,
      'Date received was updated'
    );
  end if;

  if old_record.due_date
      is distinct from
      new_record.due_date then
    change_messages := array_append(
      change_messages,
      'Due date was updated'
    );
  end if;

  if old_record.filed_date
      is distinct from
      new_record.filed_date then
    change_messages := array_append(
      change_messages,
      'Filed date was updated'
    );
  end if;

  if old_record.accepted_date
      is distinct from
      new_record.accepted_date then
    change_messages := array_append(
      change_messages,
      'Accepted date was updated'
    );
  end if;

  if old_record.preparation_fee
      is distinct from
      new_record.preparation_fee
     or old_record.discount_amount
      is distinct from
      new_record.discount_amount then
    change_messages := array_append(
      change_messages,
      'Return fees were updated'
    );
  end if;

  if old_record.description
      is distinct from
      new_record.description
     or old_record.notes
      is distinct from
      new_record.notes then
    change_messages := array_append(
      change_messages,
      'Return details were updated'
    );
  end if;

  if old_record.federal_return_required
      is distinct from
      new_record.federal_return_required
     or old_record.state_return_required
      is distinct from
      new_record.state_return_required
     or old_record.local_return_required
      is distinct from
      new_record.local_return_required
     or old_record.extension_filed
      is distinct from
      new_record.extension_filed
     or old_record.extension_date
      is distinct from
      new_record.extension_date then
    change_messages := array_append(
      change_messages,
      'Filing requirements were updated'
    );
  end if;

  if array_length(
    change_messages,
    1
  ) is null then
    return 'Tax return was updated';
  end if;

  return array_to_string(
    change_messages,
    '; '
  );
end;
$$;

create or replace function public.record_tax_return_activity()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  activity_action text;
begin
  if tg_op = 'INSERT' then
    activity_action :=
      'Tax return was created';
  elsif tg_op = 'UPDATE' then
    activity_action :=
      public.describe_tax_return_change(
        old,
        new
      );
  else
    return new;
  end if;

  insert into public.tax_return_activity (
    return_id,
    action,
    actor_id,
    occurred_at
  )
  values (
    new.id,
    activity_action,
    auth.uid(),
    now()
  );

  return new;
end;
$$;

drop trigger if exists
  record_tax_return_activity_trigger
on public.tax_returns;

create trigger
  record_tax_return_activity_trigger
after insert or update
on public.tax_returns
for each row
execute function
  public.record_tax_return_activity();

drop function if exists public.get_tax_return_activity(
  uuid,
  integer
);

create function public.get_tax_return_activity(
  requested_return_id uuid,
  requested_limit integer default 25
)
returns table (
  id uuid,
  action text,
  actor_id uuid,
  actor_name text,
  occurred_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    activity.id,
    activity.action,
    activity.actor_id,
    coalesce(
      nullif(
        trim(
          concat_ws(
            ' ',
            profile.first_name,
            profile.last_name
          )
        ),
        ''
      ),
      profile.display_name,
      profile.email,
      auth_user.email,
      'System'
    ) as actor_name,
    activity.occurred_at
  from public.tax_return_activity
    as activity
  left join public.profiles
    as profile
    on profile.id =
      activity.actor_id
  left join auth.users
    as auth_user
    on auth_user.id =
      activity.actor_id
  where activity.return_id =
    requested_return_id
  order by
    activity.occurred_at desc
  limit greatest(
    least(
      coalesce(
        requested_limit,
        25
      ),
      100
    ),
    1
  );
$$;

revoke all
on function public.get_tax_return_activity(
  uuid,
  integer
)
from public;

grant execute
on function public.get_tax_return_activity(
  uuid,
  integer
)
to authenticated;

-- Add one initial activity item for existing returns that
-- do not yet have activity history.
insert into public.tax_return_activity (
  return_id,
  action,
  actor_id,
  occurred_at
)
select
  tax_return.id,
  'Existing tax return added to activity history',
  null,
  tax_return.created_at
from public.tax_returns
  as tax_return
where not exists (
  select 1
  from public.tax_return_activity
    as activity
  where activity.return_id =
    tax_return.id
);

commit;
