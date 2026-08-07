-- ==========================================================
-- Smith Enterprises Tax Management
-- Advanced Income Client RPCs
-- Forms 1099-INT and 1099-DIV
--
-- Security model mirrors the existing W-2 client RPCs:
--   - Requires auth.uid()
--   - Resolves the active client through client_portal_profiles
--   - Confirms the organizer belongs to that client
--   - Confirms the income source belongs to the organizer
--   - Confirms the matching income type
--   - Blocks edits after organizer submission/review/approval
-- ==========================================================

begin;

-- ==========================================================
-- GET 1099-INT
-- ==========================================================

create or replace function
public.get_client_organizer_income_1099_int_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid
)
returns table (
  income_source_id uuid,
  payer_identification_number text,
  interest_income numeric,
  early_withdrawal_penalty numeric,
  interest_on_us_savings_bonds_and_treasury_obligations numeric,
  federal_income_tax_withheld numeric,
  investment_expenses numeric,
  foreign_tax_paid numeric,
  foreign_country_or_us_possession text,
  tax_exempt_interest numeric,
  specified_private_activity_bond_interest numeric,
  market_discount numeric,
  bond_premium numeric,
  bond_premium_on_treasury_obligations numeric,
  bond_premium_on_tax_exempt_bond numeric,
  state_code text,
  state_identification_number text,
  state_tax_withheld numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_int'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested 1099-INT income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

    details.payer_identification_number,
    details.interest_income,
    details.early_withdrawal_penalty,
    details.interest_on_us_savings_bonds_and_treasury_obligations,
    details.federal_income_tax_withheld,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.tax_exempt_interest,
    details.specified_private_activity_bond_interest,
    details.market_discount,
    details.bond_premium,
    details.bond_premium_on_treasury_obligations,
    details.bond_premium_on_tax_exempt_bond,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from (
    select
      stored.payer_identification_number,
      stored.interest_income,
      stored.early_withdrawal_penalty,
      stored.interest_on_us_savings_bonds_and_treasury_obligations,
      stored.federal_income_tax_withheld,
      stored.investment_expenses,
      stored.foreign_tax_paid,
      stored.foreign_country_or_us_possession,
      stored.tax_exempt_interest,
      stored.specified_private_activity_bond_interest,
      stored.market_discount,
      stored.bond_premium,
      stored.bond_premium_on_treasury_obligations,
      stored.bond_premium_on_tax_exempt_bond,
      stored.state_code,
      stored.state_identification_number,
      stored.state_tax_withheld,
      stored.created_at,
      stored.updated_at
    from public.client_tax_organizer_income_1099_int_details
      as stored
    where stored.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::text,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_1099_int_details
        as existing
      where existing.income_source_id =
        requested_income_source_id
    )
  ) as details

  limit 1;
end;
$function$;

-- ==========================================================
-- SAVE 1099-INT
-- ==========================================================

