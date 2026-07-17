-- Smith Enterprises Tax Management v4
-- Phase 8.6.2C Sprint 1 - Dashboard analytics

create or replace function public.get_dashboard_monthly_financials()
returns table (
  month_start date,
  month_label text,
  fees numeric,
  payments numeric,
  outstanding numeric
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
  with months as (
    select generate_series(
      date_trunc('month', current_date) - interval '5 months',
      date_trunc('month', current_date),
      interval '1 month'
    )::date as month_start
  ),
  return_fees as (
    select
      date_trunc('month', tax_return.date_received)::date as month_start,
      coalesce(sum(tax_return.preparation_fee - tax_return.discount_amount), 0)::numeric as fees
    from public.tax_returns as tax_return
    where tax_return.date_received >= date_trunc('month', current_date) - interval '5 months'
    group by 1
  ),
  payment_totals as (
    select
      date_trunc('month', payment.payment_date)::date as month_start,
      coalesce(sum(payment.amount), 0)::numeric as payments
    from public.payments as payment
    where payment.is_voided = false
      and payment.payment_date >= date_trunc('month', current_date) - interval '5 months'
    group by 1
  )
  select
    months.month_start,
    to_char(months.month_start, 'Mon YYYY') as month_label,
    coalesce(return_fees.fees, 0)::numeric as fees,
    coalesce(payment_totals.payments, 0)::numeric as payments,
    greatest(
      coalesce(return_fees.fees, 0) - coalesce(payment_totals.payments, 0),
      0
    )::numeric as outstanding
  from months
  left join return_fees using (month_start)
  left join payment_totals using (month_start)
  order by months.month_start;
end;
$$;

revoke all on function public.get_dashboard_monthly_financials() from public;
revoke all on function public.get_dashboard_monthly_financials() from anon;
grant execute on function public.get_dashboard_monthly_financials() to authenticated;

create or replace function public.get_dashboard_status_metrics()
returns table (
  status public.return_status,
  status_label text,
  return_count bigint
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
    tax_return.status,
    initcap(replace(tax_return.status::text, '_', ' ')) as status_label,
    count(*)::bigint as return_count
  from public.tax_returns as tax_return
  group by tax_return.status
  order by count(*) desc, tax_return.status::text;
end;
$$;

revoke all on function public.get_dashboard_status_metrics() from public;
revoke all on function public.get_dashboard_status_metrics() from anon;
grant execute on function public.get_dashboard_status_metrics() to authenticated;

create or replace function public.get_dashboard_staff_workload()
returns table (
  staff_id uuid,
  staff_name text,
  assigned_returns bigint,
  overdue_returns bigint,
  awaiting_review_returns bigint
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
  with staff as (
    select
      profile.id,
      coalesce(
        nullif(profile.display_name, ''),
        nullif(concat_ws(' ', profile.first_name, profile.last_name), ''),
        profile.email
      ) as staff_name
    from public.profiles as profile
    where profile.is_active = true
      and profile.role in ('administrator', 'manager', 'preparer', 'reviewer')
  )
  select
    staff.id,
    staff.staff_name,
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as assigned_returns,
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date < current_date
    )::bigint as overdue_returns,
    count(tax_return.id) filter (
      where tax_return.assigned_reviewer_id = staff.id
        and tax_return.status in ('ready_for_review', 'under_review')
    )::bigint as awaiting_review_returns
  from staff
  left join public.tax_returns as tax_return
    on tax_return.assigned_preparer_id = staff.id
    or tax_return.assigned_reviewer_id = staff.id
  group by staff.id, staff.staff_name
  having
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
    ) > 0
    or count(tax_return.id) filter (
      where tax_return.assigned_reviewer_id = staff.id
        and tax_return.status in ('ready_for_review', 'under_review')
    ) > 0
  order by assigned_returns desc, overdue_returns desc, staff.staff_name
  limit 10;
end;
$$;

revoke all on function public.get_dashboard_staff_workload() from public;
revoke all on function public.get_dashboard_staff_workload() from anon;
grant execute on function public.get_dashboard_staff_workload() to authenticated;
