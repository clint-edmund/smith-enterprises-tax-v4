create or replace function public.record_return_payment(
  requested_return_id uuid,
  requested_amount numeric,
  requested_payment_method public.payment_method,
  requested_payment_date date default current_date,
  requested_reference_number text default null,
  requested_notes text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  payment_client_id uuid;
  created_payment public.payments;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
      and profile.role in (
        'administrator',
        'manager',
        'preparer',
        'reviewer',
        'receptionist'
      )
  ) then
    raise exception
      'You are not authorized to record payments.';
  end if;

  if requested_return_id is null then
    raise exception
      'A tax-return identifier is required.';
  end if;

  if requested_amount is null
    or requested_amount <= 0
  then
    raise exception
      'The payment amount must be greater than zero.';
  end if;

  if requested_payment_method is null then
    raise exception
      'A payment method is required.';
  end if;

  if requested_payment_date is null then
    raise exception
      'A payment date is required.';
  end if;

  select tax_return.client_id
  into payment_client_id
  from public.tax_returns tax_return
  where tax_return.id = requested_return_id;

  if payment_client_id is null then
    raise exception
      'The selected tax return was not found.';
  end if;

  insert into public.payments (
    tax_return_id,
    client_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    created_by
  )
  values (
    requested_return_id,
    payment_client_id,
    requested_amount,
    requested_payment_date,
    requested_payment_method,
    nullif(
      trim(requested_reference_number),
      ''
    ),
    nullif(
      trim(requested_notes),
      ''
    ),
    current_user_id
  )
  returning *
  into created_payment;

  perform public.log_return_workflow(
    requested_return_id :=
      requested_return_id,

    requested_event_type :=
      'payment_received',

    requested_event_label :=
      'Payment received',

    requested_event_description :=
      format(
        'A payment of $%s was received.',
        to_char(
          requested_amount,
          'FM999,999,990.00'
        )
      ),

    requested_is_client_visible :=
      true,

    requested_event_data :=
      jsonb_build_object(
        'payment_id',
        created_payment.id,

        'amount',
        created_payment.amount,

        'payment_method',
        created_payment.payment_method,

        'payment_date',
        created_payment.payment_date,

        'reference_number',
        created_payment.reference_number
      ),

    requested_occurred_at :=
      now()
  );

  return created_payment;
end;
$$;

revoke all
on function public.record_return_payment(
  uuid,
  numeric,
  public.payment_method,
  date,
  text,
  text
)
from public;

grant execute
on function public.record_return_payment(
  uuid,
  numeric,
  public.payment_method,
  date,
  text,
  text
)
to authenticated;

create or replace function public.get_return_payments(
  requested_return_id uuid
)
returns table (
  id uuid,
  tax_return_id uuid,
  client_id uuid,
  amount numeric,
  payment_date date,
  payment_method public.payment_method,
  reference_number text,
  notes text,
  is_voided boolean,
  voided_at timestamptz,
  voided_by uuid,
  created_by uuid,
  created_by_name text,
  created_at timestamptz,
  updated_at timestamptz
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

  if requested_return_id is null then
    raise exception
      'A tax-return identifier is required.';
  end if;

  if not exists (
    select 1
    from public.tax_returns tax_return
    where tax_return.id = requested_return_id
  ) then
    raise exception
      'The selected tax return was not found.';
  end if;

  return query
  select
    payment.id,
    payment.tax_return_id,
    payment.client_id,
    payment.amount,
    payment.payment_date,
    payment.payment_method,
    payment.reference_number,
    payment.notes,
    payment.is_voided,
    payment.voided_at,
    payment.voided_by,
    payment.created_by,
    coalesce(
      creator.display_name,
      concat_ws(
        ' ',
        creator.first_name,
        creator.last_name
      ),
      creator.email,
      'System'
    ) as created_by_name,
    payment.created_at,
    payment.updated_at
  from public.payments payment
  left join public.profiles creator
    on creator.id = payment.created_by
  where payment.tax_return_id =
    requested_return_id
  order by
    payment.payment_date desc,
    payment.created_at desc;
end;
$$;

revoke all
on function public.get_return_payments(uuid)
from public;

grant execute
on function public.get_return_payments(uuid)
to authenticated;

create or replace function public.get_return_payment_summary(
  requested_return_id uuid
)
returns table (
  preparation_fee numeric,
  discount_amount numeric,
  net_fee numeric,
  total_paid numeric,
  outstanding_balance numeric,
  payment_count bigint
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
  select
    coalesce(
      tax_return.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      tax_return.discount_amount,
      0
    ) as discount_amount,

    greatest(
      coalesce(
        tax_return.preparation_fee,
        0
      ) -
      coalesce(
        tax_return.discount_amount,
        0
      ),
      0
    ) as net_fee,

    coalesce(
      sum(payment.amount)
        filter (
          where payment.is_voided = false
        ),
      0
    ) as total_paid,

    greatest(
      (
        coalesce(
          tax_return.preparation_fee,
          0
        ) -
        coalesce(
          tax_return.discount_amount,
          0
        )
      ) -
      coalesce(
        sum(payment.amount)
          filter (
            where payment.is_voided = false
          ),
        0
      ),
      0
    ) as outstanding_balance,

    count(payment.id)
      filter (
        where payment.is_voided = false
      ) as payment_count

  from public.tax_returns tax_return
  left join public.payments payment
    on payment.tax_return_id =
      tax_return.id

  where tax_return.id =
    requested_return_id

  group by
    tax_return.id,
    tax_return.preparation_fee,
    tax_return.discount_amount;
end;
$$;

revoke all
on function public.get_return_payment_summary(uuid)
from public;

grant execute
on function public.get_return_payment_summary(uuid)
to authenticated;