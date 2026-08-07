-- ============================================================
-- Phase 10.8.3A
-- Secure Client Portal Dashboard RPC
-- ============================================================

begin;

create or replace function public.get_client_portal_dashboard()
returns table (
  client_id uuid,
  client_number bigint,
  first_name text,
  preferred_name text,

  current_return_id uuid,
  current_tax_year integer,
  current_return_type public.return_type,
  current_tax_form public.tax_form_type,
  current_return_status public.return_status,
  current_return_updated_at timestamptz,

  assigned_preparer_name text,

  preparation_fee numeric,
  discount_amount numeric,
  total_payments numeric,
  outstanding_balance numeric,

  document_count bigint,
  recent_document_id uuid,
  recent_document_name text,
  recent_document_category text,
  recent_document_status text,
  recent_document_uploaded_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  resolved_client_id uuid;
begin
  resolved_client_id :=
    public.current_client_id();

  if resolved_client_id is null then
    raise exception
      'An active client portal profile was not found.'
      using errcode = 'P0001';
  end if;

  return query
  with current_return as (
    select
      tax_return.id,
      tax_return.client_id,
      tax_return.tax_year,
      tax_return.return_type,
      tax_return.tax_form,
      tax_return.status,
      tax_return.assigned_preparer_id,
      tax_return.preparation_fee,
      tax_return.discount_amount,
      tax_return.updated_at
    from public.tax_returns as tax_return
    where
      tax_return.client_id =
        resolved_client_id
    order by
      tax_return.tax_year desc,
      tax_return.updated_at desc,
      tax_return.created_at desc
    limit 1
  ),

  return_payments as (
    select
      payment.tax_return_id,

      coalesce(
        sum(payment.amount),
        0
      ) as total_payments
    from public.payments as payment
    inner join current_return
      on current_return.id =
        payment.tax_return_id
    where
      payment.client_id =
        resolved_client_id

      and payment.is_voided = false
    group by
      payment.tax_return_id
  ),

  client_document_summary as (
    select
      count(*) as document_count
    from public.client_documents as document
    where
      document.client_id =
        resolved_client_id

      and document.archived_at is null
  ),

  recent_document as (
    select
      document.id,
      document.original_file_name,
      document.category,
      document.status,
      document.created_at
    from public.client_documents as document
    where
      document.client_id =
        resolved_client_id

      and document.archived_at is null
    order by
      document.created_at desc
    limit 1
  )

  select
    client.id as client_id,
    client.client_number,
    client.first_name,
    client.preferred_name,

    current_return.id as current_return_id,
    current_return.tax_year as current_tax_year,
    current_return.return_type as current_return_type,
    current_return.tax_form as current_tax_form,
    current_return.status as current_return_status,
    current_return.updated_at
      as current_return_updated_at,

    coalesce(
      nullif(
        trim(preparer.display_name),
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
      )
    ) as assigned_preparer_name,

    coalesce(
      current_return.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      current_return.discount_amount,
      0
    ) as discount_amount,

    coalesce(
      return_payments.total_payments,
      0
    ) as total_payments,

    greatest(
      coalesce(
        current_return.preparation_fee,
        0
      )
      -
      coalesce(
        current_return.discount_amount,
        0
      )
      -
      coalesce(
        return_payments.total_payments,
        0
      ),
      0
    ) as outstanding_balance,

    coalesce(
      client_document_summary.document_count,
      0
    ) as document_count,

    recent_document.id
      as recent_document_id,

    recent_document.original_file_name
      as recent_document_name,

    recent_document.category
      as recent_document_category,

    recent_document.status
      as recent_document_status,

    recent_document.created_at
      as recent_document_uploaded_at

  from public.clients as client

  left join current_return
    on current_return.client_id =
      client.id

  left join public.profiles as preparer
    on preparer.id =
      current_return.assigned_preparer_id

  left join return_payments
    on return_payments.tax_return_id =
      current_return.id

  cross join client_document_summary

  left join recent_document
    on true

  where
    client.id =
      resolved_client_id;
end;
$$;

comment on function public.get_client_portal_dashboard() is
  'Returns the authenticated client portal user dashboard summary without exposing internal notes or administrative fields.';

revoke all
on function public.get_client_portal_dashboard()
from public;

grant execute
on function public.get_client_portal_dashboard()
to authenticated;

commit;