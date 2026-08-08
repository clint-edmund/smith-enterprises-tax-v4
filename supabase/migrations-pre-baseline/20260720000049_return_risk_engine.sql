-- ============================================================================
-- Phase 10.4.3.2
-- Predictive Return Risk Scoring and Priority Queue
-- ============================================================================

begin;

create or replace function public.get_dashboard_priority_queue(
  requested_limit integer default 25
)
returns table (
  id uuid,
  return_id uuid,
  client_id uuid,
  client_name text,
  tax_year integer,
  return_type text,
  status text,
  risk_score integer,
  risk_level text,
  readiness_score integer,
  due_date date,
  days_until_due integer,
  days_since_activity integer,
  assigned_preparer_name text,
  assigned_reviewer_name text,
  outstanding_balance numeric,
  recommended_action text,
  action_route text,
  risk_factors jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
    and not public.current_user_is_active()
  then
    raise exception
      'Your account is not authorized to view the dashboard priority queue.';
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

  payment_summary as (
    select
      payment.tax_return_id,

      coalesce(
        sum(payment.amount)
          filter (
            where payment.is_voided = false
          ),
        0
      )::numeric as total_payments

    from public.payments as payment

    where payment.tax_return_id is not null

    group by payment.tax_return_id
  ),

  activity_summary as (
    select
      activity.return_id as tax_return_id,
      max(activity.occurred_at) as last_activity_at

    from public.tax_return_activity as activity

    group by activity.return_id
  ),

  return_base as (
    select
      tax_return.id,
      tax_return.id as return_id,
      client.id as client_id,

      concat(
        client.last_name,
        ', ',
        client.first_name
      )::text as client_name,

      tax_return.tax_year,
      tax_return.return_type::text as return_type,
      tax_return.workflow_status::text as status,
      tax_return.workflow_status,

      tax_return.date_received,
      tax_return.due_date,

      tax_return.assigned_preparer_id,
      tax_return.assigned_reviewer_id,

      coalesce(
        nullif(preparer.display_name, ''),
        concat_ws(
          ' ',
          preparer.first_name,
          preparer.last_name
        ),
        preparer.email
      )::text as assigned_preparer_name,

      coalesce(
        nullif(reviewer.display_name, ''),
        concat_ws(
          ' ',
          reviewer.first_name,
          reviewer.last_name
        ),
        reviewer.email
      )::text as assigned_reviewer_name,

      tax_return.preparation_fee,

      tax_return.discount_amount,

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

      coalesce(
        payment_summary.total_payments,
        0
      ) as total_payments,

      greatest(
        coalesce(tax_return.preparation_fee, 0)
        - coalesce(tax_return.discount_amount, 0)
        - coalesce(payment_summary.total_payments, 0),
        0
      )::numeric as outstanding_balance,

      case
        when tax_return.due_date is null
          then null

        else
          (
            tax_return.due_date
            - current_date
          )::integer
      end as days_until_due,

      (
        current_date
        - greatest(
            tax_return.updated_at,
            coalesce(
              activity_summary.last_activity_at,
              tax_return.updated_at
            )
          )::date
      )::integer as days_since_activity

    from public.tax_returns as tax_return

    inner join public.clients as client
      on client.id = tax_return.client_id

    left join public.profiles as preparer
      on preparer.id =
        tax_return.assigned_preparer_id

    left join public.profiles as reviewer
      on reviewer.id =
        tax_return.assigned_reviewer_id

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id

    left join payment_summary
      on payment_summary.tax_return_id =
        tax_return.id

    left join activity_summary
      on activity_summary.tax_return_id =
        tax_return.id

    where tax_return.workflow_status not in (
      'filed',
      'completed'
    )
  ),

  readiness_base as (
    select
      return_base.*,

      case
        when return_base.date_received is not null
          then 1
        else 0
      end as intake_check,

      case
        when return_base.required_document_count > 0
          and return_base.incomplete_required_document_count = 0
          then 1
        else 0
      end as document_check,

      case
        when return_base.assigned_preparer_id is not null
          then 1
        else 0
      end as preparer_check,

      case
        when return_base.workflow_status not in (
          'review',
          'signature_pending',
          'ready_to_file',
          'filed',
          'completed'
        )
          then 1

        when return_base.assigned_reviewer_id is not null
          then 1

        else 0
      end as reviewer_check,

      case
        when return_base.federal_return_required = true
          or return_base.state_return_required = true
          or return_base.local_return_required = true
          then 1
        else 0
      end as filing_check,

      case
        when return_base.preparation_fee is not null
          then 1
        else 0
      end as financial_check,

      case
        when return_base.workflow_status <> 'on_hold'
          then 1
        else 0
      end as workflow_check

    from return_base
  ),

  scored_returns as (
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

      least(
        100,

        (
          case
            when readiness_base.days_until_due < 0
              then 40

            when readiness_base.days_until_due between 0 and 3
              then 30

            when readiness_base.days_until_due between 4 and 7
              then 20

            else 0
          end

          +

          case
            when readiness_base.workflow_status = 'on_hold'
              then 25
            else 0
          end

          +

          case
            when readiness_base.required_document_count = 0
              or readiness_base.incomplete_required_document_count > 0
              then 15
            else 0
          end

          +

          case
            when readiness_base.assigned_preparer_id is null
              then 20
            else 0
          end

          +

          case
            when readiness_base.workflow_status in (
              'review',
              'signature_pending',
              'ready_to_file'
            )
              and readiness_base.assigned_reviewer_id is null
              then 10
            else 0
          end

          +

          case
            when readiness_base.days_since_activity > 14
              then 15

            when readiness_base.days_since_activity > 7
              then 8

            else 0
          end

          +

          case
            when readiness_base.outstanding_balance > 0
              then 5
            else 0
          end
        )
      )::integer as calculated_risk_score

    from readiness_base
  ),

  prioritized_returns as (
    select
      scored_returns.*,

      case
        when scored_returns.calculated_risk_score >= 60
          then 'critical'

        when scored_returns.calculated_risk_score >= 35
          then 'high'

        when scored_returns.calculated_risk_score >= 15
          then 'medium'

        else 'low'
      end::text as calculated_risk_level,

      case
        when scored_returns.workflow_status = 'on_hold'
          then 'Resolve return blocker'

        when scored_returns.days_until_due < 0
          then 'Complete overdue return immediately'

        when scored_returns.assigned_preparer_id is null
          then 'Assign preparer'

        when scored_returns.required_document_count = 0
          or scored_returns.incomplete_required_document_count > 0
          then 'Collect required documents'

        when scored_returns.days_until_due between 0 and 3
          then 'Prioritize before deadline'

        when scored_returns.workflow_status in (
          'review',
          'signature_pending',
          'ready_to_file'
        )
          and scored_returns.assigned_reviewer_id is null
          then 'Assign reviewer'

        when scored_returns.days_since_activity > 14
          then 'Follow up on inactive return'

        when scored_returns.outstanding_balance > 0
          then 'Review outstanding balance'

        else 'Continue processing'
      end::text as calculated_recommended_action

    from scored_returns
  )

  select
    prioritized_returns.id,
    prioritized_returns.return_id,
    prioritized_returns.client_id,
    prioritized_returns.client_name,
    prioritized_returns.tax_year,
    prioritized_returns.return_type,
    prioritized_returns.status,
    prioritized_returns.calculated_risk_score
      as risk_score,
    prioritized_returns.calculated_risk_level
      as risk_level,
    prioritized_returns.readiness_score,
    prioritized_returns.due_date,
    prioritized_returns.days_until_due,
    prioritized_returns.days_since_activity,
    prioritized_returns.assigned_preparer_name,
    prioritized_returns.assigned_reviewer_name,
    prioritized_returns.outstanding_balance,
    prioritized_returns.calculated_recommended_action
      as recommended_action,

    (
      '/returns/'
      || prioritized_returns.return_id::text
    )::text as action_route,

    (
      select coalesce(
        jsonb_agg(risk_factor.factor),
        '[]'::jsonb
      )

      from (
        values
          (
            case
              when prioritized_returns.days_until_due < 0
                then jsonb_build_object(
                  'type',
                  'overdue',
                  'label',
                  'Return overdue',
                  'description',
                  abs(
                    prioritized_returns.days_until_due
                  ) || ' day(s) overdue',
                  'points',
                  40
                )
            end
          ),

          (
            case
              when prioritized_returns.days_until_due
                between 0 and 7
                then jsonb_build_object(
                  'type',
                  'due_soon',
                  'label',
                  'Deadline approaching',
                  'description',
                  prioritized_returns.days_until_due
                    || ' day(s) remaining',
                  'points',
                  case
                    when prioritized_returns.days_until_due <= 3
                      then 30
                    else 20
                  end
                )
            end
          ),

          (
            case
              when prioritized_returns.required_document_count = 0
                or prioritized_returns.incomplete_required_document_count > 0
                then jsonb_build_object(
                  'type',
                  'missing_documents',
                  'label',
                  'Documents incomplete',
                  'description',
                  'Required tax documents must be reviewed or completed',
                  'points',
                  15
                )
            end
          ),

          (
            case
              when prioritized_returns.assigned_preparer_id is null
                then jsonb_build_object(
                  'type',
                  'missing_preparer',
                  'label',
                  'Preparer not assigned',
                  'description',
                  'This return needs an assigned preparer',
                  'points',
                  20
                )
            end
          ),

          (
            case
              when prioritized_returns.workflow_status in (
                'review',
                'signature_pending',
                'ready_to_file'
              )
                and prioritized_returns.assigned_reviewer_id is null
                then jsonb_build_object(
                  'type',
                  'missing_reviewer',
                  'label',
                  'Reviewer not assigned',
                  'description',
                  'This return needs an assigned reviewer',
                  'points',
                  10
                )
            end
          ),

          (
            case
              when prioritized_returns.workflow_status = 'on_hold'
                then jsonb_build_object(
                  'type',
                  'blocked',
                  'label',
                  'Return blocked',
                  'description',
                  'The return is currently on hold',
                  'points',
                  25
                )
            end
          ),

          (
            case
              when prioritized_returns.days_since_activity > 7
                then jsonb_build_object(
                  'type',
                  'inactive',
                  'label',
                  'Return inactive',
                  'description',
                  prioritized_returns.days_since_activity
                    || ' day(s) since the latest activity',
                  'points',
                  case
                    when prioritized_returns.days_since_activity > 14
                      then 15
                    else 8
                  end
                )
            end
          ),

          (
            case
              when prioritized_returns.outstanding_balance > 0
                then jsonb_build_object(
                  'type',
                  'unpaid_balance',
                  'label',
                  'Outstanding balance',
                  'description',
                  'A balance remains on this return',
                  'points',
                  5
                )
            end
          )
      ) as risk_factor(factor)

      where risk_factor.factor is not null
    ) as risk_factors

  from prioritized_returns

  order by
    prioritized_returns.calculated_risk_score desc,
    prioritized_returns.due_date asc nulls last,
    prioritized_returns.days_since_activity desc

  limit greatest(
    least(
      coalesce(requested_limit, 25),
      100
    ),
    1
  );
end;
$$;

revoke all
on function public.get_dashboard_priority_queue(integer)
from public;

grant execute
on function public.get_dashboard_priority_queue(integer)
to authenticated;

commit;