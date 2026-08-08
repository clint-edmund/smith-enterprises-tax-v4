-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 9.6.2 - Staff workload summary
-- ============================================================

drop function if exists public.get_staff_workload_summary();

create or replace function public.get_staff_workload_summary()
returns table (
  staff_id uuid,
  display_name text,
  role text,
  assigned_preparation integer,
  assigned_review integer,
  in_preparation integer,
  awaiting_review integer,
  overdue integer,
  due_next_seven_days integer,
  on_hold integer
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
    profile.id as staff_id,

    coalesce(
      nullif(profile.display_name, ''),
      nullif(
        concat_ws(
          ' ',
          profile.first_name,
          profile.last_name
        ),
        ''
      ),
      profile.email
    )::text as display_name,

    profile.role::text as role,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_preparer_id = profile.id
        and tax_return.workflow_status <> 'completed'
    ) as assigned_preparation,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_reviewer_id = profile.id
        and tax_return.workflow_status <> 'completed'
    ) as assigned_review,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_preparer_id = profile.id
        and tax_return.workflow_status = 'in_preparation'
    ) as in_preparation,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_reviewer_id = profile.id
        and tax_return.workflow_status = 'review'
    ) as awaiting_review,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.due_date < current_date
        and tax_return.workflow_status <> 'completed'
    ) as overdue,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.due_date between current_date
          and current_date + 7
        and tax_return.workflow_status <> 'completed'
    ) as due_next_seven_days,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.workflow_status = 'on_hold'
    ) as on_hold

  from public.profiles as profile
  where profile.is_active = true
    and profile.role in (
      'administrator',
      'manager',
      'preparer',
      'reviewer'
    )
  order by
    coalesce(
      nullif(profile.display_name, ''),
      nullif(
        concat_ws(
          ' ',
          profile.first_name,
          profile.last_name
        ),
        ''
      ),
      profile.email
    );
end;
$$;

revoke all
on function public.get_staff_workload_summary()
from public;

revoke all
on function public.get_staff_workload_summary()
from anon;

grant execute
on function public.get_staff_workload_summary()
to authenticated;

comment on function public.get_staff_workload_summary()
is 'Returns preparation, review, deadline, and hold workload metrics for active staff.';