-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 6 dashboard summary and recent activity
-- ============================================================
-- ------------------------------------------------------------
-- Dashboard summary
-- ------------------------------------------------------------
create or replace function public.get_dashboard_summary() returns table (
    active_clients bigint,
    open_returns bigint,
    completed_returns bigint,
    total_fees numeric,
    total_payments numeric,
    outstanding_balance numeric,
    documents_pending bigint
  ) language plpgsql stable security definer
set search_path = '' as $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query with client_totals as (
  select count(*) filter (
      where client.status = 'active'
    )::bigint as active_clients
  from public.clients as client
),
return_totals as (
  select count(*) filter (
      where tax_return.status not in (
          'completed',
          'accepted'
        )
    )::bigint as open_returns,
    count(*) filter (
      where tax_return.status in (
          'completed',
          'accepted'
        )
    )::bigint as completed_returns,
    coalesce(
      sum(
        tax_return.preparation_fee - tax_return.discount_amount
      ),
      0
    )::numeric as total_fees,
    count(*) filter (
      where tax_return.status = 'documents_pending'
    )::bigint as documents_pending
  from public.tax_returns as tax_return
),
payment_totals as (
  select coalesce(
      sum(payment.amount) filter (
        where payment.is_voided = false
      ),
      0
    )::numeric as total_payments
  from public.payments as payment
)
select client_totals.active_clients,
  return_totals.open_returns,
  return_totals.completed_returns,
  return_totals.total_fees,
  payment_totals.total_payments,
  greatest(
    return_totals.total_fees - payment_totals.total_payments,
    0
  )::numeric as outstanding_balance,
  return_totals.documents_pending
from client_totals
  cross join return_totals
  cross join payment_totals;
end;
$$;
revoke all on function public.get_dashboard_summary()
from public;
revoke all on function public.get_dashboard_summary()
from anon;
grant execute on function public.get_dashboard_summary() to authenticated;
-- ------------------------------------------------------------
-- Sanitized recent activity
--
-- This function returns only the limited fields needed by the
-- dashboard. It does not expose old_values, new_values, browser
-- metadata, user-agent information, or other audit details.
-- ------------------------------------------------------------
create or replace function public.get_recent_dashboard_activity(requested_limit integer default 8) returns table (
    id bigint,
    action text,
    entity_type text,
    entity_id uuid,
    actor_name text,
    occurred_at timestamptz
  ) language plpgsql stable security definer
set search_path = '' as $$
declare safe_limit integer;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
safe_limit := least(
  greatest(
    coalesce(requested_limit, 8),
    1
  ),
  25
);
return query
select audit.id,
  audit.action,
  audit.entity_type,
  audit.entity_id,
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
    profile.email,
    'System'
  ) as actor_name,
  audit.created_at as occurred_at
from public.audit_logs as audit
  left join public.profiles as profile on profile.id = audit.actor_id
order by audit.created_at desc
limit safe_limit;
end;
$$;
revoke all on function public.get_recent_dashboard_activity(integer)
from public;
revoke all on function public.get_recent_dashboard_activity(integer)
from anon;
grant execute on function public.get_recent_dashboard_activity(integer) to authenticated;
comment on function public.get_dashboard_summary() is 'Returns authorized dashboard totals for active staff users.';
comment on function public.get_recent_dashboard_activity(integer) is 'Returns sanitized recent audit activity for the application dashboard.';