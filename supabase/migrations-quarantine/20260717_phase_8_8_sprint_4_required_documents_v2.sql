-- Phase 8.8 Sprint 4 - Batch 1
-- Required document templates and per-return checklists

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Required document templates
-- ---------------------------------------------------------------------------

create table if not exists public.required_document_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  return_type public.return_type,
  tax_form public.tax_form_type,
  is_required boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  matching_keywords text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),

  constraint required_document_templates_name_not_blank
    check (length(trim(name)) > 0),

  constraint required_document_templates_category_allowed
    check (
      category in (
        'identity',
        'income',
        'deductions',
        'business',
        'irs_notice',
        'prior_return',
        'engagement',
        'internal',
        'miscellaneous'
      )
    ),

  constraint required_document_templates_sort_order_nonnegative
    check (sort_order >= 0)
);

create unique index if not exists
  required_document_templates_unique_scope
on public.required_document_templates (
  name,
  return_type,
  tax_form
)
nulls not distinct;

create index if not exists
  required_document_templates_lookup_idx
on public.required_document_templates (
  is_active,
  return_type,
  tax_form,
  sort_order
);

-- ---------------------------------------------------------------------------
-- Required documents initialized for an individual tax return
-- ---------------------------------------------------------------------------

create table if not exists public.return_required_documents (
  id uuid primary key default gen_random_uuid(),
  tax_return_id uuid not null
    references public.tax_returns(id)
    on delete cascade,
  template_id uuid
    references public.required_document_templates(id)
    on delete set null,
  name text not null,
  description text,
  category text not null,
  is_required boolean not null default true,
  is_complete boolean not null default false,
  matched_document_id uuid
    references public.client_documents(id)
    on delete set null,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),

  constraint return_required_documents_name_not_blank
    check (length(trim(name)) > 0),

  constraint return_required_documents_category_allowed
    check (
      category in (
        'identity',
        'income',
        'deductions',
        'business',
        'irs_notice',
        'prior_return',
        'engagement',
        'internal',
        'miscellaneous'
      )
    ),

  constraint return_required_documents_sort_order_nonnegative
    check (sort_order >= 0),

  constraint return_required_documents_completion_consistent
    check (
      (is_complete = false and completed_at is null)
      or
      (is_complete = true and completed_at is not null)
    )
);

create unique index if not exists
  return_required_documents_template_unique_idx
on public.return_required_documents (
  tax_return_id,
  template_id
)
where template_id is not null;

create index if not exists
  return_required_documents_return_idx
on public.return_required_documents (
  tax_return_id,
  is_complete,
  sort_order
);

create index if not exists
  return_required_documents_matched_document_idx
on public.return_required_documents (
  matched_document_id
)
where matched_document_id is not null;

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_required_document_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists
  set_required_document_templates_updated_at
on public.required_document_templates;

create trigger set_required_document_templates_updated_at
before update on public.required_document_templates
for each row
execute function public.set_required_document_updated_at();

drop trigger if exists
  set_return_required_documents_updated_at
on public.return_required_documents;

create trigger set_return_required_documents_updated_at
before update on public.return_required_documents
for each row
execute function public.set_required_document_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.required_document_templates enable row level security;
alter table public.return_required_documents enable row level security;

drop policy if exists
  required_document_templates_select_active_users
on public.required_document_templates;

create policy required_document_templates_select_active_users
on public.required_document_templates
for select
to authenticated
using (public.current_user_is_active());

drop policy if exists
  required_document_templates_manage_authorized_users
on public.required_document_templates;

create policy required_document_templates_manage_authorized_users
on public.required_document_templates
for all
to authenticated
using (public.current_user_can_manage_records())
with check (public.current_user_can_manage_records());

drop policy if exists
  return_required_documents_select_active_users
on public.return_required_documents;

create policy return_required_documents_select_active_users
on public.return_required_documents
for select
to authenticated
using (public.current_user_is_active());

drop policy if exists
  return_required_documents_manage_authorized_users
on public.return_required_documents;

