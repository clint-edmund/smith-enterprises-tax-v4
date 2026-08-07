-- ============================================================================
-- Phase 10.5.3E
-- Assign tax-return preparer and record dashboard activity
-- ============================================================================

create or replace function public.assign_tax_return_preparer(
  requested_return_id uuid,
  requested_preparer_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_return public.tax_returns%rowtype;
  selected_preparer public.profiles%rowtype;
  previous_preparer_id uuid;
  previous_preparer_name text;
  selected_preparer_name text;
  activity_action text;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You are not authorized to assign tax returns.';
  end if;

  select tax_return.*
  into current_return
  from public.tax_returns as tax_return
  where tax_return.id = requested_return_id
  for update;

  if not found then
    raise exception
      'The tax return was not found.';
  end if;

  previous_preparer_id :=
    current_return.assigned_preparer_id;

  if previous_preparer_id is not null then
    select coalesce(
      nullif(profile.display_name, ''),
      nullif(
        concat_ws(
          ' ',
          profile.first_name,
          profile.last_name
        ),
        ''
      ),
      profile.email,
      'Unknown Staff Member'
    )
    into previous_preparer_name
    from public.profiles as profile
    where profile.id = previous_preparer_id;
  end if;

  if requested_preparer_id is not null then
    select profile.*
    into selected_preparer
    from public.profiles as profile
    where profile.id = requested_preparer_id
      and profile.is_active = true;

    if not found then
      raise exception
        'The selected preparer is not an active staff member.';
    end if;

    if selected_preparer.role not in (
      'administrator',
      'manager',
      'preparer'
    ) then
      raise exception
        'The selected staff member cannot be assigned as a preparer.';
    end if;

    selected_preparer_name :=
      coalesce(
        nullif(
          selected_preparer.display_name,
          ''
        ),
        nullif(
          concat_ws(
            ' ',
            selected_preparer.first_name,
            selected_preparer.last_name
          ),
          ''
        ),
        selected_preparer.email,
        'Unknown Staff Member'
      );
  end if;

  if previous_preparer_id
    is not distinct from
    requested_preparer_id
  then
    return;
  end if;

  update public.tax_returns
  set
    assigned_preparer_id =
      requested_preparer_id,
    updated_at =
      now()
  where id = requested_return_id;

  activity_action :=
    case
      when requested_preparer_id is null
        then 'return_preparer_unassigned'
      else 'return_preparer_assigned'
    end;

  insert into public.audit_logs (
    action,
    entity_type,
    entity_id,
    actor_id,
    old_values,
    new_values,
    metadata
  )
  values (
    activity_action,
    'tax_return',
    requested_return_id,
    auth.uid(),
    jsonb_build_object(
      'assigned_preparer_id',
      previous_preparer_id,
      'assigned_preparer_name',
      previous_preparer_name
    ),
    jsonb_build_object(
      'assigned_preparer_id',
      requested_preparer_id,
      'assigned_preparer_name',
      selected_preparer_name
    ),
    jsonb_build_object(
      'source',
      'dashboard_priority_queue',
      'client_id',
      current_return.client_id,
      'tax_year',
      current_return.tax_year,
      'return_type',
      current_return.return_type
    )
  );
end;
$$;

revoke all on function
  public.assign_tax_return_preparer(
    uuid,
    uuid
  )
from public;

revoke all on function
  public.assign_tax_return_preparer(
    uuid,
    uuid
  )
from anon;

grant execute on function
  public.assign_tax_return_preparer(
    uuid,
    uuid
  )
to authenticated;

comment on function
  public.assign_tax_return_preparer(
    uuid,
    uuid
  )
is
  'Assigns or removes a tax-return preparer and records the change in the audit log.';