-- Phase 9.2 corrective migration
-- Adds workflow objects that were missing from the remote schema.
do $$ begin if not exists (
  select 1
  from pg_type
  where typname = 'tax_return_workflow_status'
) then create type public.tax_return_workflow_status as enum (
  'intake',
  'documents_pending',
  'ready_for_preparation',
  'in_preparation',
  'review',
  'signature_pending',
  'ready_to_file',
  'filed',
  'completed',
  'on_hold'
);
end if;
end $$;
alter table public.tax_returns
add column if not exists workflow_status public.tax_return_workflow_status not null default 'intake';
alter table public.tax_returns
add column if not exists workflow_status_changed_at timestamptz not null default now();
alter table public.tax_returns
add column if not exists assigned_preparer_id uuid;
alter table public.tax_returns
add column if not exists assigned_at timestamptz;
alter table public.tax_returns
add column if not exists workflow_hold_reason text;
alter table public.tax_returns
add column if not exists workflow_held_at timestamptz;
alter table public.tax_returns
add column if not exists workflow_completed_at timestamptz;
comment on column public.tax_returns.workflow_status is 'Current office workflow stage for the tax return.';
comment on column public.tax_returns.workflow_status_changed_at is 'Date and time the workflow status last changed.';
comment on column public.tax_returns.assigned_preparer_id is 'User assigned to prepare or manage the tax return.';
comment on column public.tax_returns.assigned_at is 'Date and time the return was assigned to a preparer.';
comment on column public.tax_returns.workflow_hold_reason is 'Reason the tax return workflow was placed on hold.';
comment on column public.tax_returns.workflow_held_at is 'Date and time the tax return workflow was placed on hold.';
comment on column public.tax_returns.workflow_completed_at is 'Date and time the tax return workflow was completed.';
create index if not exists tax_returns_workflow_status_idx on public.tax_returns (workflow_status);
create index if not exists tax_returns_assigned_preparer_id_idx on public.tax_returns (assigned_preparer_id);
create index if not exists tax_returns_workflow_status_changed_at_idx on public.tax_returns (workflow_status_changed_at desc);
create or replace function public.set_tax_return_workflow_timestamps() returns trigger language plpgsql security invoker
set search_path = public as $$ begin if new.workflow_status is distinct
from old.workflow_status then new.workflow_status_changed_at = now();
if new.workflow_status = 'on_hold' then new.workflow_held_at = now();
elsif old.workflow_status = 'on_hold' then new.workflow_held_at = null;
new.workflow_hold_reason = null;
end if;
if new.workflow_status = 'completed' then new.workflow_completed_at = now();
elsif old.workflow_status = 'completed' then new.workflow_completed_at = null;
end if;
end if;
if new.assigned_preparer_id is distinct
from old.assigned_preparer_id then if new.assigned_preparer_id is null then new.assigned_at = null;
else new.assigned_at = now();
end if;
end if;
return new;
end;
$$;
drop trigger if exists set_tax_return_workflow_timestamps on public.tax_returns;
create trigger set_tax_return_workflow_timestamps before
update on public.tax_returns for each row execute function public.set_tax_return_workflow_timestamps();
alter table public.tax_returns drop constraint if exists tax_returns_workflow_hold_reason_length_check;
alter table public.tax_returns
add constraint tax_returns_workflow_hold_reason_length_check check (
    workflow_hold_reason is null
    or char_length(workflow_hold_reason) <= 1000
  );