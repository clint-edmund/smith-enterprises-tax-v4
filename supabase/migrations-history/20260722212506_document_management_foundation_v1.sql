-- Phase 10.6.3D.7.1A
-- Document Management Foundation:
-- document catalog + tax package templates
--
-- This migration intentionally does not create client document records yet.
-- It establishes the reusable catalog and return-type templates first.

create extension if not exists pgcrypto;

create table if not exists public.document_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  category text not null default 'other',
  default_required boolean not null default false,
  supports_multiple boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint document_types_code_not_blank
    check (length(trim(code)) > 0),

  constraint document_types_name_not_blank
    check (length(trim(name)) > 0),

  constraint document_types_category_valid
    check (
      category in (
        'identity',
        'income',
        'deduction',
        'business',
        'investment',
        'retirement',
        'prior_year',
        'organizer',
        'signature',
        'other'
      )
    ),

  constraint document_types_sort_order_nonnegative
    check (sort_order >= 0)
);

create table if not exists public.tax_package_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  return_form text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tax_package_templates_code_not_blank
    check (length(trim(code)) > 0),

  constraint tax_package_templates_name_not_blank
    check (length(trim(name)) > 0),

  constraint tax_package_templates_return_form_not_blank
    check (length(trim(return_form)) > 0)
);

create table if not exists public.tax_package_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null
    references public.tax_package_templates(id)
    on delete cascade,
  document_type_id uuid not null
    references public.document_types(id)
    on delete restrict,
  requirement_level text not null default 'required',
  instructions text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tax_package_template_items_unique_document
    unique (template_id, document_type_id),

  constraint tax_package_template_items_requirement_valid
    check (
      requirement_level in (
        'required',
        'conditional',
        'optional'
      )
    ),

  constraint tax_package_template_items_sort_order_nonnegative
    check (sort_order >= 0)
);

create index if not exists document_types_active_sort_idx
  on public.document_types (
    is_active,
    sort_order,
    name
  );

create index if not exists tax_package_templates_form_active_idx
  on public.tax_package_templates (
    return_form,
    is_active
  );

