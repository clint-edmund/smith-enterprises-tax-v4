-- ==========================================================
-- Smith Enterprises Tax Management
-- Sprint 12.7.3B.2
-- Client Organizer Workspace Summary
-- ==========================================================

begin;

drop function if exists
public.get_staff_client_organizer_workspace(
  uuid
);

create function
public.get_staff_client_organizer_workspace(
  requested_client_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;

  selected_organizer
    public.client_tax_organizers;

  assigned_preparer_id uuid;
  assigned_preparer_name text;

  income_source_count integer := 0;
  income_reviewed_count integer := 0;
  income_follow_up_count integer := 0;
  income_returned_count integer := 0;
  income_pending_count integer := 0;

  income_review_status text;
  income_review_percentage integer := 0;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles
      as profile
    where profile.id =
        current_user_id
      and profile.is_active =
        true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The selected client was not found.';
  end if;

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
    requested_client_id
  order by
    organizer.tax_year desc,
    organizer.updated_at desc,
    organizer.created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'hasOrganizer',
        false,

      'organizer',
        null,

      'assignment',
        null,

      'reviewSummary',
        jsonb_build_object(
          'incomeSourceCount',
            0,

          'reviewedCount',
            0,

          'needsFollowUpCount',
            0,

          'returnedToClientCount',
            0,

          'pendingCount',
            0,

          'reviewPercentage',
            0
        ),

      'sections',
        jsonb_build_array(
          jsonb_build_object(
            'key',
              'income',

            'label',
              'Income',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'dependents',

            'label',
              'Dependents',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'healthcare',

            'label',
              'Healthcare',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'deductions',

            'label',
              'Deductions',

            'status',
              'not_started',

            'isImplemented',
              false
          ),

          jsonb_build_object(
            'key',
              'credits',

            'label',
              'Credits',

            'status',
              'not_started',

            'isImplemented',
              false
          )
        )
    );
  end if;

  select
    tax_return.assigned_preparer_id,

    coalesce(
      nullif(
        trim(
          preparer.display_name
        ),
        ''
      ),

      nullif(
        trim(
          concat_ws(
            ' ',
            preparer.first_name,
            preparer.last_name
          )
        ),
        ''
      ),

      preparer.email
    )

  into
    assigned_preparer_id,
    assigned_preparer_name

  from public.tax_returns
    as tax_return

  left join public.profiles
    as preparer
    on preparer.id =
      tax_return.assigned_preparer_id

  where tax_return.client_id =
      requested_client_id
    and tax_return.tax_year =
      selected_organizer.tax_year

  order by
    tax_return.updated_at desc,
    tax_return.created_at desc

  limit 1;

  select
    count(*)::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'reviewed'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'needs_follow_up'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'returned_to_client'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'pending'
    )::integer

  into
    income_source_count,
    income_reviewed_count,
    income_follow_up_count,
    income_returned_count,
    income_pending_count

  from public.client_tax_organizer_income_sources
    as income_source

  left join
    public.client_tax_organizer_income_reviews
      as income_review
    on income_review.income_source_id =
      income_source.id

  where income_source.organizer_id =
    selected_organizer.id;

  if income_source_count > 0 then
    income_review_percentage :=
      round(
        (
          income_reviewed_count::numeric /
          income_source_count::numeric
        ) *
        100
      )::integer;
  end if;

  income_review_status :=
    case
      when income_source_count = 0
        then 'not_started'

      when income_returned_count > 0
        then 'returned_to_client'

      when income_follow_up_count > 0
        then 'needs_follow_up'

      when income_reviewed_count =
        income_source_count
        then 'reviewed'

      else 'in_progress'
    end;

  return jsonb_build_object(
    'hasOrganizer',
      true,

    'organizer',
      jsonb_build_object(
        'organizerId',
          selected_organizer.id,

        'clientId',
          selected_organizer.client_id,

        'taxYear',
          selected_organizer.tax_year,

        'status',
          selected_organizer.status,

        'currentSection',
          selected_organizer.current_section,

        'progressPercentage',
          selected_organizer.progress_percentage,

        'startedAt',
          selected_organizer.started_at,

        'submittedAt',
          selected_organizer.submitted_at,

        'lastSavedAt',
          selected_organizer.last_saved_at,

        'updatedAt',
          selected_organizer.updated_at
      ),

    'assignment',
      jsonb_build_object(
        'preparerId',
          assigned_preparer_id,

        'preparerName',
          assigned_preparer_name
      ),

    'reviewSummary',
      jsonb_build_object(
        'incomeSourceCount',
          income_source_count,

        'reviewedCount',
          income_reviewed_count,

        'needsFollowUpCount',
          income_follow_up_count,

        'returnedToClientCount',
          income_returned_count,

        'pendingCount',
          income_pending_count,

        'reviewPercentage',
          income_review_percentage
      ),

    'sections',
      jsonb_build_array(
        jsonb_build_object(
          'key',
            'income',

          'label',
            'Income',

          'status',
            income_review_status,

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'dependents',

          'label',
            'Dependents',

          'status',
            'pending',

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'healthcare',

          'label',
            'Healthcare',

          'status',
            'pending',

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'deductions',

          'label',
            'Deductions',

          'status',
            'not_started',

          'isImplemented',
            false
        ),

        jsonb_build_object(
          'key',
            'credits',

          'label',
            'Credits',

          'status',
            'not_started',

          'isImplemented',
            false
        )
      )
  );
end;
$function$;

revoke all
on function
public.get_staff_client_organizer_workspace(
  uuid
)
from public;

revoke all
on function
public.get_staff_client_organizer_workspace(
  uuid
)
from anon;

grant execute
on function
public.get_staff_client_organizer_workspace(
  uuid
)
to authenticated;

comment on function
public.get_staff_client_organizer_workspace(
  uuid
)
is
'Returns the latest organizer, matching preparer assignment, and live Income review summary for a staff Client Details workspace card.';

commit;