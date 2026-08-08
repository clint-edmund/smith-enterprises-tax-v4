-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 8.1 tax-return management foundation
-- ============================================================
-- ------------------------------------------------------------
-- New tax-return classifications
-- ------------------------------------------------------------
create type public.tax_form_type as enum (
  '1040',
  '1040_nr',
  '1041',
  '1065',
  '1120',
  '1120_s',
  '990',
  'schedule_c',
  'state_only',
  'other'
);
create type public.filing_status as enum (
  'single',
  'married_filing_jointly',
  'married_filing_separately',
  'head_of_household',
  'qualifying_surviving_spouse',
  'not_applicable'
);
-- ------------------------------------------------------------
-- Extend the existing tax_returns table
-- ------------------------------------------------------------
alter table public.tax_returns
add column tax_form public.tax_form_type not null default '1040';
alter table public.tax_returns
add column filing_status public.filing_status not null default 'not_applicable';
alter table public.tax_returns
add column description text;
alter table public.tax_returns
add column federal_return_required boolean not null default true;
alter table public.tax_returns
add column state_return_required boolean not null default false;
alter table public.tax_returns
add column local_return_required boolean not null default false;
alter table public.tax_returns
add column extension_filed boolean not null default false;
alter table public.tax_returns
add column extension_date date;
alter table public.tax_returns
add column estimated_refund numeric(12, 2) not null default 0;
alter table public.tax_returns
add column estimated_amount_due numeric(12, 2) not null default 0;
alter table public.tax_returns
add constraint tax_returns_estimated_refund_valid check (estimated_refund >= 0);
alter table public.tax_returns
add constraint tax_returns_estimated_amount_due_valid check (estimated_amount_due >= 0);
alter table public.tax_returns
add constraint tax_returns_extension_fields_valid check (
    extension_filed = false
    or extension_date is not null
  );
create index tax_returns_form_index on public.tax_returns(tax_form);
create index tax_returns_reviewer_index on public.tax_returns(assigned_reviewer_id);
create index tax_returns_received_date_index on public.tax_returns(date_received desc);
-- ------------------------------------------------------------
-- Search tax returns
-- ------------------------------------------------------------
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
  ) language plpgsql stable security definer
set search_path = '' as $$
declare safe_limit integer;
normalized_search text;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
safe_limit := least(
  greatest(coalesce(requested_limit, 100), 1),
  250
);
normalized_search := nullif(lower(trim(requested_search)), '');
return query
select tax_return.id,
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
    nullif(
      concat_ws(
        ' ',
        preparer.first_name,
        preparer.last_name
      ),
      ''
    ),
    preparer.email
  ) as assigned_preparer_name,
  tax_return.assigned_reviewer_id,
  coalesce(
    nullif(reviewer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        reviewer.first_name,
        reviewer.last_name
      ),
      ''
    ),
    reviewer.email
  ) as assigned_reviewer_name,
  tax_return.date_received,
  tax_return.due_date,
  tax_return.filed_date,
  tax_return.accepted_date,
  tax_return.preparation_fee,
  tax_return.discount_amount,
  (
    tax_return.preparation_fee - tax_return.discount_amount
  )::numeric as net_fee,
  tax_return.created_at,
  tax_return.updated_at
from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
where (
    requested_status is null
    or tax_return.status = requested_status
  )
  and (
    requested_tax_year is null
    or tax_return.tax_year = requested_tax_year
  )
  and (
    requested_preparer_id is null
    or tax_return.assigned_preparer_id = requested_preparer_id
  )
  and (
    normalized_search is null
    or lower(client.first_name) like '%' || normalized_search || '%'
    or lower(client.last_name) like '%' || normalized_search || '%'
    or client.client_number::text like '%' || normalized_search || '%'
    or tax_return.tax_year::text like '%' || normalized_search || '%'
    or lower(tax_return.tax_form::text) like '%' || normalized_search || '%'
  )
