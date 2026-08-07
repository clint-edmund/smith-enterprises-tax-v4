create or replace function public.get_return_workspace_summary(
    p_return_id uuid
)
returns table
(
    return_id uuid,

    client_id uuid,
    client_name text,

    tax_year integer,
    return_type text,
    status text,

    assigned_preparer text,
    assigned_reviewer text,

    due_date date,

    estimated_amount_due numeric,
    payments_received numeric,
    outstanding_balance numeric,

    created_at timestamptz,
    updated_at timestamptz,

    workflow_percent integer
)
language sql
stable
security definer
set search_path = public
as
$$

select

    r.id as return_id,

    c.id as client_id,

    trim(
        concat_ws(
            ' ',
            c.first_name,
            c.last_name
        )
    ) as client_name,

    r.tax_year,

    r.return_type::text,

    r.status::text,

    prep.display_name as assigned_preparer,

    rev.display_name as assigned_reviewer,

    r.due_date,

    coalesce(
        r.estimated_amount_due,
        0
    ) as estimated_amount_due,

    coalesce(
        (
            select
                sum(p.amount)
            from payments p
            where
                p.tax_return_id = r.id
                and p.is_voided = false
        ),
        0
    ) as payments_received,

    coalesce(
        r.estimated_amount_due,
        0
    )
    -
    coalesce(
        (
            select
                sum(p.amount)
            from payments p
            where
                p.tax_return_id = r.id
                and p.is_voided = false
        ),
        0
    ) as outstanding_balance,

    r.created_at,

    r.updated_at,

    case r.status::text

        when 'not_started'
            then 5

        when 'documents_pending'
            then 15

        when 'in_progress'
            then 50

        when 'ready_for_review'
            then 70

        when 'under_review'
            then 80

        when 'ready_to_file'
            then 90

        when 'filed'
            then 95

        when 'accepted'
            then 100

        when 'completed'
            then 100

        when 'rejected'
            then 0

        when 'on_hold'
            then 25

        else 0

    end as workflow_percent

from tax_returns r

join clients c
    on c.id = r.client_id

left join profiles prep
    on prep.id = r.assigned_preparer_id

left join profiles rev
    on rev.id = r.assigned_reviewer_id

where r.id = p_return_id;

$$;

grant execute
on function public.get_return_workspace_summary(uuid)
to authenticated;