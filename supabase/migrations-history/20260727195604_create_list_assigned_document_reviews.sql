/*
  Phase 10.5.1
  Document Workspace — My Review Queue

  Returns pending documents assigned to the currently
  authenticated reviewer.

  Priority order:
  1. Overdue
  2. Due today
  3. Due within seven days
  4. Later due dates
  5. No due date
*/

drop function if exists public.list_my_assigned_document_reviews();

create function public.list_my_assigned_document_reviews()
returns table (
  document_id uuid,
  client_id uuid,
  client_number bigint,
  client_name text,
  tax_return_id uuid,
  tax_year integer,
  return_type text,
  original_file_name text,
  category text,
  review_status text,
  review_requested_by uuid,
  review_requested_by_name text,
  review_requested_at timestamptz,
  assigned_reviewer_id uuid,
  assigned_reviewer_name text,
  review_due_at timestamptz,
  uploaded_by uuid,
  uploaded_by_name text,
  created_at timestamptz,
  priority_code text,
  days_until_due integer
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  current_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into current_profile
  from public.profiles
  where id = auth.uid()
    and is_active = true;

  if not found then
    raise exception 'An active staff account is required.';
  end if;

  if current_profile.role not in (
    'administrator'::public.app_role,
    'manager'::public.app_role,
    'reviewer'::public.app_role
  ) then
    raise exception
      'Your role is not permitted to access the document review queue.';
  end if;

  return query
  select
    document.id as document_id,
    document.client_id,
    client.client_number,

    coalesce(
      nullif(
        trim(client.preferred_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            client.first_name,
            client.middle_name,
            client.last_name
          )
        ),
        ''
      ),
      concat(
        'Client ',
        client.client_number::text
      )
    ) as client_name,

    document.tax_return_id,
    tax_return.tax_year,
    tax_return.return_type::text,

    document.original_file_name,
    document.category,
    document.review_status,

    document.review_requested_by,

    coalesce(
      nullif(
        trim(requester.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            requester.first_name,
            requester.last_name
          )
        ),
        ''
      ),
      requester.email
    ) as review_requested_by_name,

    document.review_requested_at,
    document.assigned_reviewer_id,
    document.assigned_reviewer_name,
    document.review_due_at,

    document.uploaded_by,

    coalesce(
      nullif(
        trim(uploader.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            uploader.first_name,
            uploader.last_name
          )
        ),
        ''
      ),
      uploader.email
    ) as uploaded_by_name,

    document.created_at,

    case
      when document.review_due_at is null then
        'no_due_date'

      when document.review_due_at < current_date then
        'overdue'

      when document.review_due_at < current_date + interval '1 day' then
        'due_today'

      when document.review_due_at < current_date + interval '8 days' then
        'due_this_week'

      else
        'upcoming'
    end as priority_code,

    case
      when document.review_due_at is null then
        null

      else
        (
          document.review_due_at::date -
          current_date
        )::integer
    end as days_until_due

  from public.client_documents as document

  join public.clients as client
    on client.id = document.client_id

  left join public.tax_returns as tax_return
    on tax_return.id = document.tax_return_id

  left join public.profiles as requester
    on requester.id = document.review_requested_by

  left join public.profiles as uploader
    on uploader.id = document.uploaded_by

  where document.archived_at is null
    and document.is_current_version = true
    and document.review_status = 'pending_review'
    and document.assigned_reviewer_id = auth.uid()

  order by
    case
      when document.review_due_at is not null
        and document.review_due_at < current_date
        then 0

      when document.review_due_at is not null
        and document.review_due_at <
          current_date + interval '1 day'
        then 1

      when document.review_due_at is not null
        and document.review_due_at <
          current_date + interval '8 days'
        then 2

      when document.review_due_at is not null
        then 3

      else 4
    end,

    document.review_due_at asc nulls last,
    document.review_requested_at asc nulls last,
    document.created_at asc;
end;
$function$;

revoke all
on function public.list_my_assigned_document_reviews()
from public;

grant execute
on function public.list_my_assigned_document_reviews()
to authenticated;

comment on function
  public.list_my_assigned_document_reviews()
is
  'Returns pending document reviews assigned to the authenticated administrator, manager, or reviewer.';