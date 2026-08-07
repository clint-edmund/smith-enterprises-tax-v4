-- ==========================================================
-- Smith Enterprises Tax Management
-- Advanced Income Foundation
-- Forms 1099-INT and 1099-DIV
--
-- Purpose:
--   Adds one-to-one detail tables for interest and dividend
--   income sources within the existing Income organizer section.
--
-- Security:
--   - Row-level security is enabled.
--   - No direct access is granted to anon or authenticated.
--   - Client and staff access will be provided through secured
--     RPCs in the next implementation package.
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- Form 1099-INT details
-- ----------------------------------------------------------

create table
public.client_tax_organizer_income_1099_int_details (
  income_source_id uuid primary key
    references public.client_tax_organizer_income_sources(id)
    on delete cascade,

  payer_identification_number text,

  interest_income numeric(14, 2),

  early_withdrawal_penalty numeric(14, 2),

  interest_on_us_savings_bonds_and_treasury_obligations
    numeric(14, 2),

  federal_income_tax_withheld numeric(14, 2),

  investment_expenses numeric(14, 2),

  foreign_tax_paid numeric(14, 2),

  foreign_country_or_us_possession text,

  tax_exempt_interest numeric(14, 2),

  specified_private_activity_bond_interest
    numeric(14, 2),

  market_discount numeric(14, 2),

  bond_premium numeric(14, 2),

  bond_premium_on_treasury_obligations
    numeric(14, 2),

  bond_premium_on_tax_exempt_bond
    numeric(14, 2),

  state_code text,

  state_identification_number text,

  state_tax_withheld numeric(14, 2),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint organizer_income_1099_int_payer_id_check
    check (
      payer_identification_number is null
      or length(trim(payer_identification_number))
        between 2 and 32
    ),

  constraint organizer_income_1099_int_foreign_country_check
    check (
      foreign_country_or_us_possession is null
      or length(trim(foreign_country_or_us_possession))
        between 2 and 100
    ),

  constraint organizer_income_1099_int_state_code_check
    check (
      state_code is null
      or state_code ~ '^[A-Z]{2}$'
    ),

  constraint organizer_income_1099_int_state_id_check
    check (
      state_identification_number is null
      or length(trim(state_identification_number))
        between 1 and 40
    ),

  constraint organizer_income_1099_int_interest_check
    check (
      interest_income is null
      or interest_income >= 0
    ),

  constraint organizer_income_1099_int_early_penalty_check
    check (
      early_withdrawal_penalty is null
      or early_withdrawal_penalty >= 0
    ),

  constraint organizer_income_1099_int_savings_bonds_check
    check (
      interest_on_us_savings_bonds_and_treasury_obligations
        is null
      or
      interest_on_us_savings_bonds_and_treasury_obligations
        >= 0
    ),

  constraint organizer_income_1099_int_federal_withholding_check
    check (
      federal_income_tax_withheld is null
      or federal_income_tax_withheld >= 0
    ),

  constraint organizer_income_1099_int_investment_expenses_check
    check (
      investment_expenses is null
      or investment_expenses >= 0
    ),

  constraint organizer_income_1099_int_foreign_tax_check
    check (
      foreign_tax_paid is null
      or foreign_tax_paid >= 0
    ),

  constraint organizer_income_1099_int_tax_exempt_check
    check (
      tax_exempt_interest is null
      or tax_exempt_interest >= 0
    ),

  constraint organizer_income_1099_int_private_activity_check
    check (
      specified_private_activity_bond_interest is null
      or specified_private_activity_bond_interest >= 0
    ),

  constraint organizer_income_1099_int_market_discount_check
    check (
      market_discount is null
      or market_discount >= 0
    ),

  constraint organizer_income_1099_int_bond_premium_check
    check (
      bond_premium is null
      or bond_premium >= 0
    ),

  constraint organizer_income_1099_int_treasury_premium_check
    check (
      bond_premium_on_treasury_obligations is null
      or bond_premium_on_treasury_obligations >= 0
    ),

  constraint organizer_income_1099_int_tax_exempt_premium_check
    check (
      bond_premium_on_tax_exempt_bond is null
      or bond_premium_on_tax_exempt_bond >= 0
    ),

  constraint organizer_income_1099_int_state_tax_check
    check (
      state_tax_withheld is null
      or state_tax_withheld >= 0
    )
);

