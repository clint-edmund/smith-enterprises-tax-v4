-- ============================================================================
-- Phase 10.4.2.2
-- Smart Dashboard Recommendations
--
-- Adds:
--   public.get_dashboard_smart_recommendations()
--
-- Purpose:
--   Evaluates active tax returns and produces specific, prioritized actions
--   for office staff.
-- ============================================================================

begin;

create or replace function public.get_dashboard_smart_recommendations(
  requested_limit integer default 12
)
returns table (
  id text,
  return_id uuid,
  client_id uuid,
  client_name text,
  tax_year integer,
  return_type public.return_type,
  recommendation_type text,
  title text,
  explanation text,
  priority text,
  readiness_score integer,
  due_date date,
  action_route text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_active() then
    raise exception
      'Your account is not authorized to view dashboard recommendations.';
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
      tax_return.id as return_id,

      tax_return.client_id,

      concat_ws(
        ' ',
        client.first_name,
        client.last_name
      ) as client_name,

      tax_return.tax_year,

      tax_return.return_type,

      tax_return.workflow_status,

      tax_return.assigned_preparer_id,

      tax_return.assigned_reviewer_id,

      tax_return.date_received,

      tax_return.due_date,

      tax_return.preparation_fee,

      tax_return.federal_return_required,

      tax_return.state_return_required,

      tax_return.local_return_required,

      tax_return.updated_at,

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

    inner join public.clients as client
      on client.id = tax_return.client_id

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id

    where tax_return.workflow_status not in (
      'filed',
      'completed'
    )
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

  recommendation_candidates as (
    /*
     * Critical: returns that are blocked.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':resolve-blocker'
      ) as id,

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'resolve_blocker'::text
        as recommendation_type,

      'Resolve blocked return'::text
        as title,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is currently on hold and cannot advance.'
      ) as explanation,

      'critical'::text as priority,

      1 as priority_rank,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ) as action_route,

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'on_hold'

    union all

    /*
     * Critical: active returns that are overdue.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':overdue'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'due_date'::text,

      'Address overdue return'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return was due on ',
        to_char(
          readiness_scored.due_date,
          'Mon DD, YYYY'
        ),
        '.'
      ),

      'critical'::text,

      2,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.due_date is not null
      and readiness_scored.due_date < current_date

    union all

    /*
     * High: required-document checklist is missing or incomplete.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':collect-documents'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'collect_documents'::text,

      case
        when
          readiness_scored.required_document_count = 0
          then 'Create required-document checklist'

        when
          readiness_scored.incomplete_required_document_count = 1
          then 'Collect final required document'

        else 'Collect missing required documents'
      end,

      case
        when
          readiness_scored.required_document_count = 0
          then concat(
            readiness_scored.client_name,
            '''s ',
            readiness_scored.tax_year,
            ' return does not have a required-document checklist.'
          )

        when
          readiness_scored.incomplete_required_document_count = 1
          then concat(
            readiness_scored.client_name,
            '''s ',
            readiness_scored.tax_year,
            ' return is missing one required document.'
          )

        else concat(
          readiness_scored.client_name,
          '''s ',
          readiness_scored.tax_year,
          ' return is missing ',
          readiness_scored.incomplete_required_document_count,
          ' required documents.'
        )
      end,

      'high'::text,

      3,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status in (
      'intake',
      'documents_pending',
      'ready_for_preparation'
    )
      and (
        readiness_scored.required_document_count = 0
        or readiness_scored.incomplete_required_document_count > 0
      )

    union all

    /*
     * High: active returns without a preparer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':assign-preparer'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'assign_preparer'::text,

      'Assign a preparer'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return does not have an assigned preparer.'
      ),

      'high'::text,

      4,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.assigned_preparer_id
      is null

    union all

    /*
     * Medium: readiness requirements are complete.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':begin-preparation'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'begin_preparation'::text,

      'Begin return preparation'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return has satisfied its readiness requirements and can move into preparation.'
      ),

      'medium'::text,

      5,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status in (
      'intake',
      'documents_pending',
      'ready_for_preparation'
    )
      and readiness_scored.is_ready_for_preparation =
        true

    union all

    /*
     * Medium: review-stage returns without a reviewer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':assign-reviewer'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'assign_reviewer'::text,

      'Assign a reviewer'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is ready for review but has no assigned reviewer.'
      ),

      'medium'::text,

      6,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'review'
      and readiness_scored.assigned_reviewer_id
        is null

    union all

    /*
     * Low: review-stage returns that already have a reviewer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':review-return'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'review_return'::text,

      'Complete return review'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is assigned and waiting in the review queue.'
      ),

      'low'::text,

      7,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'review'
      and readiness_scored.assigned_reviewer_id
        is not null

    union all

    /*
     * Low: returns due within seven days.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':due-soon'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'due_date'::text,

      'Return due soon'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is due on ',
        to_char(
          readiness_scored.due_date,
          'Mon DD, YYYY'
        ),
        '.'
      ),

      'low'::text,

      8,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.due_date
      between current_date
      and current_date + 7
  )

  select
    recommendation_candidates.id,

    recommendation_candidates.return_id,

    recommendation_candidates.client_id,

    recommendation_candidates.client_name,

    recommendation_candidates.tax_year,

    recommendation_candidates.return_type,

    recommendation_candidates.recommendation_type,

    recommendation_candidates.title,

    recommendation_candidates.explanation,

    recommendation_candidates.priority,

    recommendation_candidates.readiness_score,

    recommendation_candidates.due_date,

    recommendation_candidates.action_route

  from recommendation_candidates

  order by
    recommendation_candidates.priority_rank,
    recommendation_candidates.due_date
      nulls last,
    recommendation_candidates.updated_at,
    recommendation_candidates.client_name

  limit greatest(
    1,
    least(
      coalesce(requested_limit, 12),
      50
    )
  );
end;
$$;

revoke all
on function public.get_dashboard_smart_recommendations(integer)
from public;

grant execute
on function public.get_dashboard_smart_recommendations(integer)
to authenticated;

commit;