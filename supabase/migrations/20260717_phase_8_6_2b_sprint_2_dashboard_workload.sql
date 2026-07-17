-- Smith Enterprises Tax Management v4
-- Phase 8.6.2B Sprint 2 - Personal dashboard workload metrics

create or replace function public.get_dashboard_my_workload()
returns table (
  assigned_to_me bigint,
  review_assigned_to_me bigint,
  due_today bigint,
  due_this_week bigint,
  overdue bigint
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
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as assigned_to_me,
    count(*) filter (
      where tax_return.assigned_reviewer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as review_assigned_to_me,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date = current_date
    )::bigint as due_today,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date >= current_date
        and tax_return.due_date <= current_date + 7
    )::bigint as due_this_week,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date < current_date
    )::bigint as overdue
  from public.tax_returns as tax_return;
end;
$$;

revoke all on function public.get_dashboard_my_workload() from public;
revoke all on function public.get_dashboard_my_workload() from anon;
grant execute on function public.get_dashboard_my_workload() to authenticated;

create index if not exists tax_returns_preparer_status_due_date_index
  on public.tax_returns (assigned_preparer_id, status, due_date);

create index if not exists tax_returns_reviewer_status_index
  on public.tax_returns (assigned_reviewer_id, status);