create index
client_tax_organizer_income_1099_int_updated_index
on public.client_tax_organizer_income_1099_int_details(
  updated_at
);

create trigger
client_tax_organizer_income_1099_int_set_updated_at
before update
on public.client_tax_organizer_income_1099_int_details
for each row
execute function public.set_updated_at();

alter table
public.client_tax_organizer_income_1099_int_details
enable row level security;

-- ----------------------------------------------------------
-- Form 1099-DIV details
-- ----------------------------------------------------------

create table
public.client_tax_organizer_income_1099_div_details (
  income_source_id uuid primary key
    references public.client_tax_organizer_income_sources(id)
    on delete cascade,

  payer_identification_number text,

  total_ordinary_dividends numeric(14, 2),

  qualified_dividends numeric(14, 2),

  total_capital_gain_distributions numeric(14, 2),

  unrecaptured_section_1250_gain numeric(14, 2),

  section_1202_gain numeric(14, 2),

  collectibles_28_percent_rate_gain numeric(14, 2),

  section_897_ordinary_dividends numeric(14, 2),

  section_897_capital_gain numeric(14, 2),

  nondividend_distributions numeric(14, 2),

  federal_income_tax_withheld numeric(14, 2),

  section_199a_dividends numeric(14, 2),

  investment_expenses numeric(14, 2),

  foreign_tax_paid numeric(14, 2),

  foreign_country_or_us_possession text,

  exempt_interest_dividends numeric(14, 2),

  specified_private_activity_bond_interest_dividends
    numeric(14, 2),

  state_code text,

  state_identification_number text,

  state_tax_withheld numeric(14, 2),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint organizer_income_1099_div_payer_id_check
    check (
      payer_identification_number is null
      or length(trim(payer_identification_number))
        between 2 and 32
    ),

  constraint organizer_income_1099_div_foreign_country_check
    check (
      foreign_country_or_us_possession is null
      or length(trim(foreign_country_or_us_possession))
        between 2 and 100
    ),

  constraint organizer_income_1099_div_state_code_check
    check (
      state_code is null
      or state_code ~ '^[A-Z]{2}$'
    ),

  constraint organizer_income_1099_div_state_id_check
    check (
      state_identification_number is null
      or length(trim(state_identification_number))
        between 1 and 40
    ),

  constraint organizer_income_1099_div_ordinary_check
    check (
      total_ordinary_dividends is null
      or total_ordinary_dividends >= 0
    ),

  constraint organizer_income_1099_div_qualified_check
    check (
      qualified_dividends is null
      or qualified_dividends >= 0
    ),

  constraint organizer_income_1099_div_capital_gain_check
    check (
      total_capital_gain_distributions is null
      or total_capital_gain_distributions >= 0
    ),

  constraint organizer_income_1099_div_1250_check
    check (
      unrecaptured_section_1250_gain is null
      or unrecaptured_section_1250_gain >= 0
    ),

  constraint organizer_income_1099_div_1202_check
    check (
      section_1202_gain is null
      or section_1202_gain >= 0
    ),

  constraint organizer_income_1099_div_collectibles_check
    check (
      collectibles_28_percent_rate_gain is null
      or collectibles_28_percent_rate_gain >= 0
    ),

  constraint organizer_income_1099_div_897_ordinary_check
    check (
      section_897_ordinary_dividends is null
      or section_897_ordinary_dividends >= 0
    ),

  constraint organizer_income_1099_div_897_capital_check
    check (
      section_897_capital_gain is null
      or section_897_capital_gain >= 0
    ),

  constraint organizer_income_1099_div_nondividend_check
    check (
      nondividend_distributions is null
      or nondividend_distributions >= 0
    ),

  constraint organizer_income_1099_div_federal_withholding_check
    check (
      federal_income_tax_withheld is null
      or federal_income_tax_withheld >= 0
    ),

  constraint organizer_income_1099_div_199a_check
    check (
      section_199a_dividends is null
      or section_199a_dividends >= 0
    ),

  constraint organizer_income_1099_div_investment_expenses_check
    check (
      investment_expenses is null
      or investment_expenses >= 0
    ),

  constraint organizer_income_1099_div_foreign_tax_check
    check (
      foreign_tax_paid is null
      or foreign_tax_paid >= 0
    ),

  constraint organizer_income_1099_div_exempt_interest_check
    check (
      exempt_interest_dividends is null
      or exempt_interest_dividends >= 0
    ),

  constraint organizer_income_1099_div_private_activity_check
    check (
      specified_private_activity_bond_interest_dividends
        is null
      or
      specified_private_activity_bond_interest_dividends
        >= 0
    ),

  constraint organizer_income_1099_div_state_tax_check
    check (
      state_tax_withheld is null
      or state_tax_withheld >= 0
    )
);