create policy return_required_documents_manage_authorized_users
on public.return_required_documents
for all
to authenticated
using (public.current_user_can_manage_records())
with check (public.current_user_can_manage_records());

-- ---------------------------------------------------------------------------
-- RPC: initialize_required_documents
-- ---------------------------------------------------------------------------

create or replace function public.initialize_required_documents(
  requested_return_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_return public.tax_returns%rowtype;
  inserted_count integer := 0;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to initialize required documents.';
  end if;

  select *
  into selected_return
  from public.tax_returns
  where id = requested_return_id;

  if not found then
    raise exception 'Tax return not found.';
  end if;

  insert into public.return_required_documents (
    tax_return_id,
    template_id,
    name,
    description,
    category,
    is_required,
    sort_order,
    created_by,
    updated_by
  )
  select
    selected_return.id,
    template.id,
    template.name,
    template.description,
    template.category,
    template.is_required,
    template.sort_order,
    auth.uid(),
    auth.uid()
  from public.required_document_templates as template
  where template.is_active = true
    and (
      template.return_type is null
      or template.return_type = selected_return.return_type
    )
    and (
      template.tax_form is null
      or template.tax_form = selected_return.tax_form
    )
  on conflict (tax_return_id, template_id)
  where template_id is not null
  do nothing;

  get diagnostics inserted_count = row_count;

  return inserted_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: list_required_documents
-- ---------------------------------------------------------------------------

create or replace function public.list_required_documents(
  requested_return_id uuid
)
returns table (
  id uuid,
  tax_return_id uuid,
  template_id uuid,
  name text,
  description text,
  category text,
  is_required boolean,
  is_complete boolean,
  matched_document_id uuid,
  matched_document_name text,
  completed_at timestamptz,
  completed_by uuid,
  completed_by_name text,
  notes text,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_active() then
    raise exception 'Your account is not authorized to view required documents.';
  end if;

  return query
  select
    item.id,
    item.tax_return_id,
    item.template_id,
    item.name,
    item.description,
    item.category,
    item.is_required,
    item.is_complete,
    item.matched_document_id,
    document.original_file_name as matched_document_name,
    item.completed_at,
    item.completed_by,
    coalesce(
      completed_profile.display_name,
      trim(
        concat_ws(
          ' ',
          completed_profile.first_name,
          completed_profile.last_name
        )
      ),
      completed_profile.email
    ) as completed_by_name,
    item.notes,
    item.sort_order,
    item.created_at,
    item.updated_at
  from public.return_required_documents as item
  left join public.client_documents as document
    on document.id = item.matched_document_id
  left join public.profiles as completed_profile
    on completed_profile.id = item.completed_by
  where item.tax_return_id = requested_return_id
  order by
    item.is_required desc,
    item.sort_order,
    item.name;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: complete_required_document
-- ---------------------------------------------------------------------------

create or replace function public.complete_required_document(
  requested_required_document_id uuid,
  requested_document_id uuid default null,
  requested_is_complete boolean default true,
  requested_notes text default null
)
returns table (
  id uuid,
  tax_return_id uuid,
  template_id uuid,
  name text,
  description text,
  category text,
  is_required boolean,
  is_complete boolean,
  matched_document_id uuid,
  completed_at timestamptz,
  completed_by uuid,
  notes text,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_item public.return_required_documents%rowtype;
  selected_document public.client_documents%rowtype;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to update required documents.';
  end if;

  select *
  into selected_item
  from public.return_required_documents
  where return_required_documents.id =
    requested_required_document_id;

  if not found then
    raise exception 'Required document item not found.';
  end if;

  if requested_document_id is not null then
    select *
    into selected_document
    from public.client_documents
    where client_documents.id = requested_document_id;

    if not found then
      raise exception 'Uploaded document not found.';
    end if;

    if selected_document.tax_return_id is distinct from
      selected_item.tax_return_id then
      raise exception
        'The uploaded document does not belong to this tax return.';
    end if;

    if selected_document.status = 'archived' then
      raise exception
        'An archived document cannot satisfy a required document.';
    end if;
  end if;

  update public.return_required_documents
  set
    is_complete = requested_is_complete,
    matched_document_id = case
      when requested_is_complete then requested_document_id
      else null
    end,
    completed_at = case
      when requested_is_complete then now()
      else null
    end,
    completed_by = case
      when requested_is_complete then auth.uid()
      else null
    end,
    notes = nullif(trim(requested_notes), ''),
    updated_by = auth.uid()
  where return_required_documents.id =
    requested_required_document_id;

  return query
  select
    item.id,
    item.tax_return_id,
    item.template_id,
    item.name,
    item.description,
    item.category,
    item.is_required,
    item.is_complete,
    item.matched_document_id,
    item.completed_at,
    item.completed_by,
    item.notes,
    item.sort_order,
    item.created_at,
    item.updated_at
  from public.return_required_documents as item
  where item.id = requested_required_document_id;
end;
$$;

grant execute on function
  public.initialize_required_documents(uuid)
to authenticated;

grant execute on function
  public.list_required_documents(uuid)
to authenticated;

grant execute on function
  public.complete_required_document(uuid, uuid, boolean, text)
to authenticated;

-- ---------------------------------------------------------------------------
-- Initial templates
-- ---------------------------------------------------------------------------

insert into public.required_document_templates (
  name,
  description,
  category,
  return_type,
  tax_form,
  is_required,
  sort_order,
  matching_keywords
)
values
  (
    'Government-issued photo identification',
    'Driver license, state identification card, or passport.',
    'identity',
    'individual',
    '1040',
    true,
    10,
    array[
      'driver license',
      'drivers license',
      'state id',
      'passport',
      'photo id'
    ]
  ),
  (
    'Social Security cards',
    'Social Security cards for the taxpayer, spouse, and dependents as applicable.',
    'identity',
    'individual',
    '1040',
    true,
    20,
    array[
      'social security',
      'ss card',
      'social security card'
    ]
  ),
  (
    'Prior-year tax return',
    'A complete copy of the prior-year federal and state tax returns.',
    'prior_return',
    'individual',
    '1040',
    true,
    30,
    array[
      'prior return',
      'previous return',
      'last year return',
      '2025 return'
    ]
  ),
  (
    'W-2 wage statements',
    'All Forms W-2 received for the tax year.',
    'income',
    'individual',
    '1040',
    true,
    40,
    array[
      'w2',
      'w-2',
      'wage statement'
    ]
  ),
  (
    '1099 income statements',
    'All applicable Forms 1099, including 1099-INT, 1099-DIV, 1099-R, and 1099-NEC.',
    'income',
    'individual',
    '1040',
    true,
    50,
    array[
      '1099',
      '1099 int',
      '1099 div',
      '1099 r',
      '1099 nec',
      '1099 misc'
    ]
  ),
  (
    'Health insurance documentation',
    'Forms 1095-A or other marketplace insurance documentation when applicable.',
    'deductions',
    'individual',
    '1040',
    false,
    60,
    array[
      '1095a',
      '1095-a',
      'health insurance',
      'marketplace'
    ]
  ),
  (
    'Business income and expense records',
    'Income statements, expense summaries, receipts, and mileage records.',
    'business',
    'business',
    null,
    true,
    10,
    array[
      'profit loss',
      'income statement',
      'expenses',
      'receipts',
      'mileage'
    ]
  ),
  (
    'Prior-year business tax return',
    'A complete copy of the prior-year business return.',
    'prior_return',
    'business',
    null,
    true,
    20,
    array[
      'prior return',
      'previous return',
      'business return'
    ]
  ),
  (
    'IRS or state correspondence',
    'Any notices or letters related to the filing being prepared.',
    'irs_notice',
    null,
    null,
    false,
    900,
    array[
      'irs notice',
      'irs letter',
      'state notice',
      'tax notice'
    ]
  )
on conflict (
  name,
  return_type,
  tax_form
)
do update
set
  description = excluded.description,
  category = excluded.category,
  is_required = excluded.is_required,
  is_active = true,
  sort_order = excluded.sort_order,
  matching_keywords = excluded.matching_keywords,
  updated_at = now();

commit;