order by tax_return.tax_year desc,
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
)
from public;
revoke all on function public.search_tax_returns(
  text,
  public.return_status,
  integer,
  uuid,
  integer
)
from anon;
grant execute on function public.search_tax_returns(
    text,
    public.return_status,
    integer,
    uuid,
    integer
  ) to authenticated;
-- ------------------------------------------------------------
-- Client return history
-- ------------------------------------------------------------
create or replace function public.get_client_tax_returns(requested_client_id uuid) returns table (
    id uuid,
    client_id uuid,
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
  ) language plpgsql stable security definer
set search_path = '' as $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select tax_return.id,
  tax_return.client_id,
  tax_return.tax_year,
  tax_return.return_type,
  tax_return.tax_form,
  tax_return.filing_status,
  tax_return.status,
  tax_return.assigned_preparer_id,
  coalesce(
    nullif(preparer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        preparer.first_name,
        preparer.last_name
      ),
      ''
    ),
    preparer.email
  ),
  tax_return.assigned_reviewer_id,
  coalesce(
    nullif(reviewer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        reviewer.first_name,
        reviewer.last_name
      ),
      ''
    ),
    reviewer.email
  ),
  tax_return.date_received,
  tax_return.due_date,
  tax_return.filed_date,
  tax_return.accepted_date,
  tax_return.preparation_fee,
  tax_return.discount_amount,
  (
    tax_return.preparation_fee - tax_return.discount_amount
  )::numeric,
  tax_return.created_at,
  tax_return.updated_at
from public.tax_returns as tax_return
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
where tax_return.client_id = requested_client_id
order by tax_return.tax_year desc,
  tax_return.created_at desc;
end;
$$;
revoke all on function public.get_client_tax_returns(uuid)
from public;
revoke all on function public.get_client_tax_returns(uuid)
from anon;
grant execute on function public.get_client_tax_returns(uuid) to authenticated;
-- ------------------------------------------------------------
-- Active staff assignment list
-- ------------------------------------------------------------
create or replace function public.get_return_staff_options() returns table (
    id uuid,
    display_name text,
    email text,
    role public.app_role
  ) language plpgsql stable security definer
set search_path = '' as $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select profile.id,
  coalesce(
    nullif(profile.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        profile.first_name,
        profile.last_name
      ),
      ''
    ),
    profile.email
  ) as display_name,
  profile.email,
  profile.role
from public.profiles as profile
where profile.is_active = true
  and profile.role in (
    'administrator',
    'manager',
    'preparer',
    'reviewer'
  )
order by display_name,
  profile.email;
end;
$$;
revoke all on function public.get_return_staff_options()
from public;
revoke all on function public.get_return_staff_options()
from anon;
grant execute on function public.get_return_staff_options() to authenticated;
-- ------------------------------------------------------------
-- Create a tax return and audit it
-- ------------------------------------------------------------
create or replace function public.create_tax_return_record(
    requested_client_id uuid,
    requested_tax_year integer,
    requested_return_type public.return_type,
    requested_tax_form public.tax_form_type,
    requested_filing_status public.filing_status,
    requested_status public.return_status,
    requested_assigned_preparer_id uuid default null,
    requested_assigned_reviewer_id uuid default null,
    requested_date_received date default null,
    requested_due_date date default null,
    requested_filed_date date default null,
    requested_accepted_date date default null,
    requested_preparation_fee numeric default 0,
    requested_discount_amount numeric default 0,
    requested_description text default null,
    requested_federal_return_required boolean default true,
    requested_state_return_required boolean default false,
    requested_local_return_required boolean default false,
    requested_extension_filed boolean default false,
    requested_extension_date date default null,
    requested_estimated_refund numeric default 0,
    requested_estimated_amount_due numeric default 0,
    requested_notes text default null
  ) returns public.tax_returns language plpgsql security definer
