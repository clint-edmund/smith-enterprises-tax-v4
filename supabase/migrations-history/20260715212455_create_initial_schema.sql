-- ============================================================
-- Smith Enterprises Tax Management v4
-- Initial database schema
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Enumerated types
-- ------------------------------------------------------------

create type public.app_role as enum (
  'administrator',
  'manager',
  'preparer',
  'reviewer',
  'receptionist',
  'read_only'
);

create type public.client_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.return_type as enum (
  'individual',
  'business',
  'amended',
  'extension',
  'other'
);

create type public.return_status as enum (
  'not_started',
  'documents_pending',
  'in_progress',
  'ready_for_review',
  'under_review',
  'ready_to_file',
  'filed',
  'accepted',
  'rejected',
  'completed',
  'on_hold'
);

create type public.payment_method as enum (
  'cash',
  'check',
  'credit_card',
  'debit_card',
  'ach',
  'money_order',
  'other'
);

-- ------------------------------------------------------------
-- Shared updated_at trigger function
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Profiles
-- Extends auth.users with application-specific information
-- ------------------------------------------------------------

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  email text not null,
  first_name text,
  last_name text,
  display_name text,
  phone text,

  role public.app_role not null
    default 'read_only',

  is_active boolean not null
    default false,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

create unique index profiles_email_lower_unique
  on public.profiles (lower(email));

create index profiles_role_index
  on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Function: create a profile when an Auth user is created
-- New users are disabled and read-only until approved.
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'read_only',
    false
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Role and permission helper functions
-- ------------------------------------------------------------

create or replace function public.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select profile.is_active
      from public.profiles as profile
      where profile.id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.profiles as profile
  where profile.id = auth.uid()
    and profile.is_active = true;
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() = 'administrator',
    false
  );
$$;

create or replace function public.current_user_can_manage_records()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in (
      'administrator',
      'manager',
      'preparer',
      'reviewer',
      'receptionist'
    ),
    false
  );
$$;

-- ------------------------------------------------------------
-- Clients
--
-- Sensitive values such as SSNs will not be stored directly in
-- this table during this phase. A later secure-intake phase will
-- define protected storage and display controls.
-- ------------------------------------------------------------

create table public.clients (
  id uuid primary key
    default gen_random_uuid(),

  client_number bigint
    generated by default as identity,

  first_name text not null,
  middle_name text,
  last_name text not null,
  preferred_name text,

  email text,
  phone text,
  alternate_phone text,

  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,

  birth_date date,

  status public.client_status not null
    default 'active',

  notes text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  updated_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint clients_email_length
    check (email is null or length(email) <= 320),

  constraint clients_phone_length
    check (phone is null or length(phone) <= 30),

  constraint clients_alternate_phone_length
    check (
      alternate_phone is null
      or length(alternate_phone) <= 30
    ),

  constraint clients_postal_code_length
    check (
      postal_code is null
      or length(postal_code) <= 20
    ),

  constraint clients_birth_date_valid
    check (
      birth_date is null
      or birth_date <= current_date
    )
);

create unique index clients_client_number_unique
  on public.clients (client_number);

create index clients_name_search_index
  on public.clients (
    lower(last_name),
    lower(first_name)
  );

create index clients_email_lower_index
  on public.clients (lower(email))
  where email is not null;

create index clients_status_index
  on public.clients (status);

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Tax returns
-- ------------------------------------------------------------

create table public.tax_returns (
  id uuid primary key
    default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id)
    on delete restrict,

  tax_year integer not null,

  return_type public.return_type not null
    default 'individual',

  status public.return_status not null
    default 'not_started',

  assigned_preparer_id uuid
    references public.profiles(id)
    on delete set null,

  assigned_reviewer_id uuid
    references public.profiles(id)
    on delete set null,

  date_received date,
  due_date date,
  filed_date date,
  accepted_date date,

  preparation_fee numeric(12, 2) not null
    default 0,

  discount_amount numeric(12, 2) not null
    default 0,

  notes text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  updated_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint tax_returns_tax_year_valid
    check (tax_year between 2000 and 2100),

  constraint tax_returns_preparation_fee_valid
    check (preparation_fee >= 0),

  constraint tax_returns_discount_amount_valid
    check (discount_amount >= 0),

  constraint tax_returns_discount_not_over_fee
    check (discount_amount <= preparation_fee),

  constraint tax_returns_client_year_type_unique
    unique (client_id, tax_year, return_type)
);

create index tax_returns_client_index
  on public.tax_returns (client_id);

create index tax_returns_status_index
  on public.tax_returns (status);

create index tax_returns_tax_year_index
  on public.tax_returns (tax_year);

create index tax_returns_preparer_index
  on public.tax_returns (assigned_preparer_id);

create trigger tax_returns_set_updated_at
before update on public.tax_returns
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Payments
-- ------------------------------------------------------------

create table public.payments (
  id uuid primary key
    default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id)
    on delete restrict,

  tax_return_id uuid
    references public.tax_returns(id)
    on delete restrict,

  amount numeric(12, 2) not null,

  payment_date date not null
    default current_date,

  payment_method public.payment_method not null,

  reference_number text,
  notes text,

  is_voided boolean not null
    default false,

  voided_at timestamptz,

  voided_by uuid
    references public.profiles(id)
    on delete set null,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint payments_amount_valid
    check (amount > 0),

  constraint payments_void_fields_valid
    check (
      (
        is_voided = false
        and voided_at is null
        and voided_by is null
      )
      or
      (
        is_voided = true
        and voided_at is not null
      )
    )
);

