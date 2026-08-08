-- ==========================================================
-- Phase 10.11.1A
-- Payment Receipt Infrastructure
-- ==========================================================

alter table public.payments
add column if not exists receipt_number text,
add column if not exists receipt_issued_at timestamptz,
add column if not exists receipt_issued_by uuid
references public.profiles(id);

create unique index if not exists
idx_payments_receipt_number
on public.payments(receipt_number);

create sequence if not exists
payment_receipt_sequence;

create or replace function public.generate_payment_receipt_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    next_number bigint;
begin
    next_number :=
        nextval('payment_receipt_sequence');

    return
        'RCP-'
        || to_char(current_date, 'YYYY')
        || '-'
        || lpad(next_number::text, 6, '0');
end;
$$;

grant execute
on function public.generate_payment_receipt_number()
to authenticated;