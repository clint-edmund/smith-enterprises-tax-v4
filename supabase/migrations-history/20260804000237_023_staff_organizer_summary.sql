-- ==========================================================
-- Smith Enterprises Tax Management
-- Staff Organizer Review Summary
--
-- Purpose:
--   Returns the live staff-facing organizer review overview for
--   one client and tax year.
--
-- Security:
--   - Requires an authenticated user.
--   - Requires an active staff account.
--   - Uses SECURITY DEFINER with an empty search path.
--   - Exposes summary information only; sensitive Secure Vault
--     values are not returned by this function.
-- ==========================================================

begin;

create or replace function
public.get_staff_organizer_summary(
  requested_client_id uuid,
  requested_tax_year integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  organizer_record
    public.client_tax_organizers%rowtype;

  client_record
    public.clients%rowtype;

  section_payload jsonb;
  overview_payload jsonb;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception
      'A valid tax year is required.';
  end if;

  select
    client.*
  into
    client_record
  from public.clients
    as client
  where client.id =
    requested_client_id
  limit 1;

  if not found then
    raise exception
      'The requested client was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
      requested_client_id
    and organizer.tax_year =
      requested_tax_year
  order by organizer.updated_at desc
  limit 1;

  if not found then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  with
  dependent_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*)::integer
        as completed_record_count,

      count(*) filter (
        where dependent.claimed_by_another_taxpayer
          or (
            not dependent.lived_with_taxpayer_all_year
            and dependent.months_lived_with_taxpayer < 12
          )
          or (
            dependent.is_full_time_student
            and extract(
              year
              from age(
                make_date(
                  requested_tax_year,
                  12,
                  31
                ),
                dependent.birth_date
              )
            ) >= 19
          )
      )::integer
        as issue_count,

      max(
        dependent.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_dependents
      as dependent

    where dependent.organizer_id =
      organizer_record.id
  ),

  income_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*) filter (
        where income.record_status =
          'complete'
      )::integer
        as completed_record_count,

      count(*) filter (
        where not income.document_received
      )::integer
        as missing_document_count,

      (
        count(*) filter (
          where income.record_status <>
            'complete'
        )
        +
        count(*) filter (
          where not income.document_received
        )
      )::integer
        as issue_count,

      count(*) filter (
        where income.record_status =
            'needs_review'
          or not income.document_received
      )::integer
        as blocking_issue_count,

      max(
        income.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_income_sources
      as income

    where income.organizer_id =
      organizer_record.id
  ),

  healthcare_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*) filter (
        where coverage.record_status =
          'complete'
      )::integer
        as completed_record_count,

      count(*) filter (
        where not coverage.document_received
      )::integer
        as missing_document_count,

      (
        count(*) filter (
          where coverage.record_status <>
            'complete'
        )
        +
        count(*) filter (
          where not coverage.document_received
        )
      )::integer
        as issue_count,

      count(*) filter (
        where coverage.record_status =
            'needs_review'
          or (
            coverage.coverage_type =
              'marketplace'
            and not coverage.document_received
          )
      )::integer
        as blocking_issue_count,

      max(
        coverage.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_healthcare_coverages
      as coverage

    where coverage.organizer_id =
      organizer_record.id
  ),

  section_rows as (
    select
      'dependents'::text
        as section_key,

      'Dependents'::text
        as section_title,

      coalesce(
        organizer_section.status::text,
        case
          when dependent_metrics.record_count = 0
          then 'not_started'
          when dependent_metrics.issue_count > 0
          then 'in_progress'
          else 'completed'
        end
      )
        as section_status,

      case
        when dependent_metrics.record_count = 0
        then 'not_started'
        when dependent_metrics.issue_count > 0
        then 'in_progress'
        else 'complete'
      end
        as health_level,

      coalesce(
        organizer_section.progress_percentage,
        case
          when dependent_metrics.record_count = 0
          then 0
          else 100
        end
      )::integer
        as progress_percentage,

      dependent_metrics.record_count,
      dependent_metrics.completed_record_count,

      0::integer
        as missing_document_count,

      dependent_metrics.issue_count,

      0::integer
        as blocking_issue_count,

      coalesce(
        dependent_metrics.last_updated_at,
        organizer_section.updated_at
      )
        as last_updated_at,

      (
        dependent_metrics.record_count > 0
      )
        as is_ready_for_review,

      case
        when dependent_metrics.issue_count > 0
        then jsonb_build_array(
          jsonb_build_object(
            'issueId',
              'staff-dependents-review',
            'sectionKey',
              'dependents',
            'severity',
              'warning',
            'title',
              'Dependent information requires review',
            'description',
              dependent_metrics.issue_count::text
              || case
                  when dependent_metrics.issue_count = 1
                  then ' dependent item requires staff review.'
                  else ' dependent items require staff review.'
                end,
            'recordId',
              null,
            'fieldKey',
              null,
            'actionLabel',
              'Review Dependents',
            'actionPath',
              null
          )
        )
        else '[]'::jsonb
      end
        as issues

    from dependent_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'dependents'

    union all

    select
      'income'::text,
      'Income'::text,

      coalesce(
        organizer_section.status::text,
        case
          when income_metrics.record_count = 0
          then 'not_started'
          when income_metrics.blocking_issue_count > 0
          then 'needs_review'
          when income_metrics.completed_record_count =
            income_metrics.record_count
          then 'completed'
          else 'in_progress'
        end
      ),

      case
        when income_metrics.record_count = 0
        then 'not_started'
        when income_metrics.blocking_issue_count > 0
        then 'needs_attention'
        when income_metrics.completed_record_count =
          income_metrics.record_count
        then 'complete'
        else 'in_progress'
      end,

      coalesce(
        organizer_section.progress_percentage,
        case
          when income_metrics.record_count = 0
          then 0
          else round(
            (
              income_metrics.completed_record_count::numeric
              /
              income_metrics.record_count::numeric
            ) * 100
          )::integer
        end
      )::integer,

      income_metrics.record_count,
      income_metrics.completed_record_count,
      income_metrics.missing_document_count,
      income_metrics.issue_count,
      income_metrics.blocking_issue_count,

      coalesce(
        income_metrics.last_updated_at,
        organizer_section.updated_at
      ),

      (
        income_metrics.record_count > 0
        and income_metrics.completed_record_count =
          income_metrics.record_count
        and income_metrics.blocking_issue_count = 0
      ),

      (
        case
          when income_metrics.missing_document_count > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-income-missing-documents',
              'sectionKey',
                'income',
              'severity',
                'blocking',
              'title',
                'Income documents are missing',
              'description',
                income_metrics.missing_document_count::text
                || case
                    when income_metrics.missing_document_count = 1
                    then ' income record is missing its supporting document.'
                    else ' income records are missing supporting documents.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'document_received',
              'actionLabel',
                'Review Income',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
        ||
        case
          when (
            income_metrics.record_count
            -
            income_metrics.completed_record_count
          ) > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-income-incomplete-records',
              'sectionKey',
                'income',
              'severity',
                'warning',
              'title',
                'Income records are incomplete',
              'description',
                (
                  income_metrics.record_count
                  -
                  income_metrics.completed_record_count
                )::text
                || case
                    when (
                      income_metrics.record_count
                      -
                      income_metrics.completed_record_count
                    ) = 1
                    then ' income record requires completion or review.'
                    else ' income records require completion or review.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'record_status',
              'actionLabel',
                'Review Income',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
      )

    from income_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'income'

    union all

    select
      'healthcare'::text,
      'Healthcare'::text,

      coalesce(
        organizer_section.status::text,
        case
          when healthcare_metrics.record_count = 0
          then 'not_started'
          when healthcare_metrics.blocking_issue_count > 0
          then 'needs_review'
          when healthcare_metrics.completed_record_count =
            healthcare_metrics.record_count
          then 'completed'
          else 'in_progress'
        end
      ),

      case
        when healthcare_metrics.record_count = 0
        then 'not_started'
        when healthcare_metrics.blocking_issue_count > 0
        then 'needs_attention'
        when healthcare_metrics.completed_record_count =
          healthcare_metrics.record_count
        then 'complete'
        else 'in_progress'
      end,

      coalesce(
        organizer_section.progress_percentage,
        case
          when healthcare_metrics.record_count = 0
          then 0
          else round(
            (
              healthcare_metrics.completed_record_count::numeric
              /
              healthcare_metrics.record_count::numeric
            ) * 100
          )::integer
        end
      )::integer,

      healthcare_metrics.record_count,
      healthcare_metrics.completed_record_count,
      healthcare_metrics.missing_document_count,
      healthcare_metrics.issue_count,
      healthcare_metrics.blocking_issue_count,

      coalesce(
        healthcare_metrics.last_updated_at,
        organizer_section.updated_at
      ),

      (
        healthcare_metrics.record_count > 0
        and healthcare_metrics.completed_record_count =
          healthcare_metrics.record_count
        and healthcare_metrics.blocking_issue_count = 0
      ),

      (
        case
          when healthcare_metrics.missing_document_count > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-healthcare-missing-documents',
              'sectionKey',
                'healthcare',
              'severity',
                case
                  when healthcare_metrics.blocking_issue_count > 0
                  then 'blocking'
                  else 'warning'
                end,
              'title',
                'Healthcare documents are missing',
              'description',
                healthcare_metrics.missing_document_count::text
                || case
                    when healthcare_metrics.missing_document_count = 1
                    then ' healthcare record is missing its supporting document.'
                    else ' healthcare records are missing supporting documents.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'document_received',
              'actionLabel',
                'Review Healthcare',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
        ||
        case
          when (
            healthcare_metrics.record_count
            -
            healthcare_metrics.completed_record_count
          ) > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-healthcare-incomplete-records',
              'sectionKey',
                'healthcare',
              'severity',
                'warning',
              'title',
                'Healthcare coverage requires review',
              'description',
                (
                  healthcare_metrics.record_count
                  -
                  healthcare_metrics.completed_record_count
                )::text
                || case
                    when (
                      healthcare_metrics.record_count
                      -
                      healthcare_metrics.completed_record_count
                    ) = 1
                    then ' healthcare record requires completion or review.'
                    else ' healthcare records require completion or review.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'record_status',
              'actionLabel',
                'Review Healthcare',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
      )

    from healthcare_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'healthcare'
  ),

  section_summary as (
    select
      jsonb_agg(
        jsonb_build_object(
          'sectionKey',
            section_key,
          'sectionTitle',
            section_title,
          'sectionStatus',
            section_status,
          'healthLevel',
            health_level,
          'progressPercentage',
            progress_percentage,
          'recordCount',
            record_count,
          'completedRecordCount',
            completed_record_count,
          'missingDocumentCount',
            missing_document_count,
          'issueCount',
            issue_count,
          'blockingIssueCount',
            blocking_issue_count,
          'lastUpdatedAt',
            last_updated_at,
          'isReadyForReview',
            is_ready_for_review,
          'issues',
            issues
        )
        order by
          case section_key
            when 'dependents' then 1
            when 'income' then 2
            when 'healthcare' then 3
            else 99
          end
      )
        as sections,

      count(*)::integer
        as total_section_count,

      count(*) filter (
        where health_level =
          'complete'
      )::integer
        as completed_section_count,

      count(*) filter (
        where health_level =
          'in_progress'
      )::integer
        as in_progress_section_count,

      count(*) filter (
        where health_level =
          'needs_attention'
      )::integer
        as needs_attention_section_count,

      coalesce(
        sum(
          missing_document_count
        ),
        0
      )::integer
        as missing_document_count,

      coalesce(
        sum(
          issue_count
        ),
        0
      )::integer
        as total_issue_count,

      coalesce(
        sum(
          blocking_issue_count
        ),
        0
      )::integer
        as blocking_issue_count,

      max(
        last_updated_at
      )
        as last_updated_at,

      bool_and(
        is_ready_for_review
      )
        as is_ready_for_review

    from section_rows
  )

  select
    section_summary.sections
  into
    section_payload
  from section_summary;

  with
  section_rows as (
    select
      section_element
    from jsonb_array_elements(
      section_payload
    )
      as section_element
  ),

  summary as (
    select
      count(*)::integer
        as total_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'complete'
      )::integer
        as completed_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'in_progress'
      )::integer
        as in_progress_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'needs_attention'
      )::integer
        as needs_attention_section_count,

      coalesce(
        sum(
          (
            section_element ->>
              'missingDocumentCount'
          )::integer
        ),
        0
      )::integer
        as missing_document_count,

      coalesce(
        sum(
          (
            section_element ->>
              'issueCount'
          )::integer
        ),
        0
      )::integer
        as total_issue_count,

      coalesce(
        sum(
          (
            section_element ->>
              'blockingIssueCount'
          )::integer
        ),
        0
      )::integer
        as blocking_issue_count,

      max(
        nullif(
          section_element ->>
            'lastUpdatedAt',
          ''
        )::timestamptz
      )
        as last_updated_at,

      bool_and(
        (
          section_element ->>
            'isReadyForReview'
        )::boolean
      )
        as is_ready_for_review

    from section_rows
  )

  select
    jsonb_build_object(
      'organizerId',
        organizer_record.id,
      'clientId',
        organizer_record.client_id,
      'taxYear',
        organizer_record.tax_year,
      'organizerStatus',
        organizer_record.status::text,
      'currentSection',
        organizer_record.current_section::text,
      'overallProgressPercentage',
        organizer_record.progress_percentage,
      'totalSectionCount',
        summary.total_section_count,
      'completedSectionCount',
        summary.completed_section_count,
      'inProgressSectionCount',
        summary.in_progress_section_count,
      'needsAttentionSectionCount',
        summary.needs_attention_section_count,
      'missingDocumentCount',
        summary.missing_document_count,
      'totalIssueCount',
        summary.total_issue_count,
      'blockingIssueCount',
        summary.blocking_issue_count,
      'isReadyForReview',
        coalesce(
          summary.is_ready_for_review,
          false
        ),
      'lastUpdatedAt',
        greatest(
          organizer_record.updated_at,
          coalesce(
            summary.last_updated_at,
            organizer_record.updated_at
          )
        ),
      'client',
        jsonb_build_object(
          'clientId',
            client_record.id,
          'clientNumber',
            client_record.client_number::text,
          'clientName',
            trim(
              concat_ws(
                ' ',
                client_record.first_name,
                client_record.last_name
              )
            ),
          'email',
            client_record.email,
          'phone',
            client_record.phone
        ),
      'sections',
        section_payload
    )
  into
    overview_payload
  from summary;

  return overview_payload;
end;
$function$;

comment on function
public.get_staff_organizer_summary(
  uuid,
  integer
)
is
'Returns a live staff-facing organizer review summary for one client and tax year. Sensitive Secure Vault values are not included.';

revoke all
on function
public.get_staff_organizer_summary(
  uuid,
  integer
)
from public;

revoke all
on function
public.get_staff_organizer_summary(
  uuid,
  integer
)
from anon;

grant execute
on function
public.get_staff_organizer_summary(
  uuid,
  integer
)
to authenticated;

commit;