create table public.return_workflow_history (
  id uuid
    primary key
    default gen_random_uuid(),

  tax_return_id uuid
    not null
    references public.tax_returns(id)
    on delete cascade,

  client_id uuid
    not null
    references public.clients(id)
    on delete cascade,

  event_type text
    not null,

  event_label text
    not null,

  event_description text,

  previous_status text,

  new_status text,

  actor_user_id uuid,

  is_client_visible boolean
    not null
    default true,

  event_data jsonb
    not null
    default '{}'::jsonb,

  occurred_at timestamptz
    not null
    default now(),

  created_at timestamptz
    not null
    default now(),

  constraint return_workflow_history_event_type_not_blank
    check (length(trim(event_type)) > 0),

  constraint return_workflow_history_event_label_not_blank
    check (length(trim(event_label)) > 0),

  constraint return_workflow_history_event_data_is_object
    check (jsonb_typeof(event_data) = 'object')
);

create index return_workflow_history_tax_return_id_idx
  on public.return_workflow_history (
    tax_return_id,
    occurred_at desc
  );

create index return_workflow_history_client_id_idx
  on public.return_workflow_history (
    client_id,
    occurred_at desc
  );

create index return_workflow_history_client_visible_idx
  on public.return_workflow_history (
    tax_return_id,
    occurred_at desc
  )
  where is_client_visible = true;

alter table public.return_workflow_history
  enable row level security;

revoke all
on table public.return_workflow_history
from public;

revoke all
on table public.return_workflow_history
from anon;

revoke all
on table public.return_workflow_history
from authenticated;

create or replace function public.record_return_workflow_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.return_workflow_history (
      tax_return_id,
      client_id,
      event_type,
      event_label,
      event_description,
      new_status,
      actor_user_id,
      is_client_visible,
      event_data,
      occurred_at
    )
    values (
      new.id,
      new.client_id,
      'return_created',
      'Tax return created',
      'Your tax return was added to the Smith Enterprises system.',
      new.status::text,
      auth.uid(),
      true,
      jsonb_build_object(
        'tax_year',
        new.tax_year,
        'return_type',
        new.return_type::text,
        'tax_form',
        new.tax_form::text
      ),
      coalesce(
        new.created_at,
        now()
      )
    );

    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
  then
    insert into public.return_workflow_history (
      tax_return_id,
      client_id,
      event_type,
      event_label,
      event_description,
      previous_status,
      new_status,
      actor_user_id,
      is_client_visible,
      event_data,
      occurred_at
    )
    values (
      new.id,
      new.client_id,
      'status_changed',
      'Return status updated',
      concat(
        'Your tax return status changed from ',
        replace(
          initcap(old.status::text),
          '_',
          ' '
        ),
        ' to ',
        replace(
          initcap(new.status::text),
          '_',
          ' '
        ),
        '.'
      ),
      old.status::text,
      new.status::text,
      auth.uid(),
      true,
      jsonb_build_object(
        'previous_status',
        old.status::text,
        'new_status',
        new.status::text
      ),
      now()
    );
  end if;

  return new;
end;
$$;

revoke all
on function public.record_return_workflow_history()
from public;

drop trigger if exists
  record_return_workflow_history_trigger
on public.tax_returns;

create trigger record_return_workflow_history_trigger
after insert or update of status
on public.tax_returns
for each row
execute function public.record_return_workflow_history();

insert into public.return_workflow_history (
  tax_return_id,
  client_id,
  event_type,
  event_label,
  event_description,
  new_status,
  actor_user_id,
  is_client_visible,
  event_data,
  occurred_at
)
select
  tr.id,
  tr.client_id,
  'current_status_recorded',
  'Current return status recorded',
  concat(
    'Current status: ',
    replace(
      initcap(tr.status::text),
      '_',
      ' '
    ),
    '.'
  ),
  tr.status::text,
  null,
  true,
  jsonb_build_object(
    'tax_year',
    tr.tax_year,
    'return_type',
    tr.return_type::text,
    'tax_form',
    tr.tax_form::text,
    'status',
    tr.status::text,
    'backfilled',
    true
  ),
  coalesce(
    tr.updated_at,
    tr.created_at,
    now()
  )
from public.tax_returns tr
where not exists (
  select 1
  from public.return_workflow_history history
  where history.tax_return_id = tr.id
);