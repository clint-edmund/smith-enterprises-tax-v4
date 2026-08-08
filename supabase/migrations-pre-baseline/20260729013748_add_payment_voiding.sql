alter table public.payments
add column if not exists void_reason text;

comment on column public.payments.void_reason is
  'Explanation describing why a payment was voided.';


create or replace function public.void_return_payment(
  requested_payment_id uuid,
  requested_void_reason text
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  existing_payment public.payments;
  voided_payment public.payments;
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
      and profile.role in (
        'administrator',
        'manager'
      )
  ) then
    raise exception
      'You are not authorized to void payments.';
  end if;

  if requested_payment_id is null then
    raise exception
      'A payment identifier is required.';
  end if;

  if nullif(
    trim(requested_void_reason),
    ''
  ) is null then
    raise exception
      'A void reason is required.';
  end if;

  select payment.*
  into existing_payment
  from public.payments payment
  where payment.id = requested_payment_id
  for update;

  if not found then
    raise exception
      'The selected payment was not found.';
  end if;

  if existing_payment.is_voided then
    raise exception
      'The selected payment has already been voided.';
  end if;

  update public.payments
  set
    is_voided = true,
    voided_at = now(),
    voided_by = current_user_id,
    void_reason = trim(
      requested_void_reason
    ),
    updated_at = now()
  where id = requested_payment_id
  returning *
  into voided_payment;

  perform public.log_return_workflow(
    requested_return_id :=
      voided_payment.tax_return_id,

    requested_event_type :=
      'payment_voided',

    requested_event_label :=
      'Payment voided',

    requested_event_description :=
      format(
        'A payment of $%s was voided. Reason: %s',
        to_char(
          voided_payment.amount,
          'FM999,999,990.00'
        ),
        voided_payment.void_reason
      ),

    requested_is_client_visible :=
      false,

    requested_event_data :=
      jsonb_build_object(
        'payment_id',
        voided_payment.id,

        'amount',
        voided_payment.amount,

        'payment_method',
        voided_payment.payment_method,

        'payment_date',
        voided_payment.payment_date,

        'reference_number',
        voided_payment.reference_number,

        'void_reason',
        voided_payment.void_reason,

        'voided_by',
        voided_payment.voided_by,

        'voided_at',
        voided_payment.voided_at
      ),

    requested_occurred_at :=
      voided_payment.voided_at
  );

  return voided_payment;
end;
$$;

revoke all
on function public.void_return_payment(
  uuid,
  text
)
from public;

grant execute
on function public.void_return_payment(
  uuid,
  text
)
to authenticated;


drop function if exists
  public.get_return_payments(uuid);


create function public.get_return_payments(
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
  void_reason text,
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
    where tax_return.id =
      requested_return_id
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
    payment.void_reason,
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