set search_path = '' as $$
declare return_record public.tax_returns;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to create tax returns.';
end if;
if requested_tax_year < 2000
or requested_tax_year > 2100 then raise exception 'Tax year is invalid.';
end if;
if requested_preparation_fee < 0 then raise exception 'Preparation fee cannot be negative.';
end if;
if requested_discount_amount < 0 then raise exception 'Discount cannot be negative.';
end if;
if requested_discount_amount > requested_preparation_fee then raise exception 'Discount cannot exceed preparation fee.';
end if;
if requested_estimated_refund < 0
or requested_estimated_amount_due < 0 then raise exception 'Estimated tax amounts cannot be negative.';
end if;
if requested_extension_filed = true
and requested_extension_date is null then raise exception 'Extension date is required when an extension is filed.';
end if;
if not exists (
  select 1
  from public.clients
  where id = requested_client_id
) then raise exception 'Client record was not found.';
end if;
insert into public.tax_returns (
    client_id,
    tax_year,
    return_type,
    tax_form,
    filing_status,
    status,
    assigned_preparer_id,
    assigned_reviewer_id,
    date_received,
    due_date,
    filed_date,
    accepted_date,
    preparation_fee,
    discount_amount,
    description,
    federal_return_required,
    state_return_required,
    local_return_required,
    extension_filed,
    extension_date,
    estimated_refund,
    estimated_amount_due,
    notes,
    created_by,
    updated_by
  )
values (
    requested_client_id,
    requested_tax_year,
    requested_return_type,
    requested_tax_form,
    requested_filing_status,
    requested_status,
    requested_assigned_preparer_id,
    requested_assigned_reviewer_id,
    requested_date_received,
    requested_due_date,
    requested_filed_date,
    requested_accepted_date,
    requested_preparation_fee,
    requested_discount_amount,
    nullif(trim(requested_description), ''),
    requested_federal_return_required,
    requested_state_return_required,
    requested_local_return_required,
    requested_extension_filed,
    requested_extension_date,
    requested_estimated_refund,
    requested_estimated_amount_due,
    nullif(trim(requested_notes), ''),
    auth.uid(),
    auth.uid()
  )
returning * into return_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values
  )
values (
    auth.uid(),
    'tax_return_created',
    'tax_return',
    return_record.id,
    jsonb_build_object(
      'client_id',
      return_record.client_id,
      'tax_year',
      return_record.tax_year,
      'return_type',
      return_record.return_type,
      'tax_form',
      return_record.tax_form,
      'status',
      return_record.status,
      'assigned_preparer_id',
      return_record.assigned_preparer_id
    )
  );
