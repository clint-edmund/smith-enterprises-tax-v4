-- Smith Enterprises Tax Management V4
-- Phase 8.6.2A Sprint 3: strengthened return search

create index if not exists clients_lower_first_name_index
  on public.clients (lower(first_name));

create index if not exists clients_lower_last_name_index
  on public.clients (lower(last_name));

create index if not exists clients_lower_email_index
  on public.clients (lower(email));

create index if not exists clients_phone_index
  on public.clients (phone);

create index if not exists tax_returns_search_sort_index
  on public.tax_returns (tax_year desc, status, assigned_preparer_id, created_at desc);

create or replace function public.search_tax_returns(
    requested_search text default null,
    requested_status public.return_status default null,
    requested_tax_year integer default null,
    requested_preparer_id uuid default null,
    requested_limit integer default 100
  ) returns table (
    id uuid,
    client_id uuid,
    client_number bigint,
    client_first_name text,
    client_last_name text,
    tax_year integer,
    return_type public.return_type,
    tax_form public.tax_form_type,
    filing_status public.filing_status,
    status public.return_status,
    assigned_preparer_id uuid,
    assigned_preparer_name text,
    assigned_reviewer_id uuid,
    assigned_reviewer_name text,
    date_received date,
    due_date date,
    filed_date date,
    accepted_date date,
    preparation_fee numeric,
    discount_amount numeric,
    net_fee numeric,
    created_at timestamptz,
    updated_at timestamptz
  )
  language plpgsql
  stable
  security definer
  set search_path = ''
as $$
declare
  safe_limit integer;
  normalized_search text;
  normalized_phone_search text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  safe_limit := least(greatest(coalesce(requested_limit, 100), 1), 250);
  normalized_search := nullif(lower(trim(requested_search)), '');
  normalized_phone_search := nullif(regexp_replace(coalesce(requested_search, ''), '[^0-9]', '', 'g'), '');

  return query
  select
    tax_return.id,
    tax_return.client_id,
    client.client_number,
    client.first_name,
    client.last_name,
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    tax_return.filing_status,
    tax_return.status,
    tax_return.assigned_preparer_id,
    coalesce(
      nullif(preparer.display_name, ''),
      nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
      preparer.email
    ) as assigned_preparer_name,
    tax_return.assigned_reviewer_id,
    coalesce(
      nullif(reviewer.display_name, ''),
      nullif(concat_ws(' ', reviewer.first_name, reviewer.last_name), ''),
      reviewer.email
    ) as assigned_reviewer_name,
    tax_return.date_received,
    tax_return.due_date,
    tax_return.filed_date,
    tax_return.accepted_date,
    tax_return.preparation_fee,
    tax_return.discount_amount,
    (tax_return.preparation_fee - tax_return.discount_amount)::numeric as net_fee,
    tax_return.created_at,
    tax_return.updated_at
  from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
  where (requested_status is null or tax_return.status = requested_status)
    and (requested_tax_year is null or tax_return.tax_year = requested_tax_year)
    and (requested_preparer_id is null or tax_return.assigned_preparer_id = requested_preparer_id)
    and (
      normalized_search is null
      or lower(client.first_name) like '%' || normalized_search || '%'
      or lower(client.last_name) like '%' || normalized_search || '%'
      or lower(concat_ws(' ', client.first_name, client.last_name)) like '%' || normalized_search || '%'
      or client.client_number::text like '%' || normalized_search || '%'
      or lower(coalesce(client.email, '')) like '%' || normalized_search || '%'
      or (
        normalized_phone_search is not null
        and regexp_replace(coalesce(client.phone, ''), '[^0-9]', '', 'g')
          like '%' || normalized_phone_search || '%'
      )
      or tax_return.tax_year::text like '%' || normalized_search || '%'
      or lower(tax_return.tax_form::text) like '%' || normalized_search || '%'
    )
  order by
    tax_return.tax_year desc,
    client.last_name,
    client.first_name,
    tax_return.created_at desc
  limit safe_limit;
end;
$$;

revoke all on function public.search_tax_returns(
  text,
  public.return_status,
  integer,
  uuid,
  integer
) from public, anon;

grant execute on function public.search_tax_returns(
  text,
  public.return_status,
  integer,
  uuid,
  integer
) to authenticated;

comment on function public.search_tax_returns(
  text,
  public.return_status,
  integer,
  uuid,
  integer
) is 'Searches tax returns by workflow filters and client name, number, email, or phone.';
