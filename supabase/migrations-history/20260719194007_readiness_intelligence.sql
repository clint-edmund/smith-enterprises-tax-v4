-- ============================================================================
-- Phase 10.4.1
-- Return Readiness Intelligence
--
-- Adds:
--   public.get_dashboard_readiness_metrics()
--
-- Purpose:
--   Provides one dashboard-ready result containing:
--   - Active return count
--   - Ready-for-preparation count
--   - Returns needing documents
--   - Returns missing a preparer
--   - Returns ready for review
--   - Blocked returns
--   - Average readiness score
--   - Office health score
-- ============================================================================

begin;

create or replace function public.get_dashboard_readiness_metrics()
returns table (
  active_returns bigint,
  readiness_eligible_returns bigint,
  ready_for_preparation bigint,
  needs_documents bigint,
  missing_preparer bigint,
  ready_for_review bigint,
  blocked_returns bigint,
  overdue_returns bigint,
  average_readiness_score integer,
  office_health_score integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_active() then
    raise exception
      'Your account is not authorized to view dashboard readiness metrics.';
  end if;

  return query
  with document_summary as (
    select
      tax_return.id as tax_return_id,

      count(required_document.id)
        filter (
          where required_document.is_required = true
        )::integer as required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = true
        )::integer as completed_required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = false
        )::integer as incomplete_required_document_count

    from public.tax_returns as tax_return

    left join public.return_required_documents
      as required_document
      on required_document.tax_return_id =
        tax_return.id

    group by tax_return.id
  ),

  readiness_base as (
    select
      tax_return.id,

      tax_return.workflow_status,

      tax_return.assigned_preparer_id,

      tax_return.assigned_reviewer_id,

      tax_return.date_received,

      tax_return.due_date,

      tax_return.preparation_fee,

      tax_return.federal_return_required,

      tax_return.state_return_required,

      tax_return.local_return_required,

      coalesce(
        document_summary.required_document_count,
        0
      ) as required_document_count,

      coalesce(
        document_summary.completed_required_document_count,
        0
      ) as completed_required_document_count,

      coalesce(
        document_summary.incomplete_required_document_count,
        0
      ) as incomplete_required_document_count,

      tax_return.workflow_status not in (
        'completed',
        'filed'
      ) as is_active,

      tax_return.workflow_status in (
        'intake',
        'documents_pending',
        'ready_for_preparation'
      ) as is_readiness_eligible,

      (
        tax_return.due_date is not null
        and tax_return.due_date < current_date
        and tax_return.workflow_status not in (
          'completed',
          'filed'
        )
      ) as is_overdue,

      case
        when tax_return.date_received is not null
          then 1
        else 0
      end as intake_check,

      case
        when
          coalesce(
            document_summary.required_document_count,
            0
          ) > 0
          and coalesce(
            document_summary.incomplete_required_document_count,
            0
          ) = 0
          then 1
        else 0
      end as document_check,

      case
        when tax_return.assigned_preparer_id is not null
          then 1
        else 0
      end as preparer_check,

      case
        when tax_return.workflow_status not in (
          'review',
          'signature_pending',
          'ready_to_file',
          'filed',
          'completed'
        )
          then 1

        when tax_return.assigned_reviewer_id is not null
          then 1

        else 0
      end as reviewer_check,

      case
        when
          tax_return.federal_return_required = true
          or tax_return.state_return_required = true
          or tax_return.local_return_required = true
          then 1
        else 0
      end as filing_check,

      case
        when tax_return.preparation_fee is not null
          then 1
        else 0
      end as financial_check,

      case
        when tax_return.workflow_status <> 'on_hold'
          then 1
        else 0
      end as workflow_check

    from public.tax_returns as tax_return

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id
  ),

  readiness_scored as (
    select
      readiness_base.*,

      round(
        (
          (
            readiness_base.intake_check
            + readiness_base.document_check
            + readiness_base.preparer_check
            + readiness_base.reviewer_check
            + readiness_base.filing_check
            + readiness_base.financial_check
            + readiness_base.workflow_check
          )::numeric
          / 7::numeric
        ) * 100
      )::integer as readiness_score,

      (
        readiness_base.date_received is not null

        and readiness_base.required_document_count > 0

        and readiness_base.incomplete_required_document_count = 0

        and readiness_base.assigned_preparer_id is not null

        and (
          readiness_base.federal_return_required = true
          or readiness_base.state_return_required = true
          or readiness_base.local_return_required = true
        )

        and readiness_base.preparation_fee is not null

        and readiness_base.workflow_status <> 'on_hold'
      ) as is_ready_for_preparation

    from readiness_base
  ),

  metric_totals as (
    select
      count(*)
        filter (
          where readiness_scored.is_active = true
        )::bigint as active_returns,

      count(*)
        filter (
          where readiness_scored.is_active = true
            and readiness_scored.is_readiness_eligible = true
        )::bigint as readiness_eligible_returns,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and readiness_scored.is_readiness_eligible = true

            and readiness_scored.is_ready_for_preparation = true
        )::bigint as ready_for_preparation,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and (
              readiness_scored.required_document_count = 0

              or readiness_scored.incomplete_required_document_count > 0
            )
        )::bigint as needs_documents,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and readiness_scored.assigned_preparer_id is null
        )::bigint as missing_preparer,

      count(*)
        filter (
          where readiness_scored.workflow_status = 'review'
        )::bigint as ready_for_review,

      count(*)
        filter (
          where readiness_scored.workflow_status = 'on_hold'
        )::bigint as blocked_returns,

      count(*)
        filter (
          where readiness_scored.is_overdue = true
        )::bigint as overdue_returns,

      coalesce(
        round(
          avg(readiness_scored.readiness_score)
            filter (
              where readiness_scored.is_active = true
            )
        ),
        100
      )::integer as average_readiness_score

    from readiness_scored
  )

  select
    metric_totals.active_returns,

    metric_totals.readiness_eligible_returns,

    metric_totals.ready_for_preparation,

    metric_totals.needs_documents,

    metric_totals.missing_preparer,

    metric_totals.ready_for_review,

    metric_totals.blocked_returns,

    metric_totals.overdue_returns,

    metric_totals.average_readiness_score,

    case
      when metric_totals.active_returns = 0 then 100

      else greatest(
        0,
        least(
          100,
          round(
            (
              metric_totals.average_readiness_score * 0.70
            )
            +
            (
              (
                1
                -
                (
                  metric_totals.blocked_returns::numeric
                  /
                  metric_totals.active_returns::numeric
                )
              ) * 15
            )
            +
            (
              (
                1
                -
                (
                  metric_totals.overdue_returns::numeric
                  /
                  metric_totals.active_returns::numeric
                )
              ) * 15
            )
          )::integer
        )
      )
    end as office_health_score

  from metric_totals;
end;
$$;

revoke all
on function public.get_dashboard_readiness_metrics()
from public;

grant execute
on function public.get_dashboard_readiness_metrics()
to authenticated;

commit;