return return_record;
end;
$$;
revoke all on function public.create_tax_return_record(
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from public;
revoke all on function public.create_tax_return_record(
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from anon;
grant execute on function public.create_tax_return_record(
    uuid,
    integer,
    public.return_type,
    public.tax_form_type,
    public.filing_status,
    public.return_status,
    uuid,
    uuid,
    date,
    date,
    date,
    date,
    numeric,
    numeric,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    date,
    numeric,
    numeric,
    text
  ) to authenticated;
-- ------------------------------------------------------------
-- Update a tax return and audit it
-- ------------------------------------------------------------
create or replace function public.update_tax_return_record(
    requested_return_id uuid,
    requested_client_id uuid,
    requested_tax_year integer,
    requested_return_type public.return_type,
    requested_tax_form public.tax_form_type,
    requested_filing_status public.filing_status,
    requested_status public.return_status,
    requested_assigned_preparer_id uuid default null,
    requested_assigned_reviewer_id uuid default null,
    requested_date_received date default null,
    requested_due_date date default null,
    requested_filed_date date default null,
    requested_accepted_date date default null,
    requested_preparation_fee numeric default 0,
    requested_discount_amount numeric default 0,
    requested_description text default null,
    requested_federal_return_required boolean default true,
    requested_state_return_required boolean default false,
    requested_local_return_required boolean default false,
    requested_extension_filed boolean default false,
    requested_extension_date date default null,
    requested_estimated_refund numeric default 0,
    requested_estimated_amount_due numeric default 0,
    requested_notes text default null
  ) returns public.tax_returns language plpgsql security definer
set search_path = '' as $$
declare previous_record public.tax_returns;
updated_record public.tax_returns;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to update tax returns.';
end if;
if requested_tax_year < 2000
or requested_tax_year > 2100 then raise exception 'Tax year is invalid.';
end if;
if requested_preparation_fee < 0 then raise exception 'Preparation fee cannot be negative.';
end if;
if requested_discount_amount < 0 then raise exception 'Discount cannot be negative.';
end if;
if requested_discount_amount > requested_preparation_fee then raise exception 'Discount cannot exceed preparation fee.';
end if;
if requested_estimated_refund < 0
or requested_estimated_amount_due < 0 then raise exception 'Estimated tax amounts cannot be negative.';
end if;
if requested_extension_filed = true
and requested_extension_date is null then raise exception 'Extension date is required when an extension is filed.';
end if;
select * into previous_record
from public.tax_returns
where id = requested_return_id;
if not found then raise exception 'Tax return was not found.';
end if;
update public.tax_returns
set client_id = requested_client_id,
  tax_year = requested_tax_year,
  return_type = requested_return_type,
  tax_form = requested_tax_form,
  filing_status = requested_filing_status,
  status = requested_status,
  assigned_preparer_id = requested_assigned_preparer_id,
  assigned_reviewer_id = requested_assigned_reviewer_id,
  date_received = requested_date_received,
  due_date = requested_due_date,
  filed_date = requested_filed_date,
  accepted_date = requested_accepted_date,
  preparation_fee = requested_preparation_fee,
  discount_amount = requested_discount_amount,
  description = nullif(trim(requested_description), ''),
  federal_return_required = requested_federal_return_required,
  state_return_required = requested_state_return_required,
  local_return_required = requested_local_return_required,
  extension_filed = requested_extension_filed,
  extension_date = case
    when requested_extension_filed then requested_extension_date
    else null
  end,
  estimated_refund = requested_estimated_refund,
  estimated_amount_due = requested_estimated_amount_due,
  notes = nullif(trim(requested_notes), ''),
  updated_by = auth.uid()
where id = requested_return_id
returning * into updated_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'tax_return_updated',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'client_id',
      previous_record.client_id,
      'tax_year',
      previous_record.tax_year,
      'return_type',
      previous_record.return_type,
      'tax_form',
      previous_record.tax_form,
      'status',
      previous_record.status,
      'assigned_preparer_id',
      previous_record.assigned_preparer_id,
      'assigned_reviewer_id',
      previous_record.assigned_reviewer_id,
      'preparation_fee',
      previous_record.preparation_fee,
      'discount_amount',
      previous_record.discount_amount
    ),
    jsonb_build_object(
      'client_id',
      updated_record.client_id,
      'tax_year',
      updated_record.tax_year,
      'return_type',
      updated_record.return_type,
      'tax_form',
      updated_record.tax_form,
      'status',
      updated_record.status,
      'assigned_preparer_id',
      updated_record.assigned_preparer_id,
      'assigned_reviewer_id',
      updated_record.assigned_reviewer_id,
      'preparation_fee',
      updated_record.preparation_fee,
      'discount_amount',
      updated_record.discount_amount
    )
  );
return updated_record;
end;
$$;
revoke all on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from public;
revoke all on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from anon;
grant execute on function public.update_tax_return_record(
    uuid,
    uuid,
    integer,
    public.return_type,
    public.tax_form_type,
    public.filing_status,
    public.return_status,
    uuid,
    uuid,
    date,
    date,
    date,
    date,
    numeric,
    numeric,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    date,
    numeric,
    numeric,
    text
  ) to authenticated;
-- ------------------------------------------------------------
-- Documentation
-- ------------------------------------------------------------
comment on function public.search_tax_returns(
  text,
  public.return_status,
  integer,
  uuid,
  integer
) is 'Returns searchable tax-return records for active staff.';
comment on function public.get_client_tax_returns(uuid) is 'Returns the complete tax-return history for one client.';
comment on function public.get_return_staff_options() is 'Returns active preparer and reviewer assignment options.';
comment on function public.create_tax_return_record(
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
) is 'Creates a tax return and corresponding audit event.';
comment on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
) is 'Updates a tax return and corresponding audit event.';