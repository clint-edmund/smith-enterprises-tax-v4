drop function if exists public.get_office_payment_summary();

create function public.get_office_payment_summary()
returns table (
  payments_today numeric,
  payment_count_today bigint,
  payments_this_month numeric,
  payment_count_this_month bigint,
  outstanding_receivables numeric,
  returns_with_balance bigint,
  voided_payments_total numeric,
  voided_payment_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  return query
  with active_payments as (
    select
      payment.amount,
      payment.payment_date
    from public.payments payment
    where payment.is_voided = false
  ),
  return_balances as (
    select
      tax_return.id,
      greatest(
        coalesce(tax_return.preparation_fee, 0)
        - coalesce(tax_return.discount_amount, 0)
        - coalesce(
            sum(
              case
                when payment.is_voided = false
                  then payment.amount
                else 0
              end
            ),
            0
          ),
        0
      ) as outstanding_balance
    from public.tax_returns tax_return
    left join public.payments payment
      on payment.tax_return_id = tax_return.id
    group by
      tax_return.id,
      tax_return.preparation_fee,
      tax_return.discount_amount
  ),
  voided_payments as (
    select
      coalesce(sum(payment.amount), 0) as total_amount,
      count(*) as payment_count
    from public.payments payment
    where payment.is_voided = true
  )
  select
    coalesce(
      (
        select sum(active_payment.amount)
        from active_payments active_payment
        where active_payment.payment_date =
          current_date
      ),
      0
    ) as payments_today,

    (
      select count(*)
      from active_payments active_payment
      where active_payment.payment_date =
        current_date
    ) as payment_count_today,

    coalesce(
      (
        select sum(active_payment.amount)
        from active_payments active_payment
        where active_payment.payment_date >=
          date_trunc(
            'month',
            current_date
          )::date
          and active_payment.payment_date <
            (
              date_trunc(
                'month',
                current_date
              )
              + interval '1 month'
            )::date
      ),
      0
    ) as payments_this_month,

    (
      select count(*)
      from active_payments active_payment
      where active_payment.payment_date >=
        date_trunc(
          'month',
          current_date
        )::date
        and active_payment.payment_date <
          (
            date_trunc(
              'month',
              current_date
            )
            + interval '1 month'
          )::date
    ) as payment_count_this_month,

    coalesce(
      (
        select sum(
          return_balance.outstanding_balance
        )
        from return_balances return_balance
      ),
      0
    ) as outstanding_receivables,

    (
      select count(*)
      from return_balances return_balance
      where return_balance.outstanding_balance > 0
    ) as returns_with_balance,

    (
      select voided_payment.total_amount
      from voided_payments voided_payment
    ) as voided_payments_total,

    (
      select voided_payment.payment_count
      from voided_payments voided_payment
    ) as voided_payment_count;
end;
$$;

revoke all
on function public.get_office_payment_summary()
from public;

grant execute
on function public.get_office_payment_summary()
to authenticated;


drop function if exists public.get_recent_office_payments(integer);

create function public.get_recent_office_payments(
  requested_limit integer default 25
)
returns table (
  payment_id uuid,
  tax_return_id uuid,
  client_id uuid,
  client_number bigint,
  client_name text,
  tax_year integer,
  return_type public.return_type,
  tax_form public.tax_form_type,
  amount numeric,
  payment_date date,
  payment_method public.payment_method,
  reference_number text,
  receipt_number text,
  is_voided boolean,
  voided_at timestamptz,
  void_reason text,
  created_by uuid,
  created_by_name text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  normalized_limit integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  normalized_limit :=
    least(
      greatest(
        coalesce(requested_limit, 25),
        1
      ),
      100
    );

  return query
  select
    payment.id as payment_id,
    tax_return.id as tax_return_id,
    client.id as client_id,
    client.client_number,
    trim(
      concat_ws(
        ' ',
        client.first_name,
        client.last_name
      )
    ) as client_name,
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    payment.amount,
    payment.payment_date,
    payment.payment_method,
    payment.reference_number,
    payment.receipt_number,
    payment.is_voided,
    payment.voided_at,
    payment.void_reason,
    payment.created_by,
    coalesce(
      creator.display_name,
      'System'
    ) as created_by_name,
    payment.created_at
  from public.payments payment
  inner join public.tax_returns tax_return
    on tax_return.id =
      payment.tax_return_id
  inner join public.clients client
    on client.id =
      payment.client_id
  left join public.profiles creator
    on creator.id =
      payment.created_by
  order by
    payment.payment_date desc,
    payment.created_at desc
  limit normalized_limit;
end;
$$;

revoke all
on function public.get_recent_office_payments(integer)
from public;

grant execute
on function public.get_recent_office_payments(integer)
to authenticated;