-- Smith Enterprises Tax Management v4
-- Phase 8.6.1 - Live dashboard operational metrics

drop function if exists public.get_dashboard_summary();

create function public.get_dashboard_summary()
returns table (
  active_clients bigint,
  total_returns bigint,
  open_returns bigint,
  completed_returns bigint,
  in_progress_returns bigint,
  awaiting_review_returns bigint,
  documents_pending bigint,
  upcoming_deadlines bigint,
  overdue_returns bigint,
  unassigned_returns bigint,
  total_fees numeric,
  total_payments numeric,
  outstanding_balance numeric
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
  with client_totals as (
    select count(*) filter (where client.status = 'active')::bigint as active_clients
    from public.clients as client
  ),
  return_totals as (
    select
      count(*)::bigint as total_returns,
      count(*) filter (where tax_return.status not in ('completed', 'accepted'))::bigint as open_returns,
      count(*) filter (where tax_return.status in ('completed', 'accepted'))::bigint as completed_returns,
      count(*) filter (where tax_return.status = 'in_progress')::bigint as in_progress_returns,
      count(*) filter (where tax_return.status in ('ready_for_review', 'under_review'))::bigint as awaiting_review_returns,
      count(*) filter (where tax_return.status = 'documents_pending')::bigint as documents_pending,
      count(*) filter (
        where tax_return.status not in ('completed', 'accepted')
          and tax_return.due_date >= current_date
          and tax_return.due_date <= current_date + 14
      )::bigint as upcoming_deadlines,
      count(*) filter (
        where tax_return.status not in ('completed', 'accepted')
          and tax_return.due_date < current_date
      )::bigint as overdue_returns,
      count(*) filter (
        where tax_return.status not in ('completed', 'accepted')
          and tax_return.assigned_preparer_id is null
      )::bigint as unassigned_returns,
      coalesce(sum(tax_return.preparation_fee - tax_return.discount_amount), 0)::numeric as total_fees
    from public.tax_returns as tax_return
  ),
  payment_totals as (
    select coalesce(sum(payment.amount) filter (where payment.is_voided = false), 0)::numeric as total_payments
    from public.payments as payment
  )
  select
    client_totals.active_clients,
    return_totals.total_returns,
    return_totals.open_returns,
    return_totals.completed_returns,
    return_totals.in_progress_returns,
    return_totals.awaiting_review_returns,
    return_totals.documents_pending,
    return_totals.upcoming_deadlines,
    return_totals.overdue_returns,
    return_totals.unassigned_returns,
    return_totals.total_fees,
    payment_totals.total_payments,
    greatest(return_totals.total_fees - payment_totals.total_payments, 0)::numeric
  from client_totals
  cross join return_totals
  cross join payment_totals;
end;
$$;

revoke all on function public.get_dashboard_summary() from public;
revoke all on function public.get_dashboard_summary() from anon;
grant execute on function public.get_dashboard_summary() to authenticated;

create or replace function public.get_dashboard_recent_returns(requested_limit integer default 8)
returns table (
  id uuid,
  client_id uuid,
  client_number bigint,
  client_name text,
  tax_year integer,
  return_type public.return_type,
  tax_form public.tax_form_type,
  status public.return_status,
  assigned_preparer_name text,
  due_date date,
  net_fee numeric,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare safe_limit integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;

  safe_limit := least(greatest(coalesce(requested_limit, 8), 1), 25);

  return query
  select
    tax_return.id,
    tax_return.client_id,
    client.client_number,
    concat_ws(' ', client.first_name, client.last_name),
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    tax_return.status,
    coalesce(
      nullif(preparer.display_name, ''),
      nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
      preparer.email
    ),
    tax_return.due_date,
    (tax_return.preparation_fee - tax_return.discount_amount)::numeric,
    tax_return.updated_at
  from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  order by tax_return.updated_at desc
  limit safe_limit;
end;
$$;

revoke all on function public.get_dashboard_recent_returns(integer) from public;
revoke all on function public.get_dashboard_recent_returns(integer) from anon;
grant execute on function public.get_dashboard_recent_returns(integer) to authenticated;

create or replace function public.get_dashboard_attention_items(requested_limit integer default 8)
returns table (
  id uuid,
  client_id uuid,
  client_number bigint,
  client_name text,
  tax_year integer,
  return_type public.return_type,
  tax_form public.tax_form_type,
  status public.return_status,
  assigned_preparer_name text,
  due_date date,
  net_fee numeric,
  updated_at timestamptz,
  reason text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare safe_limit integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;

  safe_limit := least(greatest(coalesce(requested_limit, 8), 1), 25);

  return query
  with attention as (
    select
      tax_return.id,
      tax_return.client_id,
      client.client_number,
      concat_ws(' ', client.first_name, client.last_name) as client_name,
      tax_return.tax_year,
      tax_return.return_type,
      tax_return.tax_form,
      tax_return.status,
      coalesce(
        nullif(preparer.display_name, ''),
        nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
        preparer.email
      ) as assigned_preparer_name,
      tax_return.due_date,
      (tax_return.preparation_fee - tax_return.discount_amount)::numeric as net_fee,
      tax_return.updated_at,
      case
        when tax_return.due_date < current_date then 'overdue'
        when tax_return.due_date between current_date and current_date + 7 then 'due_soon'
        when tax_return.assigned_preparer_id is null then 'unassigned'
        else 'documents_pending'
      end as reason,
      case
        when tax_return.due_date < current_date then 1
        when tax_return.due_date between current_date and current_date + 7 then 2
        when tax_return.assigned_preparer_id is null then 3
        else 4
      end as priority
    from public.tax_returns as tax_return
    join public.clients as client on client.id = tax_return.client_id
    left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
    where tax_return.status not in ('completed', 'accepted')
      and (
        tax_return.due_date < current_date
        or tax_return.due_date between current_date and current_date + 7
        or tax_return.assigned_preparer_id is null
        or tax_return.status = 'documents_pending'
      )
  )
  select
    attention.id,
    attention.client_id,
    attention.client_number,
    attention.client_name,
    attention.tax_year,
    attention.return_type,
    attention.tax_form,
    attention.status,
    attention.assigned_preparer_name,
    attention.due_date,
    attention.net_fee,
    attention.updated_at,
    attention.reason
  from attention
  order by attention.priority, attention.due_date nulls last, attention.updated_at desc
  limit safe_limit;
end;
$$;

revoke all on function public.get_dashboard_attention_items(integer) from public;
revoke all on function public.get_dashboard_attention_items(integer) from anon;
grant execute on function public.get_dashboard_attention_items(integer) to authenticated;
