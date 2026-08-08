-- ============================================================
-- Atlas
-- Required Document Template Catalog v1
--
-- Provides the production reference catalog used by
-- initialize_required_documents().
--
-- This migration is intentionally idempotent.
-- ============================================================

with template_seed (
  name,
  description,
  category,
  return_type,
  tax_form,
  is_required,
  sort_order,
  matching_keywords
) as (
  values

  -- ==========================================================
  -- Universal identity / engagement documents
  -- ==========================================================

  (
    'Government-Issued Photo ID',
    'Current government-issued photo identification for the taxpayer.',
    'identity',
    null,
    null,
    true,
    10,
    array[
      'driver license',
      'drivers license',
      'photo id',
      'passport',
      'identification'
    ]::text[]
  ),

  (
    'Social Security Documentation',
    'Social Security card or other acceptable taxpayer identification documentation.',
    'identity',
    null,
    null,
    true,
    20,
    array[
      'social security',
      'ssn',
      'social security card'
    ]::text[]
  ),

  (
    'Prior Year Federal Tax Return',
    'Most recently filed federal income tax return.',
    'prior_return',
    null,
    null,
    true,
    30,
    array[
      'prior return',
      'previous return',
      '1040',
      'federal return'
    ]::text[]
  ),

  (
    'Engagement Letter',
    'Signed tax preparation engagement letter.',
    'engagement',
    null,
    null,
    true,
    40,
    array[
      'engagement letter',
      'engagement'
    ]::text[]
  ),

  -- ==========================================================
  -- Individual return documents
  -- ==========================================================

  (
    'W-2 Wage and Tax Statements',
    'W-2 statements received from all employers.',
    'income',
    'individual',
    null,
    true,
    100,
    array[
      'w2',
      'w-2',
      'wage statement'
    ]::text[]
  ),

  (
    '1099 Income Statements',
    'Applicable 1099 income statements, including NEC, MISC, INT, and DIV forms.',
    'income',
    'individual',
    null,
    true,
    110,
    array[
      '1099',
      '1099-nec',
      '1099-misc',
      '1099-int',
      '1099-div'
    ]::text[]
  ),

  (
    'Retirement Income Statements',
    'Applicable 1099-R, SSA-1099, pension, or retirement income statements.',
    'income',
    'individual',
    null,
    false,
    120,
    array[
      '1099-r',
      'ssa-1099',
      'pension',
      'retirement'
    ]::text[]
  ),

  (
    'Brokerage and Investment Statements',
    'Year-end brokerage, capital gain, dividend, and investment statements.',
    'income',
    'individual',
    null,
    false,
    130,
    array[
      'brokerage',
      'investment',
      'capital gains',
      '1099-b'
    ]::text[]
  ),

  (
    'Schedule K-1 Statements',
    'K-1 statements from partnerships, S corporations, estates, or trusts.',
    'income',
    'individual',
    null,
    false,
    140,
    array[
      'k-1',
      'k1',
      'schedule k-1'
    ]::text[]
  ),

  (
    'Mortgage Interest Statement',
    'Form 1098 or equivalent mortgage interest documentation.',
    'deductions',
    'individual',
    null,
    false,
    200,
    array[
      '1098',
      'mortgage interest',
      'mortgage'
    ]::text[]
  ),

  (
    'Property Tax Documentation',
    'Real estate or personal property tax statements.',
    'deductions',
    'individual',
    null,
    false,
    210,
    array[
      'property tax',
      'real estate tax'
    ]::text[]
  ),

  (
    'Charitable Contribution Records',
    'Receipts and acknowledgements supporting charitable contributions.',
    'deductions',
    'individual',
    null,
    false,
    220,
    array[
      'charity',
      'charitable contribution',
      'donation'
    ]::text[]
  ),

  (
    'Education Tax Documents',
    'Applicable 1098-T and other education expense documentation.',
    'deductions',
    'individual',
    null,
    false,
    230,
    array[
      '1098-t',
      'tuition',
      'education'
    ]::text[]
  ),

  (
    'Student Loan Interest Statement',
    'Form 1098-E or equivalent student loan interest documentation.',
    'deductions',
    'individual',
    null,
    false,
    240,
    array[
      '1098-e',
      'student loan',
      'student loan interest'
    ]::text[]
  ),

  (
    'Child and Dependent Care Records',
    'Dependent care provider information and annual expense documentation.',
    'deductions',
    'individual',
    null,
    false,
    250,
    array[
      'child care',
      'dependent care',
      'daycare'
    ]::text[]
  ),

  (
    'Health Insurance Tax Documents',
    'Applicable health insurance marketplace or coverage tax documents.',
    'deductions',
    'individual',
    null,
    false,
    260,
    array[
      '1095-a',
      '1095-b',
      '1095-c',
      'health insurance'
    ]::text[]
  ),

  -- ==========================================================
  -- Schedule C / self-employed documents
  -- ==========================================================

  (
    'Business Profit and Loss Statement',
    'Year-to-date or annual profit and loss statement for business activity.',
    'business',
    'individual',
    'schedule_c',
    true,
    300,
    array[
      'profit and loss',
      'p&l',
      'income statement'
    ]::text[]
  ),

  (
    'Business Expense Summary',
    'Summary and supporting documentation for deductible business expenses.',
    'business',
    'individual',
    'schedule_c',
    true,
    310,
    array[
      'business expenses',
      'expense summary',
      'expenses'
    ]::text[]
  ),

  (
    'Business Mileage Log',
    'Business-use mileage or vehicle expense documentation.',
    'business',
    'individual',
    'schedule_c',
    false,
    320,
    array[
      'mileage',
      'mileage log',
      'vehicle expenses'
    ]::text[]
  ),

  (
    'Business Asset and Equipment Records',
    'Records for equipment, vehicles, and other depreciable business assets.',
    'business',
    'individual',
    'schedule_c',
    false,
    330,
    array[
      'fixed assets',
      'equipment',
      'depreciation',
      'business assets'
    ]::text[]
  ),

  -- ==========================================================
  -- Business return documents
  -- ==========================================================

  (
    'Business Profit and Loss Statement',
    'Annual business profit and loss statement.',
    'business',
    'business',
    null,
    true,
    400,
    array[
      'profit and loss',
      'p&l',
      'income statement'
    ]::text[]
  ),

  (
    'Business Balance Sheet',
    'Year-end business balance sheet.',
    'business',
    'business',
    null,
    true,
    410,
    array[
      'balance sheet',
      'assets',
      'liabilities'
    ]::text[]
  ),

  (
    'Business General Ledger',
    'General ledger or equivalent detailed accounting records.',
    'business',
    'business',
    null,
    false,
    420,
    array[
      'general ledger',
      'ledger',
      'gl'
    ]::text[]
  ),

  (
    'Business Bank Statements',
    'Applicable year-end or supporting business bank statements.',
    'business',
    'business',
    null,
    false,
    430,
    array[
      'bank statement',
      'business bank'
    ]::text[]
  ),

  (
    'Payroll Summary',
    'Annual payroll summary and payroll tax reconciliation records.',
    'business',
    'business',
    null,
    false,
    440,
    array[
      'payroll',
      'payroll summary',
      '941',
      '940'
    ]::text[]
  ),

  (
    'Business Asset and Depreciation Records',
    'Current-year fixed asset purchases, disposals, and depreciation schedules.',
    'business',
    'business',
    null,
    false,
    450,
    array[
      'fixed assets',
      'depreciation',
      'asset schedule'
    ]::text[]
  ),

  (
    'Ownership and Shareholder Records',
    'Current ownership, shareholder, partner, or member information.',
    'business',
    'business',
    null,
    true,
    460,
    array[
      'shareholder',
      'partner',
      'member',
      'ownership'
    ]::text[]
  ),

  -- ==========================================================
  -- Notices / miscellaneous
  -- ==========================================================

  (
    'IRS Correspondence',
    'Relevant notices, letters, or correspondence received from the IRS.',
    'irs_notice',
    null,
    null,
    false,
    500,
    array[
      'irs notice',
      'irs letter',
      'cp2000',
      'correspondence'
    ]::text[]
  ),

  (
    'State Tax Correspondence',
    'Relevant notices or correspondence received from a state taxing authority.',
    'irs_notice',
    null,
    null,
    false,
    510,
    array[
      'state notice',
      'tax notice',
      'state letter'
    ]::text[]
  ),

  (
    'Additional Supporting Documentation',
    'Other supporting tax documentation requested by the preparer.',
    'miscellaneous',
    null,
    null,
    false,
    900,
    array[
      'supporting document',
      'miscellaneous',
      'other'
    ]::text[]
  )
)

insert into public.required_document_templates (
  name,
  description,
  category,
  return_type,
  tax_form,
  is_required,
  is_active,
  sort_order,
  matching_keywords
)

select
  seed.name,
  seed.description,
  seed.category,
  seed.return_type::public.return_type,
  seed.tax_form::public.tax_form_type,
  seed.is_required,
  true,
  seed.sort_order,
  seed.matching_keywords

from template_seed as seed

where not exists (
  select 1
  from public.required_document_templates existing
  where existing.name = seed.name
    and existing.category = seed.category
    and existing.return_type
      is not distinct from
      seed.return_type::public.return_type
    and existing.tax_form
      is not distinct from
      seed.tax_form::public.tax_form_type
);