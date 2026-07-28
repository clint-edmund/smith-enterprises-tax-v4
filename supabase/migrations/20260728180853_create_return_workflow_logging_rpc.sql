create or replace function public.log_return_workflow(
  requested_return_id uuid,
  requested_event_type text,
  requested_event_label text,
  requested_event_description text default null,
  requested_is_client_visible boolean default true,
  requested_event_data jsonb default '{}'::jsonb,
  requested_occurred_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  return_client_id uuid;
  workflow_history_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception 'An active staff account is required.';
  end if;

  if requested_return_id is null then
    raise exception 'A tax return ID is required.';
  end if;

  if nullif(trim(requested_event_type), '') is null then
    raise exception 'An event type is required.';
  end if;

  if nullif(trim(requested_event_label), '') is null then
    raise exception 'An event label is required.';
  end if;

  if requested_event_data is null then
    requested_event_data := '{}'::jsonb;
  end if;

  if jsonb_typeof(requested_event_data) <> 'object' then
    raise exception 'Event data must be a JSON object.';
  end if;

  select tax_return.client_id
  into return_client_id
  from public.tax_returns tax_return
  where tax_return.id = requested_return_id;

  if return_client_id is null then
    raise exception 'Tax return not found.';
  end if;

  insert into public.return_workflow_history (
    tax_return_id,
    client_id,
    event_type,
    event_label,
    event_description,
    actor_user_id,
    is_client_visible,
    event_data,
    occurred_at
  )
  values (
    requested_return_id,
    return_client_id,
    lower(trim(requested_event_type)),
    trim(requested_event_label),
    nullif(trim(requested_event_description), ''),
    current_user_id,
    requested_is_client_visible,
    requested_event_data,
    coalesce(
      requested_occurred_at,
      now()
    )
  )
  returning id
  into workflow_history_id;

  return workflow_history_id;
end;
$$;

revoke all
on function public.log_return_workflow(
  uuid,
  text,
  text,
  text,
  boolean,
  jsonb,
  timestamptz
)
from public;

grant execute
on function public.log_return_workflow(
  uuid,
  text,
  text,
  text,
  boolean,
  jsonb,
  timestamptz
)
to authenticated;