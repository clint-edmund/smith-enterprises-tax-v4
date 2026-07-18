-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 9.8.2 - Executive dashboard metrics
-- ============================================================

create or replace function public.get_dashboard_executive_metrics()
returns table (
  projected_revenue numeric,
  returns_due_next_7_days bigint,
  returns_due_next_30_days bigint,
  completed_this_week bigint,
  completed_this_month bigint,
  average_preparation_days numeric,
  average_review_days numeric,
  review_queue bigint,
  average_staff_utilization numeric
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
  with return_metrics as (
    select
      tax_return.id,