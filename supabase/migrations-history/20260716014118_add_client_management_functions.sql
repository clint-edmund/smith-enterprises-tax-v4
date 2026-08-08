-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 7 client management functions
-- ============================================================
-- ------------------------------------------------------------
-- Search clients
-- ------------------------------------------------------------
create or replace function public.search_clients(
    requested_search text default null,
    requested_status public.client_status default null,
    requested_limit integer default 50
  ) returns table (
    id uuid,
    client_number bigint,
    first_name text,
    middle_name text,
    last_name text,
    preferred_name text,
    email text,
    phone text,
    city text,
    state text,
    status public.client_status,
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
  greatest(coalesce(requested_limit, 50), 1),
  100
);
normalized_search := nullif(lower(trim(requested_search)), '');
return query
select client.id,
  client.client_number,
  client.first_name,
  client.middle_name,
  client.last_name,
  client.preferred_name,
  client.email,
  client.phone,
  client.city,
  client.state,
  client.status,
  client.created_at,
  client.updated_at
from public.clients as client
where (
    requested_status is null
    or client.status = requested_status
  )
  and (
    normalized_search is null
    or lower(client.first_name) like '%' || normalized_search || '%'
    or lower(client.last_name) like '%' || normalized_search || '%'
    or lower(
      coalesce(client.preferred_name, '')
    ) like '%' || normalized_search || '%'
    or lower(coalesce(client.email, '')) like '%' || normalized_search || '%'
    or regexp_replace(
      coalesce(client.phone, ''),
      '[^0-9]',
      '',
      'g'
    ) like '%' || regexp_replace(
      normalized_search,
      '[^0-9]',
      '',
      'g'
    ) || '%'
    or client.client_number::text like '%' || normalized_search || '%'
  )
order by client.last_name,
  client.first_name,
  client.client_number
limit safe_limit;
end;
$$;
revoke all on function public.search_clients(
  text,
  public.client_status,
  integer
)
from public;
revoke all on function public.search_clients(
  text,
  public.client_status,
  integer
)
from anon;
grant execute on function public.search_clients(
    text,
    public.client_status,
    integer
  ) to authenticated;
-- ------------------------------------------------------------
-- Create client and audit event
-- ------------------------------------------------------------
create or replace function public.create_client_record(
    requested_first_name text,
    requested_middle_name text default null,
    requested_last_name text default null,
    requested_preferred_name text default null,
    requested_email text default null,
    requested_phone text default null,
    requested_alternate_phone text default null,
    requested_address_line_1 text default null,
    requested_address_line_2 text default null,
    requested_city text default null,
    requested_state text default null,
    requested_postal_code text default null,
    requested_birth_date date default null,
    requested_status public.client_status default 'active',
    requested_notes text default null
  ) returns public.clients language plpgsql security definer
set search_path = '' as $$
declare client_record public.clients;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to create clients.';
end if;
if nullif(trim(requested_first_name), '') is null then raise exception 'First name is required.';
end if;
if nullif(trim(requested_last_name), '') is null then raise exception 'Last name is required.';
end if;
insert into public.clients (
    first_name,
    middle_name,
    last_name,
    preferred_name,
    email,
    phone,
    alternate_phone,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    birth_date,
    status,
    notes,
    created_by,
    updated_by
  )
values (
    trim(requested_first_name),
    nullif(trim(requested_middle_name), ''),
    trim(requested_last_name),
    nullif(trim(requested_preferred_name), ''),
    nullif(lower(trim(requested_email)), ''),
    nullif(trim(requested_phone), ''),
    nullif(trim(requested_alternate_phone), ''),
    nullif(trim(requested_address_line_1), ''),
    nullif(trim(requested_address_line_2), ''),
    nullif(trim(requested_city), ''),
    nullif(upper(trim(requested_state)), ''),
    nullif(trim(requested_postal_code), ''),
    requested_birth_date,
    requested_status,
    nullif(trim(requested_notes), ''),
    auth.uid(),
    auth.uid()
  )
returning * into client_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values
  )
values (
    auth.uid(),
    'client_created',
    'client',
    client_record.id,
    jsonb_build_object(
      'client_number',
      client_record.client_number,
      'first_name',
      client_record.first_name,
      'last_name',
      client_record.last_name,
      'status',
      client_record.status
    )
  );
return client_record;
end;
$$;
revoke all on function public.create_client_record(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
)
from public;
revoke all on function public.create_client_record(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
)
from anon;
grant execute on function public.create_client_record(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    date,
    public.client_status,
    text
  ) to authenticated;
-- ------------------------------------------------------------
-- Update client and audit event
-- ------------------------------------------------------------
create or replace function public.update_client_record(
    requested_client_id uuid,
    requested_first_name text,
    requested_middle_name text default null,
    requested_last_name text default null,
    requested_preferred_name text default null,
    requested_email text default null,
    requested_phone text default null,
    requested_alternate_phone text default null,
    requested_address_line_1 text default null,
    requested_address_line_2 text default null,
    requested_city text default null,
    requested_state text default null,
    requested_postal_code text default null,
    requested_birth_date date default null,
    requested_status public.client_status default 'active',
    requested_notes text default null
  ) returns public.clients language plpgsql security definer
set search_path = '' as $$
declare previous_record public.clients;
updated_record public.clients;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to update clients.';
end if;
if nullif(trim(requested_first_name), '') is null then raise exception 'First name is required.';
end if;
if nullif(trim(requested_last_name), '') is null then raise exception 'Last name is required.';
end if;
select * into previous_record
from public.clients
where id = requested_client_id;
if not found then raise exception 'Client record was not found.';
end if;
update public.clients
set first_name = trim(requested_first_name),
  middle_name = nullif(trim(requested_middle_name), ''),
  last_name = trim(requested_last_name),
  preferred_name = nullif(trim(requested_preferred_name), ''),
  email = nullif(lower(trim(requested_email)), ''),
  phone = nullif(trim(requested_phone), ''),
  alternate_phone = nullif(trim(requested_alternate_phone), ''),
  address_line_1 = nullif(trim(requested_address_line_1), ''),
  address_line_2 = nullif(trim(requested_address_line_2), ''),
  city = nullif(trim(requested_city), ''),
  state = nullif(upper(trim(requested_state)), ''),
  postal_code = nullif(trim(requested_postal_code), ''),
  birth_date = requested_birth_date,
  status = requested_status,
  notes = nullif(trim(requested_notes), ''),
  updated_by = auth.uid()
where id = requested_client_id
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
    'client_updated',
    'client',
    updated_record.id,
    jsonb_build_object(
      'first_name',
      previous_record.first_name,
      'last_name',
      previous_record.last_name,
      'email',
      previous_record.email,
      'phone',
      previous_record.phone,
      'status',
      previous_record.status
    ),
    jsonb_build_object(
      'first_name',
      updated_record.first_name,
      'last_name',
      updated_record.last_name,
      'email',
      updated_record.email,
      'phone',
      updated_record.phone,
      'status',
      updated_record.status
    )
  );
return updated_record;
end;
$$;
revoke all on function public.update_client_record(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
)
from public;
revoke all on function public.update_client_record(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
)
from anon;
grant execute on function public.update_client_record(
    uuid,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    date,
    public.client_status,
    text
  ) to authenticated;
comment on function public.search_clients(text, public.client_status, integer) is 'Returns a limited searchable client list for active staff.';
comment on function public.create_client_record(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
) is 'Creates a client and writes the corresponding audit event.';
comment on function public.update_client_record(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  public.client_status,
  text
) is 'Updates a client and writes the corresponding audit event.';