create index if not exists tax_package_template_items_template_sort_idx
  on public.tax_package_template_items (
    template_id,
    sort_order
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_document_types_updated_at
  on public.document_types;

create trigger set_document_types_updated_at
before update on public.document_types
for each row
execute function public.set_updated_at();

drop trigger if exists set_tax_package_templates_updated_at
  on public.tax_package_templates;

create trigger set_tax_package_templates_updated_at
before update on public.tax_package_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_tax_package_template_items_updated_at
  on public.tax_package_template_items;

create trigger set_tax_package_template_items_updated_at
before update on public.tax_package_template_items
for each row
execute function public.set_updated_at();

alter table public.document_types
  enable row level security;

alter table public.tax_package_templates
  enable row level security;

alter table public.tax_package_template_items
  enable row level security;

drop policy if exists
  "Authenticated users can read document types"
  on public.document_types;

create policy
  "Authenticated users can read document types"
on public.document_types
for select
to authenticated
using (true);

drop policy if exists
  "Authenticated users can read tax package templates"
  on public.tax_package_templates;

create policy
  "Authenticated users can read tax package templates"
on public.tax_package_templates
for select
to authenticated
using (true);

drop policy if exists
  "Authenticated users can read tax package template items"
  on public.tax_package_template_items;

create policy
  "Authenticated users can read tax package template items"
on public.tax_package_template_items
for select
to authenticated
using (true);

insert into public.document_types (
  code,
  name,
  description,
  category,
  default_required,
  supports_multiple,
  sort_order
)
values
  (
    'driver_license',
    'Driver License',
    'Government-issued photo identification.',
    'identity',
    true,
    true,
    10
  ),
  (
    'social_security_card',
    'Social Security Card',
    'Social Security card for the taxpayer or dependent.',
    'identity',
    true,
    true,
    20
  ),
  (
    'prior_year_return',
    'Prior Year Tax Return',
    'Copy of the prior-year filed tax return.',
    'prior_year',
    true,
    false,
    30
  ),
  (
    'tax_organizer',
    'Tax Organizer',
    'Completed annual tax organizer.',
    'organizer',
    true,
    false,
    40
  ),
  (
    'w2',
    'Form W-2',
    'Wage and tax statement.',
    'income',
    false,
    true,
    100
  ),
  (
    '1099_int',
    'Form 1099-INT',
    'Interest income statement.',
    'income',
    false,
    true,
    110
  ),
  (
    '1099_div',
    'Form 1099-DIV',
    'Dividend income statement.',
    'income',
    false,
    true,
    120
  ),
  (
    '1099_b',
    'Form 1099-B',
    'Broker and barter exchange transaction statement.',
    'investment',
    false,
    true,
    130
  ),
  (
    '1099_r',
    'Form 1099-R',
    'Retirement distribution statement.',
    'retirement',
    false,
    true,
    140
  ),
  (
    'ssa_1099',
    'Form SSA-1099',
    'Social Security benefit statement.',
    'retirement',
    false,
    true,
    150
  ),
  (
    'k1',
    'Schedule K-1',
    'Partner, shareholder, or beneficiary income statement.',
    'business',
    false,
    true,
    160
  ),
  (
    'brokerage_statement',
    'Brokerage Statement',
    'Annual consolidated investment or brokerage statement.',
    'investment',
    false,
    true,
    170
  ),
  (
    'profit_and_loss',
    'Profit and Loss Statement',
    'Business income and expense statement.',
    'business',
    false,
    true,
    200
  ),
  (
    'balance_sheet',
    'Balance Sheet',
    'Business balance sheet.',
    'business',
    false,
    true,
    210
  ),
  (
    'bank_statements',
    'Bank Statements',
    'Business or entity bank statements.',
    'business',
    false,
    true,
    220
  ),
  (
    'payroll_reports',
    'Payroll Reports',
    'Annual or quarterly payroll reports.',
    'business',
    false,
    true,
    230
  ),
  (
    'trial_balance',
    'Trial Balance',
    'Entity trial balance.',
    'business',
    false,
    false,
    240
  ),
  (
    'fixed_asset_schedule',
    'Fixed Asset Schedule',
    'Current fixed asset and depreciation schedule.',
    'business',
    false,
    false,
    250
  ),
  (
    'shareholder_information',
    'Shareholder Information',
    'Current shareholder ownership and basis information.',
    'business',
    false,
    true,
    260
  )
on conflict (code)
do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  default_required = excluded.default_required,
  supports_multiple = excluded.supports_multiple,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.tax_package_templates (
  code,
  name,
  return_form,
  description
)
values
  (
    'individual_1040',
    '1040 Individual Tax Package',
    '1040',
    'Default document package for individual income tax returns.'
  ),
  (
    'partnership_1065',
    '1065 Partnership Tax Package',
    '1065',
    'Default document package for partnership returns.'
  ),
  (
    's_corporation_1120s',
    '1120-S Corporation Tax Package',
    '1120S',
    'Default document package for S corporation returns.'
  )
on conflict (code)
do update set
  name = excluded.name,
  return_form = excluded.return_form,
  description = excluded.description,
  is_active = true;

with template_items (
  template_code,
  document_code,
  requirement_level,
  instructions,
  sort_order
) as (
  values
    ('individual_1040', 'driver_license', 'required', null, 10),
    ('individual_1040', 'social_security_card', 'conditional', 'Required when identity information must be verified or updated.', 20),
    ('individual_1040', 'prior_year_return', 'required', null, 30),
    ('individual_1040', 'tax_organizer', 'required', null, 40),
    ('individual_1040', 'w2', 'conditional', 'Required when the client received wage income.', 100),
    ('individual_1040', '1099_int', 'conditional', 'Required when the client received interest income.', 110),
    ('individual_1040', '1099_div', 'conditional', 'Required when the client received dividend income.', 120),
    ('individual_1040', '1099_b', 'conditional', 'Required when the client sold investments.', 130),
    ('individual_1040', '1099_r', 'conditional', 'Required when the client received retirement distributions.', 140),
    ('individual_1040', 'ssa_1099', 'conditional', 'Required when the client received Social Security benefits.', 150),
    ('individual_1040', 'k1', 'conditional', 'Required when the client received partnership, S corporation, trust, or estate income.', 160),
    ('individual_1040', 'brokerage_statement', 'conditional', 'Required when the client maintained investment accounts.', 170),

    ('partnership_1065', 'prior_year_return', 'required', null, 10),
    ('partnership_1065', 'tax_organizer', 'required', null, 20),
    ('partnership_1065', 'profit_and_loss', 'required', null, 30),
    ('partnership_1065', 'balance_sheet', 'required', null, 40),
    ('partnership_1065', 'bank_statements', 'required', null, 50),
    ('partnership_1065', 'k1', 'conditional', 'Include K-1 documents received from other entities.', 60),
    ('partnership_1065', 'fixed_asset_schedule', 'conditional', 'Required when the partnership owns depreciable assets.', 70),

    ('s_corporation_1120s', 'prior_year_return', 'required', null, 10),
    ('s_corporation_1120s', 'tax_organizer', 'required', null, 20),
    ('s_corporation_1120s', 'trial_balance', 'required', null, 30),
    ('s_corporation_1120s', 'profit_and_loss', 'required', null, 40),
    ('s_corporation_1120s', 'balance_sheet', 'required', null, 50),
    ('s_corporation_1120s', 'payroll_reports', 'required', null, 60),
    ('s_corporation_1120s', 'shareholder_information', 'required', null, 70),
    ('s_corporation_1120s', 'fixed_asset_schedule', 'conditional', 'Required when the corporation owns depreciable assets.', 80)
)
insert into public.tax_package_template_items (
  template_id,
  document_type_id,
  requirement_level,
  instructions,
  sort_order
)
select
  template.id,
  document_type.id,
  template_items.requirement_level,
  template_items.instructions,
  template_items.sort_order
from template_items
join public.tax_package_templates template
  on template.code = template_items.template_code
join public.document_types document_type
  on document_type.code = template_items.document_code
on conflict (
  template_id,
  document_type_id
)
do update set
  requirement_level = excluded.requirement_level,
  instructions = excluded.instructions,
  sort_order = excluded.sort_order,
  updated_at = now();