create index
client_tax_organizer_income_1099_div_updated_index
on public.client_tax_organizer_income_1099_div_details(
  updated_at
);

create trigger
client_tax_organizer_income_1099_div_set_updated_at
before update
on public.client_tax_organizer_income_1099_div_details
for each row
execute function public.set_updated_at();

alter table
public.client_tax_organizer_income_1099_div_details
enable row level security;

-- ----------------------------------------------------------
-- Enforce matching parent income types
-- ----------------------------------------------------------

create or replace function
public.validate_organizer_income_1099_int_source()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income
    where income.id =
      new.income_source_id
      and income.income_type =
        '1099_int'
  ) then
    raise exception
      'Form 1099-INT details require a 1099-INT income source.';
  end if;

  return new;
end;
$function$;

create trigger
client_tax_organizer_income_1099_int_validate_source
before insert or update of income_source_id
on public.client_tax_organizer_income_1099_int_details
for each row
execute function
public.validate_organizer_income_1099_int_source();

create or replace function
public.validate_organizer_income_1099_div_source()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income
    where income.id =
      new.income_source_id
      and income.income_type =
        '1099_div'
  ) then
    raise exception
      'Form 1099-DIV details require a 1099-DIV income source.';
  end if;

  return new;
end;
$function$;

create trigger
client_tax_organizer_income_1099_div_validate_source
before insert or update of income_source_id
on public.client_tax_organizer_income_1099_div_details
for each row
execute function
public.validate_organizer_income_1099_div_source();

-- ----------------------------------------------------------
-- Lock down direct table and helper-function access
-- ----------------------------------------------------------

revoke all
on table
public.client_tax_organizer_income_1099_int_details
from public;

revoke all
on table
public.client_tax_organizer_income_1099_int_details
from anon;

revoke all
on table
public.client_tax_organizer_income_1099_int_details
from authenticated;

revoke all
on table
public.client_tax_organizer_income_1099_div_details
from public;

revoke all
on table
public.client_tax_organizer_income_1099_div_details
from anon;

revoke all
on table
public.client_tax_organizer_income_1099_div_details
from authenticated;

revoke all
on function
public.validate_organizer_income_1099_int_source()
from public;

revoke all
on function
public.validate_organizer_income_1099_div_source()
from public;

comment on table
public.client_tax_organizer_income_1099_int_details
is
'One-to-one Form 1099-INT detail records associated with organizer income sources whose income_type is 1099_int.';

comment on table
public.client_tax_organizer_income_1099_div_details
is
'One-to-one Form 1099-DIV detail records associated with organizer income sources whose income_type is 1099_div.';

commit;