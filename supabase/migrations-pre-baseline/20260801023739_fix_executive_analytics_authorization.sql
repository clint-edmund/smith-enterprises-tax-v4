-- RC1.4.1B.1 authorization correction
--
-- Align the executive analytics RPC with the application's
-- existing database role helper functions.

create or replace function public.can_view_executive_financial_analytics()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_is_active()
    and (
      public.current_user_is_admin()
      or public.current_user_role() = 'manager'
    );
$$;

revoke all
on function public.can_view_executive_financial_analytics()
from public;

grant execute
on function public.can_view_executive_financial_analytics()
to authenticated;


-- RC1.4.1B.1 — Executive Financial Analytics
-- Adds one read-only RPC used by the management dashboard.

create or replace function public.get_executive_financial_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  
  today_date date := current_date;
  year_start date := date_trunc('year', current_date)::date;
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if not public.can_view_executive_financial_analytics() then
    raise exception 'You are not authorized to view executive financial analytics.';
  end if;

  with
  active_payments as (
    select
      payment.id,
      payment.tax_return_id,
      payment.amount,
      payment.payment_date,
      payment.payment_method
    from public.return_payments payment
    where payment.is_voided = false
  ),
  return_financials as (
    select
      tax_return.id,
      tax_return.assigned_preparer_id,
      greatest(
        coalesce(tax_return.preparation_fee, 0) -
        coalesce(tax_return.discount_amount, 0),
        0
      ) as net_fee,
      coalesce(sum(active_payment.amount), 0) as total_paid
    from public.tax_returns tax_return
    left join active_payments active_payment
      on active_payment.tax_return_id = tax_return.id
    group by
      tax_return.id,
      tax_return.assigned_preparer_id,
      tax_return.preparation_fee,
      tax_return.discount_amount
  ),
  period_metrics as (
    select
      coalesce(sum(amount) filter (
        where payment_date = today_date
      ), 0) as today_revenue,
      count(*) filter (
        where payment_date = today_date
      ) as today_count,

      coalesce(sum(amount) filter (
        where payment_date = today_date - 1
      ), 0) as yesterday_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 6 and today_date
      ), 0) as last_7_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 13 and today_date - 7
      ), 0) as previous_7_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 29 and today_date
      ), 0) as last_30_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date >= year_start
          and payment_date <= today_date
      ), 0) as year_to_date_revenue
    from active_payments
  ),
  collection_metrics as (
    select
      coalesce(sum(net_fee), 0) as total_fees,
      coalesce(sum(total_paid), 0) as total_collected,
      coalesce(sum(greatest(net_fee - total_paid, 0)), 0) as outstanding,
      count(*) filter (
        where greatest(net_fee - total_paid, 0) > 0
      ) as returns_awaiting_payment
    from return_financials
  ),
  payment_methods as (
    select
      payment_method,
      count(*) as payment_count,
      coalesce(sum(amount), 0) as total_amount
    from active_payments
    group by payment_method
  ),
  preparer_metrics as (
    select
      profile.id as preparer_id,
      coalesce(
        nullif(trim(profile.display_name), ''),
        nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
        profile.email,
        'Unassigned'
      ) as preparer_name,
      count(return_financial.id) as return_count,
      coalesce(sum(return_financial.net_fee), 0) as total_fees,
      coalesce(sum(return_financial.total_paid), 0) as total_collected,
      coalesce(
        sum(
          greatest(
            return_financial.net_fee - return_financial.total_paid,
            0
          )
        ),
        0
      ) as outstanding
    from public.profiles profile
    join return_financials return_financial
      on return_financial.assigned_preparer_id = profile.id
    where profile.role in ('administrator', 'manager', 'preparer')
    group by
      profile.id,
      profile.display_name,
      profile.first_name,
      profile.last_name,
      profile.email
    order by total_collected desc, total_fees desc
    limit 5
  ),
  daily_snapshot as (
    select
      (
        select count(*)
        from public.tax_returns tax_return
        where (
          tax_return.workflow_completed_at::date = today_date
          or (
            tax_return.workflow_completed_at is null
            and tax_return.status = 'completed'
            and tax_return.updated_at::date = today_date
          )
        )
      ) as returns_completed_today,

      (
        select count(*)
        from public.tax_returns tax_return
        where tax_return.filed_date = today_date
      ) as returns_filed_today,

      (
        select count(*)
        from public.clients client
        where client.created_at::date = today_date
      ) as new_clients_today
  )
  select jsonb_build_object(
    'periods',
    jsonb_build_object(
      'todayRevenue', period.today_revenue,
      'todayPaymentCount', period.today_count,
      'yesterdayRevenue', period.yesterday_revenue,
      'last7DaysRevenue', period.last_7_days_revenue,
      'previous7DaysRevenue', period.previous_7_days_revenue,
      'last30DaysRevenue', period.last_30_days_revenue,
      'yearToDateRevenue', period.year_to_date_revenue,
      'averageDailyRevenue',
        case
          when today_date < year_start then 0
          else round(
            period.year_to_date_revenue /
            greatest((today_date - year_start) + 1, 1),
            2
          )
        end
    ),
    'collection',
    jsonb_build_object(
      'totalFees', collection.total_fees,
      'totalCollected', collection.total_collected,
      'outstandingReceivables', collection.outstanding,
      'returnsAwaitingPayment', collection.returns_awaiting_payment,
      'collectionRate',
        case
          when collection.total_fees <= 0 then 0
          else round(
            (collection.total_collected / collection.total_fees) * 100,
            1
          )
        end
    ),
    'paymentMethods',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'paymentMethod', method.payment_method,
            'paymentCount', method.payment_count,
            'totalAmount', method.total_amount
          )
          order by method.total_amount desc
        )
        from payment_methods method
      ),
      '[]'::jsonb
    ),
    'preparers',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'preparerId', preparer.preparer_id,
            'preparerName', preparer.preparer_name,
            'returnCount', preparer.return_count,
            'totalFees', preparer.total_fees,
            'totalCollected', preparer.total_collected,
            'outstandingReceivables', preparer.outstanding,
            'collectionRate',
              case
                when preparer.total_fees <= 0 then 0
                else round(
                  (preparer.total_collected / preparer.total_fees) * 100,
                  1
                )
              end
          )
          order by preparer.total_collected desc
        )
        from preparer_metrics preparer
      ),
      '[]'::jsonb
    ),
    'dailySnapshot',
    jsonb_build_object(
      'returnsCompletedToday', snapshot.returns_completed_today,
      'paymentsReceivedToday', period.today_count,
      'revenueToday', period.today_revenue,
      'returnsAwaitingPayment', collection.returns_awaiting_payment,
      'returnsFiledToday', snapshot.returns_filed_today,
      'newClientsToday', snapshot.new_clients_today
    ),
    'generatedAt',
    now()
  )
  into result
  from period_metrics period
  cross join collection_metrics collection
  cross join daily_snapshot snapshot;

  return result;
end;
$$;

revoke all on function public.get_executive_financial_analytics() from public;
grant execute on function public.get_executive_financial_analytics() to authenticated;