create or replace function
public.save_client_organizer_income_1099_int_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid,
  requested_payer_identification_number text,
  requested_interest_income numeric,
  requested_early_withdrawal_penalty numeric,
  requested_interest_on_us_savings_bonds_and_treasury_obligations numeric,
  requested_federal_income_tax_withheld numeric,
  requested_investment_expenses numeric,
  requested_foreign_tax_paid numeric,
  requested_foreign_country_or_us_possession text,
  requested_tax_exempt_interest numeric,
  requested_specified_private_activity_bond_interest numeric,
  requested_market_discount numeric,
  requested_bond_premium numeric,
  requested_bond_premium_on_treasury_obligations numeric,
  requested_bond_premium_on_tax_exempt_bond numeric,
  requested_state_code text,
  requested_state_identification_number text,
  requested_state_tax_withheld numeric,
  requested_document_received boolean
)
returns table (
  income_source_id uuid,
  organizer_id uuid,
  income_type text,
  payer_name text,
  recipient_type text,
  record_status text,
  document_received boolean,
  notes text,
  display_order integer,
  income_created_at timestamptz,
  income_updated_at timestamptz,
  payer_identification_number text,
  interest_income numeric,
  early_withdrawal_penalty numeric,
  interest_on_us_savings_bonds_and_treasury_obligations numeric,
  federal_income_tax_withheld numeric,
  investment_expenses numeric,
  foreign_tax_paid numeric,
  foreign_country_or_us_possession text,
  tax_exempt_interest numeric,
  specified_private_activity_bond_interest numeric,
  market_discount numeric,
  bond_premium numeric,
  bond_premium_on_treasury_obligations numeric,
  bond_premium_on_tax_exempt_bond numeric,
  state_code text,
  state_identification_number text,
  state_tax_withheld numeric,
  details_created_at timestamptz,
  details_updated_at timestamptz
)
language plpgsql
security definer
set search_path = 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_int'
  ) then
    raise exception
      'The requested 1099-INT income source was not found.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(trim(requested_state_code))
      !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_payer_identification_number is not null
    and trim(requested_payer_identification_number) <> ''
    and trim(requested_payer_identification_number)
      !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The payer identification number is invalid.';
  end if;

  if requested_interest_income is not null
    and requested_interest_income < 0
  then
    raise exception
      'Interest income cannot be negative.';
  end if;

  if requested_early_withdrawal_penalty is not null
    and requested_early_withdrawal_penalty < 0
  then
    raise exception
      'Early withdrawal penalty cannot be negative.';
  end if;

  if requested_interest_on_us_savings_bonds_and_treasury_obligations is not null
    and requested_interest_on_us_savings_bonds_and_treasury_obligations < 0
  then
    raise exception
      'U.S. Savings Bond and Treasury interest cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_investment_expenses is not null
    and requested_investment_expenses < 0
  then
    raise exception
      'Investment expenses cannot be negative.';
  end if;

  if requested_foreign_tax_paid is not null
    and requested_foreign_tax_paid < 0
  then
    raise exception
      'Foreign tax paid cannot be negative.';
  end if;

  if requested_tax_exempt_interest is not null
    and requested_tax_exempt_interest < 0
  then
    raise exception
      'Tax-exempt interest cannot be negative.';
  end if;

  if requested_specified_private_activity_bond_interest is not null
    and requested_specified_private_activity_bond_interest < 0
  then
    raise exception
      'Private activity bond interest cannot be negative.';
  end if;

  if requested_market_discount is not null
    and requested_market_discount < 0
  then
    raise exception
      'Market discount cannot be negative.';
  end if;

  if requested_bond_premium is not null
    and requested_bond_premium < 0
  then
    raise exception
      'Bond premium cannot be negative.';
  end if;

  if requested_bond_premium_on_treasury_obligations is not null
    and requested_bond_premium_on_treasury_obligations < 0
  then
    raise exception
      'Treasury bond premium cannot be negative.';
  end if;

  if requested_bond_premium_on_tax_exempt_bond is not null
    and requested_bond_premium_on_tax_exempt_bond < 0
  then
    raise exception
      'Tax-exempt bond premium cannot be negative.';
  end if;

  if requested_state_tax_withheld is not null
    and requested_state_tax_withheld < 0
  then
    raise exception
      'State tax withheld cannot be negative.';
  end if;

  current_saved_at := now();

  insert into
    public.client_tax_organizer_income_1099_int_details (
      income_source_id,
      payer_identification_number,
      interest_income,
      early_withdrawal_penalty,
      interest_on_us_savings_bonds_and_treasury_obligations,
      federal_income_tax_withheld,
      investment_expenses,
      foreign_tax_paid,
      foreign_country_or_us_possession,
      tax_exempt_interest,
      specified_private_activity_bond_interest,
      market_discount,
      bond_premium,
      bond_premium_on_treasury_obligations,
      bond_premium_on_tax_exempt_bond,
      state_code,
      state_identification_number,
      state_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,
    nullif(trim(requested_payer_identification_number), ''),
    requested_interest_income,
    requested_early_withdrawal_penalty,
    requested_interest_on_us_savings_bonds_and_treasury_obligations,
    requested_federal_income_tax_withheld,
    requested_investment_expenses,
    requested_foreign_tax_paid,
    nullif(trim(requested_foreign_country_or_us_possession), ''),
    requested_tax_exempt_interest,
    requested_specified_private_activity_bond_interest,
    requested_market_discount,
    requested_bond_premium,
    requested_bond_premium_on_treasury_obligations,
    requested_bond_premium_on_tax_exempt_bond,
    nullif(upper(trim(requested_state_code)), ''),
    nullif(trim(requested_state_identification_number), ''),
    requested_state_tax_withheld,
    current_saved_at,
    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_1099_int_details_pkey
  do update
  set
    payer_identification_number =
      excluded.payer_identification_number,
    interest_income =
      excluded.interest_income,
    early_withdrawal_penalty =
      excluded.early_withdrawal_penalty,
    interest_on_us_savings_bonds_and_treasury_obligations =
      excluded.interest_on_us_savings_bonds_and_treasury_obligations,
    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,
    investment_expenses =
      excluded.investment_expenses,
    foreign_tax_paid =
      excluded.foreign_tax_paid,
    foreign_country_or_us_possession =
      excluded.foreign_country_or_us_possession,
    tax_exempt_interest =
      excluded.tax_exempt_interest,
    specified_private_activity_bond_interest =
      excluded.specified_private_activity_bond_interest,
    market_discount =
      excluded.market_discount,
    bond_premium =
      excluded.bond_premium,
    bond_premium_on_treasury_obligations =
      excluded.bond_premium_on_treasury_obligations,
    bond_premium_on_tax_exempt_bond =
      excluded.bond_premium_on_tax_exempt_bond,
    state_code =
      excluded.state_code,
    state_identification_number =
      excluded.state_identification_number,
    state_tax_withheld =
      excluded.state_tax_withheld,
    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_interest_income is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,
    income_source.organizer_id,
    income_source.income_type,
    income_source.payer_name,
    income_source.recipient_type,
    income_source.record_status,
    income_source.document_received,
    income_source.notes,
    income_source.display_order,
    income_source.created_at,
    income_source.updated_at,
    details.payer_identification_number,
    details.interest_income,
    details.early_withdrawal_penalty,
    details.interest_on_us_savings_bonds_and_treasury_obligations,
    details.federal_income_tax_withheld,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.tax_exempt_interest,
    details.specified_private_activity_bond_interest,
    details.market_discount,
    details.bond_premium,
    details.bond_premium_on_treasury_obligations,
    details.bond_premium_on_tax_exempt_bond,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_1099_int_details
    as details
    on details.income_source_id =
      income_source.id

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$function$;

-- ==========================================================
-- GET 1099-DIV
-- ==========================================================

create or replace function
public.get_client_organizer_income_1099_div_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid
)
returns table (
  income_source_id uuid,
  payer_identification_number text,
  total_ordinary_dividends numeric,
  qualified_dividends numeric,
  total_capital_gain_distributions numeric,
  unrecaptured_section_1250_gain numeric,
  section_1202_gain numeric,
  collectibles_28_percent_rate_gain numeric,
  section_897_ordinary_dividends numeric,
  section_897_capital_gain numeric,
  nondividend_distributions numeric,
  federal_income_tax_withheld numeric,
  section_199a_dividends numeric,
  investment_expenses numeric,
  foreign_tax_paid numeric,
  foreign_country_or_us_possession text,
  exempt_interest_dividends numeric,
  specified_private_activity_bond_interest_dividends numeric,
  state_code text,
  state_identification_number text,
  state_tax_withheld numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_div'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested 1099-DIV income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

    details.payer_identification_number,
    details.total_ordinary_dividends,
    details.qualified_dividends,
    details.total_capital_gain_distributions,
    details.unrecaptured_section_1250_gain,
    details.section_1202_gain,
    details.collectibles_28_percent_rate_gain,
    details.section_897_ordinary_dividends,
    details.section_897_capital_gain,
    details.nondividend_distributions,
    details.federal_income_tax_withheld,
    details.section_199a_dividends,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.exempt_interest_dividends,
    details.specified_private_activity_bond_interest_dividends,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from (
    select
      stored.payer_identification_number,
      stored.total_ordinary_dividends,
      stored.qualified_dividends,
      stored.total_capital_gain_distributions,
      stored.unrecaptured_section_1250_gain,
      stored.section_1202_gain,
      stored.collectibles_28_percent_rate_gain,
      stored.section_897_ordinary_dividends,
      stored.section_897_capital_gain,
      stored.nondividend_distributions,
      stored.federal_income_tax_withheld,
      stored.section_199a_dividends,
      stored.investment_expenses,
      stored.foreign_tax_paid,
      stored.foreign_country_or_us_possession,
      stored.exempt_interest_dividends,
      stored.specified_private_activity_bond_interest_dividends,
      stored.state_code,
      stored.state_identification_number,
      stored.state_tax_withheld,
      stored.created_at,
      stored.updated_at
    from public.client_tax_organizer_income_1099_div_details
      as stored
    where stored.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::text,
      null::text,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_1099_div_details
        as existing
      where existing.income_source_id =
        requested_income_source_id
    )
  ) as details

  limit 1;
