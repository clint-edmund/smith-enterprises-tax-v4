create or replace function public.get_client_returns()
returns table (
  return_id uuid,
  tax_year integer,
  return_type public.return_type,
  tax_form public.tax_form_type,
  status public.return_status,
  assigned_preparer_name text,
  updated_at timestamptz,
  preparation_fee numeric,
  discount_amount numeric,
  total_payments numeric,
  outstanding_balance numeric,
  document_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    tr.id as return_id,
    tr.tax_year,
    tr.return_type,
    tr.tax_form,
    tr.status,

    nullif(
      trim(
        concat_ws(
          ' ',
          p.first_name,
          p.last_name
        )
      ),
      ''
    ) as assigned_preparer_name,

    tr.updated_at,

    coalesce(
      tr.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      tr.discount_amount,
      0
    ) as discount_amount,

    coalesce(
      (
        select sum(pay.amount)
        from public.payments pay
        where pay.tax_return_id = tr.id
          and pay.is_voided = false
      ),
      0
    ) as total_payments,

    greatest(
      coalesce(
        tr.preparation_fee,
        0
      )
      -
      coalesce(
        tr.discount_amount,
        0
      )
      -
      coalesce(
        (
          select sum(pay.amount)
          from public.payments pay
          where pay.tax_return_id = tr.id
            and pay.is_voided = false
        ),
        0
      ),
      0
    ) as outstanding_balance,

    (
      select count(*)
      from public.client_documents d
      where d.tax_return_id = tr.id
        and d.archived_at is null
        and d.is_current_version = true
    ) as document_count

  from public.tax_returns tr

  left join public.profiles p
    on p.id = tr.assigned_preparer_id

  where tr.client_id =
    public.current_client_id()

  order by
    tr.tax_year desc,
    tr.updated_at desc;
$$;

revoke all
on function public.get_client_returns()
from public;

grant execute
on function public.get_client_returns()
to authenticated;