create index payments_client_index
  on public.payments (client_id);

create index payments_return_index
  on public.payments (tax_return_id);

create index payments_date_index
  on public.payments (payment_date);

create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Audit logs
--
-- Append-only records. Application users do not receive direct
-- UPDATE or DELETE policies for this table.
-- ------------------------------------------------------------

create table public.audit_logs (
  id bigint
    generated always as identity
    primary key,

  actor_id uuid
    references public.profiles(id)
    on delete set null,

  action text not null,
  entity_type text not null,
  entity_id uuid,

  old_values jsonb,
  new_values jsonb,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default timezone('utc', now())
);

create index audit_logs_actor_index
  on public.audit_logs (actor_id);

create index audit_logs_entity_index
  on public.audit_logs (
    entity_type,
    entity_id
  );

create index audit_logs_created_at_index
  on public.audit_logs (created_at desc);

-- ------------------------------------------------------------
-- Enable Row Level Security
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tax_returns enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- Force RLS for ordinary table owners where applicable.
alter table public.profiles force row level security;
alter table public.clients force row level security;
alter table public.tax_returns force row level security;
alter table public.payments force row level security;
alter table public.audit_logs force row level security;

-- ------------------------------------------------------------
-- Profiles policies
-- ------------------------------------------------------------

create policy "Active users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  and is_active = true
);

create policy "Administrators can view all profiles"
on public.profiles
for select
to authenticated
using (
  public.current_user_is_admin()
);

create policy "Administrators can update profiles"
on public.profiles
for update
to authenticated
using (
  public.current_user_is_admin()
)
with check (
  public.current_user_is_admin()
);

-- ------------------------------------------------------------
-- Clients policies
-- ------------------------------------------------------------

create policy "Active staff can view clients"
on public.clients
for select
to authenticated
using (
  public.current_user_is_active()
);

create policy "Authorized staff can create clients"
on public.clients
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "Authorized staff can update clients"
on public.clients
for update
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
);

create policy "Administrators can delete clients"
on public.clients
for delete
to authenticated
using (
  public.current_user_is_admin()
);

-- ------------------------------------------------------------
-- Tax return policies
-- ------------------------------------------------------------

create policy "Active staff can view tax returns"
on public.tax_returns
for select
to authenticated
using (
  public.current_user_is_active()
);

create policy "Authorized staff can create tax returns"
on public.tax_returns
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "Authorized staff can update tax returns"
on public.tax_returns
for update
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
);

create policy "Administrators can delete tax returns"
on public.tax_returns
for delete
to authenticated
using (
  public.current_user_is_admin()
);

-- ------------------------------------------------------------
-- Payment policies
-- ------------------------------------------------------------

create policy "Active staff can view payments"
on public.payments
for select
to authenticated
using (
  public.current_user_is_active()
);

create policy "Authorized staff can create payments"
on public.payments
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "Managers can update payments"
on public.payments
for update
to authenticated
using (
  public.current_user_role() in (
    'administrator',
    'manager'
  )
)
with check (
  public.current_user_role() in (
    'administrator',
    'manager'
  )
);

create policy "Administrators can delete payments"
on public.payments
for delete
to authenticated
using (
  public.current_user_is_admin()
);

-- ------------------------------------------------------------
-- Audit-log policies
-- ------------------------------------------------------------

create policy "Administrators can view audit logs"
on public.audit_logs
for select
to authenticated
using (
  public.current_user_is_admin()
);

create policy "Active staff can create audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  public.current_user_is_active()
  and (
    actor_id is null
    or actor_id = auth.uid()
  )
);

-- There are intentionally no UPDATE or DELETE policies
-- for audit_logs.

-- ------------------------------------------------------------
-- Explicit table privileges
-- RLS still determines which rows can be accessed.
-- ------------------------------------------------------------

revoke all on table public.profiles from anon;
revoke all on table public.clients from anon;
revoke all on table public.tax_returns from anon;
revoke all on table public.payments from anon;
revoke all on table public.audit_logs from anon;

grant select, update
  on table public.profiles
  to authenticated;

grant select, insert, update, delete
  on table public.clients
  to authenticated;

grant select, insert, update, delete
  on table public.tax_returns
  to authenticated;

grant select, insert, update, delete
  on table public.payments
  to authenticated;

grant select, insert
  on table public.audit_logs
  to authenticated;

grant usage, select
  on sequence public.clients_client_number_seq
  to authenticated;

grant usage, select
  on sequence public.audit_logs_id_seq
  to authenticated;

grant execute
  on function public.current_user_is_active()
  to authenticated;

grant execute
  on function public.current_user_role()
  to authenticated;

grant execute
  on function public.current_user_is_admin()
  to authenticated;

grant execute
  on function public.current_user_can_manage_records()
  to authenticated;

-- ------------------------------------------------------------
-- Documentation
-- ------------------------------------------------------------

comment on table public.profiles is
  'Application profile and role information for authenticated staff.';

comment on table public.clients is
  'Smith Enterprises client records. Direct SSN storage is intentionally excluded from the initial schema.';

comment on table public.tax_returns is
  'Tax-return workflow records associated with clients.';

comment on table public.payments is
  'Payments associated with clients and optional tax returns.';

comment on table public.audit_logs is
  'Append-only application security and business activity log.';