end;
$function$;

-- ==========================================================
-- SAVE 1099-DIV
-- ==========================================================

create or replace function
public.save_client_organizer_income_1099_div_details(
  requested_organizer_id uuid,
  requested_income_source_id uuid,
  requested_payer_identification_number text,
  requested_total_ordinary_dividends numeric,
  requested_qualified_dividends numeric,
  requested_total_capital_gain_distributions numeric,
  requested_unrecaptured_section_1250_gain numeric,
  requested_section_1202_gain numeric,
  requested_collectibles_28_percent_rate_gain numeric,
  requested_section_897_ordinary_dividends numeric,
  requested_section_897_capital_gain numeric,
  requested_nondividend_distributions numeric,
  requested_federal_income_tax_withheld numeric,
  requested_section_199a_dividends numeric,
  requested_investment_expenses numeric,
  requested_foreign_tax_paid numeric,
  requested_foreign_country_or_us_possession text,
  requested_exempt_interest_dividends numeric,
  requested_specified_private_activity_bond_interest_dividends numeric,
  requested_state_code text,
  requested_state_identification_number text,
  requested_state_tax_withheld numeric,
  requested_document_received boolean
)
returns table (
  income_source_id uuid,
  organizer_id uuid,
  income_type text,
  payer_name text,
  recipient_type text,
  record_status text,
  document_received boolean,
  notes text,
  display_order integer,
  income_created_at timestamptz,
  income_updated_at timestamptz,
  payer_identification_number text,
  total_ordinary_dividends numeric,
  qualified_dividends numeric,
  total_capital_gain_distributions numeric,
  unrecaptured_section_1250_gain numeric,
  section_1202_gain numeric,
  collectibles_28_percent_rate_gain numeric,
  section_897_ordinary_dividends numeric,
  section_897_capital_gain numeric,
  nondividend_distributions numeric,
  federal_income_tax_withheld numeric,
  section_199a_dividends numeric,
  investment_expenses numeric,
  foreign_tax_paid numeric,
  foreign_country_or_us_possession text,
  exempt_interest_dividends numeric,
  specified_private_activity_bond_interest_dividends numeric,
  state_code text,
  state_identification_number text,
  state_tax_withheld numeric,
  details_created_at timestamptz,
  details_updated_at timestamptz
)
language plpgsql
security definer
set search_path = 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_div'
  ) then
    raise exception
      'The requested 1099-DIV income source was not found.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(trim(requested_state_code))
      !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_payer_identification_number is not null
    and trim(requested_payer_identification_number) <> ''
    and trim(requested_payer_identification_number)
      !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The payer identification number is invalid.';
  end if;

  if requested_total_ordinary_dividends is not null
    and requested_total_ordinary_dividends < 0
  then
    raise exception
      'Ordinary dividends cannot be negative.';
  end if;

  if requested_qualified_dividends is not null
    and requested_qualified_dividends < 0
  then
    raise exception
      'Qualified dividends cannot be negative.';
  end if;

  if requested_total_capital_gain_distributions is not null
    and requested_total_capital_gain_distributions < 0
  then
    raise exception
      'Capital gain distributions cannot be negative.';
  end if;

  if requested_unrecaptured_section_1250_gain is not null
    and requested_unrecaptured_section_1250_gain < 0
  then
    raise exception
      'Unrecaptured Section 1250 gain cannot be negative.';
  end if;

  if requested_section_1202_gain is not null
    and requested_section_1202_gain < 0
  then
    raise exception
      'Section 1202 gain cannot be negative.';
  end if;

  if requested_collectibles_28_percent_rate_gain is not null
    and requested_collectibles_28_percent_rate_gain < 0
  then
    raise exception
      'Collectibles gain cannot be negative.';
  end if;

  if requested_section_897_ordinary_dividends is not null
    and requested_section_897_ordinary_dividends < 0
  then
    raise exception
      'Section 897 ordinary dividends cannot be negative.';
  end if;

  if requested_section_897_capital_gain is not null
    and requested_section_897_capital_gain < 0
  then
    raise exception
      'Section 897 capital gain cannot be negative.';
  end if;

  if requested_nondividend_distributions is not null
    and requested_nondividend_distributions < 0
  then
    raise exception
      'Nondividend distributions cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_section_199a_dividends is not null
    and requested_section_199a_dividends < 0
  then
    raise exception
      'Section 199A dividends cannot be negative.';
  end if;

  if requested_investment_expenses is not null
    and requested_investment_expenses < 0
  then
    raise exception
      'Investment expenses cannot be negative.';
  end if;

  if requested_foreign_tax_paid is not null
    and requested_foreign_tax_paid < 0
  then
    raise exception
      'Foreign tax paid cannot be negative.';
  end if;

  if requested_exempt_interest_dividends is not null
    and requested_exempt_interest_dividends < 0
  then
    raise exception
      'Exempt-interest dividends cannot be negative.';
  end if;

  if requested_specified_private_activity_bond_interest_dividends is not null
    and requested_specified_private_activity_bond_interest_dividends < 0
  then
    raise exception
      'Private activity bond interest dividends cannot be negative.';
  end if;

  if requested_state_tax_withheld is not null
    and requested_state_tax_withheld < 0
  then
    raise exception
      'State tax withheld cannot be negative.';
  end if;

  current_saved_at := now();

  insert into
    public.client_tax_organizer_income_1099_div_details (
      income_source_id,
      payer_identification_number,
      total_ordinary_dividends,
      qualified_dividends,
      total_capital_gain_distributions,
      unrecaptured_section_1250_gain,
      section_1202_gain,
      collectibles_28_percent_rate_gain,
      section_897_ordinary_dividends,
      section_897_capital_gain,
      nondividend_distributions,
      federal_income_tax_withheld,
      section_199a_dividends,
      investment_expenses,
      foreign_tax_paid,
      foreign_country_or_us_possession,
      exempt_interest_dividends,
      specified_private_activity_bond_interest_dividends,
      state_code,
      state_identification_number,
      state_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,
    nullif(trim(requested_payer_identification_number), ''),
    requested_total_ordinary_dividends,
    requested_qualified_dividends,
    requested_total_capital_gain_distributions,
    requested_unrecaptured_section_1250_gain,
    requested_section_1202_gain,
    requested_collectibles_28_percent_rate_gain,
    requested_section_897_ordinary_dividends,
    requested_section_897_capital_gain,
    requested_nondividend_distributions,
    requested_federal_income_tax_withheld,
    requested_section_199a_dividends,
    requested_investment_expenses,
    requested_foreign_tax_paid,
    nullif(trim(requested_foreign_country_or_us_possession), ''),
    requested_exempt_interest_dividends,
    requested_specified_private_activity_bond_interest_dividends,
    nullif(upper(trim(requested_state_code)), ''),
    nullif(trim(requested_state_identification_number), ''),
    requested_state_tax_withheld,
    current_saved_at,
    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_1099_div_details_pkey
  do update
  set
    payer_identification_number =
      excluded.payer_identification_number,
    total_ordinary_dividends =
      excluded.total_ordinary_dividends,
    qualified_dividends =
      excluded.qualified_dividends,
    total_capital_gain_distributions =
      excluded.total_capital_gain_distributions,
    unrecaptured_section_1250_gain =
      excluded.unrecaptured_section_1250_gain,
    section_1202_gain =
      excluded.section_1202_gain,
    collectibles_28_percent_rate_gain =
      excluded.collectibles_28_percent_rate_gain,
    section_897_ordinary_dividends =
      excluded.section_897_ordinary_dividends,
    section_897_capital_gain =
      excluded.section_897_capital_gain,
    nondividend_distributions =
      excluded.nondividend_distributions,
    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,
    section_199a_dividends =
      excluded.section_199a_dividends,
    investment_expenses =
      excluded.investment_expenses,
    foreign_tax_paid =
      excluded.foreign_tax_paid,
    foreign_country_or_us_possession =
      excluded.foreign_country_or_us_possession,
    exempt_interest_dividends =
      excluded.exempt_interest_dividends,
    specified_private_activity_bond_interest_dividends =
      excluded.specified_private_activity_bond_interest_dividends,
    state_code =
      excluded.state_code,
    state_identification_number =
      excluded.state_identification_number,
    state_tax_withheld =
      excluded.state_tax_withheld,
    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_total_ordinary_dividends is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,
    income_source.organizer_id,
    income_source.income_type,
    income_source.payer_name,
    income_source.recipient_type,
    income_source.record_status,
    income_source.document_received,
    income_source.notes,
    income_source.display_order,
    income_source.created_at,
    income_source.updated_at,
    details.payer_identification_number,
    details.total_ordinary_dividends,
    details.qualified_dividends,
    details.total_capital_gain_distributions,
    details.unrecaptured_section_1250_gain,
    details.section_1202_gain,
    details.collectibles_28_percent_rate_gain,
    details.section_897_ordinary_dividends,
    details.section_897_capital_gain,
    details.nondividend_distributions,
    details.federal_income_tax_withheld,
    details.section_199a_dividends,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.exempt_interest_dividends,
    details.specified_private_activity_bond_interest_dividends,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_1099_div_details
    as details
    on details.income_source_id =
      income_source.id

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$function$;

-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function
public.get_client_organizer_income_1099_int_details(
  uuid,
  uuid
)
from public;

revoke all
on function
public.get_client_organizer_income_1099_int_details(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.get_client_organizer_income_1099_int_details(
  uuid,
  uuid
)
to authenticated;

revoke all
on function
public.save_client_organizer_income_1099_int_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
from public;

revoke all
on function
public.save_client_organizer_income_1099_int_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
from anon;

grant execute
on function
public.save_client_organizer_income_1099_int_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
to authenticated;

revoke all
on function
public.get_client_organizer_income_1099_div_details(
  uuid,
  uuid
)
from public;

revoke all
on function
public.get_client_organizer_income_1099_div_details(
  uuid,
  uuid
)
from anon;

grant execute
on function
public.get_client_organizer_income_1099_div_details(
  uuid,
  uuid
)
to authenticated;

revoke all
on function
public.save_client_organizer_income_1099_div_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
from public;

revoke all
on function
public.save_client_organizer_income_1099_div_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
from anon;

grant execute
on function
public.save_client_organizer_income_1099_div_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
to authenticated;

comment on function
public.get_client_organizer_income_1099_int_details(
  uuid,
  uuid
)
is
'Returns Form 1099-INT detail values for an income source owned by the authenticated active client portal user.';

comment on function
public.save_client_organizer_income_1099_int_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
is
'Creates or updates Form 1099-INT detail values for an income source owned by the authenticated active client portal user.';

comment on function
public.get_client_organizer_income_1099_div_details(
  uuid,
  uuid
)
is
'Returns Form 1099-DIV detail values for an income source owned by the authenticated active client portal user.';

comment on function
public.save_client_organizer_income_1099_div_details(
  uuid,
  uuid,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  numeric,
  numeric,
  text,
  text,
  numeric,
  boolean
)
is
'Creates or updates Form 1099-DIV detail values for an income source owned by the authenticated active client portal user.';

commit;