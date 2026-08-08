-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 9.6.1.3
-- Extend dashboard summary with workflow operations metrics
-- ============================================================

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
  outstanding_balance numeric,

  workflow_intake bigint,
  workflow_documents_pending bigint,
  workflow_ready_for_preparation bigint,
  workflow_in_preparation bigint,
  workflow_review bigint,
  workflow_signature_pending bigint,
  workflow_ready_to_file bigint,
  workflow_filed bigint,
  workflow_completed bigint,
  workflow_on_hold bigint
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
    select
      count(*) filter (
        where client.status = 'active'
      )::bigint as active_clients
    from public.clients as client
  ),

  return_totals as (
    select
      count(*)::bigint as total_returns,

      count(*) filter (
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

      count(*) filter (
        where tax_return.status = 'in_progress'
      )::bigint as in_progress_returns,

      count(*) filter (
        where tax_return.status in (
          'ready_for_review',
          'under_review'
        )
      )::bigint as awaiting_review_returns,

      count(*) filter (
        where tax_return.status = 'documents_pending'
      )::bigint as documents_pending,

      count(*) filter (
        where tax_return.due_date >= current_date
          and tax_return.due_date <= current_date + 7
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as upcoming_deadlines,

      count(*) filter (
        where tax_return.due_date < current_date
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as overdue_returns,

      count(*) filter (
        where tax_return.assigned_preparer_id is null
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as unassigned_returns,

      coalesce(
        sum(
          tax_return.preparation_fee -
          tax_return.discount_amount
        ),
        0
      )::numeric as total_fees,

      count(*) filter (
        where coalesce(
          tax_return.workflow_status,
          'intake'
        ) = 'intake'
      )::bigint as workflow_intake,

      count(*) filter (
        where tax_return.workflow_status =
          'documents_pending'
      )::bigint as workflow_documents_pending,

      count(*) filter (
        where tax_return.workflow_status =
          'ready_for_preparation'
      )::bigint as workflow_ready_for_preparation,

      count(*) filter (
        where tax_return.workflow_status =
          'in_preparation'
      )::bigint as workflow_in_preparation,

      count(*) filter (
        where tax_return.workflow_status =
          'review'
      )::bigint as workflow_review,

      count(*) filter (
        where tax_return.workflow_status =
          'signature_pending'
      )::bigint as workflow_signature_pending,

      count(*) filter (
        where tax_return.workflow_status =
          'ready_to_file'
      )::bigint as workflow_ready_to_file,

      count(*) filter (
        where tax_return.workflow_status =
          'filed'
      )::bigint as workflow_filed,

      count(*) filter (
        where tax_return.workflow_status =
          'completed'
      )::bigint as workflow_completed,

      count(*) filter (
        where tax_return.workflow_status =
          'on_hold'
      )::bigint as workflow_on_hold

    from public.tax_returns as tax_return
  ),

  payment_totals as (
    select
      coalesce(
        sum(payment.amount) filter (
          where payment.is_voided = false
        ),
        0
      )::numeric as total_payments
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

    greatest(
      return_totals.total_fees -
      payment_totals.total_payments,
      0
    )::numeric as outstanding_balance,

    return_totals.workflow_intake,
    return_totals.workflow_documents_pending,
    return_totals.workflow_ready_for_preparation,
    return_totals.workflow_in_preparation,
    return_totals.workflow_review,
    return_totals.workflow_signature_pending,
    return_totals.workflow_ready_to_file,
    return_totals.workflow_filed,
    return_totals.workflow_completed,
    return_totals.workflow_on_hold

  from client_totals
  cross join return_totals
  cross join payment_totals;
end;
$$;

revoke all
on function public.get_dashboard_summary()
from public;

revoke all
on function public.get_dashboard_summary()
from anon;

grant execute
on function public.get_dashboard_summary()
to authenticated;

comment on function public.get_dashboard_summary()
is 'Returns dashboard totals and workflow-stage counts for active authenticated staff.';