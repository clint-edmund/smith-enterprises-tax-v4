import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerIncome1099DivDetails,
  OrganizerIncome1099IntDetails,
  SaveOrganizerIncome1099DivRequest,
  SaveOrganizerIncome1099DivResult,
  SaveOrganizerIncome1099IntRequest,
  SaveOrganizerIncome1099IntResult,
} from "@/features/client-portal/types/organizer-income-1099.types"

interface RpcResponse {
  data: unknown
  error: {
    code?: string
    message: string
    details?: string
    hint?: string
  } | null
}

type RpcCaller = (
  functionName: string,
  argumentsValue: Record<
    string,
    unknown
  >,
) => Promise<RpcResponse>

const callRpc: RpcCaller = (
  functionName,
  argumentsValue,
) =>
  (
    supabase.rpc as unknown as
      RpcCaller
  ).call(
    supabase,
    functionName,
    argumentsValue,
  )

interface Income1099IntRow {
  income_source_id: string
  payer_identification_number:
    string | null
  interest_income: number | null
  early_withdrawal_penalty:
    number | null
  interest_on_us_savings_bonds_and_treasury_obligations:
    number | null
  federal_income_tax_withheld:
    number | null
  investment_expenses: number | null
  foreign_tax_paid: number | null
  foreign_country_or_us_possession:
    string | null
  tax_exempt_interest: number | null
  specified_private_activity_bond_interest:
    number | null
  market_discount: number | null
  bond_premium: number | null
  bond_premium_on_treasury_obligations:
    number | null
  bond_premium_on_tax_exempt_bond:
    number | null
  state_code: string | null
  state_identification_number:
    string | null
  state_tax_withheld: number | null
  created_at: string | null
  updated_at: string | null
}

interface SaveIncome1099IntRow
  extends Income1099IntRow {
  organizer_id: string
  income_type: string
  payer_name: string
  recipient_type: string
  record_status: string
  document_received: boolean
  notes: string | null
  display_order: number
  income_created_at: string
  income_updated_at: string
  details_created_at: string | null
  details_updated_at: string | null
}

interface Income1099DivRow {
  income_source_id: string
  payer_identification_number:
    string | null
  total_ordinary_dividends:
    number | null
  qualified_dividends: number | null
  total_capital_gain_distributions:
    number | null
  unrecaptured_section_1250_gain:
    number | null
  section_1202_gain: number | null
  collectibles_28_percent_rate_gain:
    number | null
  section_897_ordinary_dividends:
    number | null
  section_897_capital_gain:
    number | null
  nondividend_distributions:
    number | null
  federal_income_tax_withheld:
    number | null
  section_199a_dividends:
    number | null
  investment_expenses: number | null
  foreign_tax_paid: number | null
  foreign_country_or_us_possession:
    string | null
  exempt_interest_dividends:
    number | null
  specified_private_activity_bond_interest_dividends:
    number | null
  state_code: string | null
  state_identification_number:
    string | null
  state_tax_withheld: number | null
  created_at: string | null
  updated_at: string | null
}

interface SaveIncome1099DivRow
  extends Income1099DivRow {
  organizer_id: string
  income_type: string
  payer_name: string
  recipient_type: string
  record_status: string
  document_received: boolean
  notes: string | null
  display_order: number
  income_created_at: string
  income_updated_at: string
  details_created_at: string | null
  details_updated_at: string | null
}

function requireIdentifier(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${label} is required.`,
    )
  }

  return normalized
}

function firstRow<Row>(
  data: unknown,
  message: string,
): Row {
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    throw new Error(message)
  }

  return data[0] as Row
}

function map1099IntDetails(
  row: Income1099IntRow,
): OrganizerIncome1099IntDetails {
  return {
    incomeSourceId:
      row.income_source_id,
    payerIdentificationNumber:
      row.payer_identification_number ??
      "",
    interestIncome:
      row.interest_income,
    earlyWithdrawalPenalty:
      row.early_withdrawal_penalty,
    interestOnUsSavingsBondsAndTreasuryObligations:
      row.interest_on_us_savings_bonds_and_treasury_obligations,
    federalIncomeTaxWithheld:
      row.federal_income_tax_withheld,
    investmentExpenses:
      row.investment_expenses,
    foreignTaxPaid:
      row.foreign_tax_paid,
    foreignCountryOrUsPossession:
      row.foreign_country_or_us_possession ??
      "",
    taxExemptInterest:
      row.tax_exempt_interest,
    specifiedPrivateActivityBondInterest:
      row.specified_private_activity_bond_interest,
    marketDiscount:
      row.market_discount,
    bondPremium:
      row.bond_premium,
    bondPremiumOnTreasuryObligations:
      row.bond_premium_on_treasury_obligations,
    bondPremiumOnTaxExemptBond:
      row.bond_premium_on_tax_exempt_bond,
    stateCode:
      row.state_code ?? "",
    stateIdentificationNumber:
      row.state_identification_number ??
      "",
    stateTaxWithheld:
      row.state_tax_withheld,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }
}

function map1099DivDetails(
  row: Income1099DivRow,
): OrganizerIncome1099DivDetails {
  return {
    incomeSourceId:
      row.income_source_id,
    payerIdentificationNumber:
      row.payer_identification_number ??
      "",
    totalOrdinaryDividends:
      row.total_ordinary_dividends,
    qualifiedDividends:
      row.qualified_dividends,
    totalCapitalGainDistributions:
      row.total_capital_gain_distributions,
    unrecapturedSection1250Gain:
      row.unrecaptured_section_1250_gain,
    section1202Gain:
      row.section_1202_gain,
    collectibles28PercentRateGain:
      row.collectibles_28_percent_rate_gain,
    section897OrdinaryDividends:
      row.section_897_ordinary_dividends,
    section897CapitalGain:
      row.section_897_capital_gain,
    nondividendDistributions:
      row.nondividend_distributions,
    federalIncomeTaxWithheld:
      row.federal_income_tax_withheld,
    section199aDividends:
      row.section_199a_dividends,
    investmentExpenses:
      row.investment_expenses,
    foreignTaxPaid:
      row.foreign_tax_paid,
    foreignCountryOrUsPossession:
      row.foreign_country_or_us_possession ??
      "",
    exemptInterestDividends:
      row.exempt_interest_dividends,
    specifiedPrivateActivityBondInterestDividends:
      row.specified_private_activity_bond_interest_dividends,
    stateCode:
      row.state_code ?? "",
    stateIdentificationNumber:
      row.state_identification_number ??
      "",
    stateTaxWithheld:
      row.state_tax_withheld,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }
}

export async function getOrganizerIncome1099IntDetails(
  organizerId: string,
  incomeSourceId: string,
): Promise<OrganizerIncome1099IntDetails> {
  const {
    data,
    error,
  } = await callRpc(
    "get_client_organizer_income_1099_int_details",
    {
      requested_organizer_id:
        requireIdentifier(
          organizerId,
          "An organizer identifier",
        ),
      requested_income_source_id:
        requireIdentifier(
          incomeSourceId,
          "An income source identifier",
        ),
    },
  )

  if (error) {
      console.error(
        "1099-INT RPC ERROR",
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      )

      throw new Error(
        error.message,
      )
    }

  return map1099IntDetails(
    firstRow<Income1099IntRow>(
      data,
      "Form 1099-INT details were not returned.",
    ),
  )
}

export async function saveOrganizerIncome1099IntDetails(
  request:
    SaveOrganizerIncome1099IntRequest,
): Promise<SaveOrganizerIncome1099IntResult> {
  const {
    data,
    error,
  } = await callRpc(
    "save_client_organizer_income_1099_int_details",
    {
      requested_organizer_id:
        requireIdentifier(
          request.organizerId,
          "An organizer identifier",
        ),
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An income source identifier",
        ),
      requested_payer_identification_number:
        request.payerIdentificationNumber,
      requested_interest_income:
        request.interestIncome,
      requested_early_withdrawal_penalty:
        request.earlyWithdrawalPenalty,
      requested_interest_on_us_savings_bonds_and_treasury_obligations:
        request.interestOnUsSavingsBondsAndTreasuryObligations,
      requested_federal_income_tax_withheld:
        request.federalIncomeTaxWithheld,
      requested_investment_expenses:
        request.investmentExpenses,
      requested_foreign_tax_paid:
        request.foreignTaxPaid,
      requested_foreign_country_or_us_possession:
        request.foreignCountryOrUsPossession,
      requested_tax_exempt_interest:
        request.taxExemptInterest,
      requested_specified_private_activity_bond_interest:
        request.specifiedPrivateActivityBondInterest,
      requested_market_discount:
        request.marketDiscount,
      requested_bond_premium:
        request.bondPremium,
      requested_bond_premium_on_treasury_obligations:
        request.bondPremiumOnTreasuryObligations,
      requested_bond_premium_on_tax_exempt_bond:
        request.bondPremiumOnTaxExemptBond,
      requested_state_code:
        request.stateCode,
      requested_state_identification_number:
        request.stateIdentificationNumber,
      requested_state_tax_withheld:
        request.stateTaxWithheld,
      requested_document_received:
        request.documentReceived,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row =
    firstRow<SaveIncome1099IntRow>(
      data,
      "Form 1099-INT details could not be saved.",
    )

  return {
    incomeSourceId:
      row.income_source_id,
    organizerId:
      row.organizer_id,
    incomeType:
      "1099_int",
    payerName:
      row.payer_name,
    recipientType:
      row.recipient_type,
    recordStatus:
      row.record_status,
    documentReceived:
      row.document_received,
    notes:
      row.notes ?? "",
    displayOrder:
      row.display_order,
    incomeCreatedAt:
      row.income_created_at,
    incomeUpdatedAt:
      row.income_updated_at,
    details:
      map1099IntDetails({
        ...row,
        created_at:
          row.details_created_at,
        updated_at:
          row.details_updated_at,
      }),
  }
}

export async function getOrganizerIncome1099DivDetails(
  organizerId: string,
  incomeSourceId: string,
): Promise<OrganizerIncome1099DivDetails> {
  const {
    data,
    error,
  } = await callRpc(
    "get_client_organizer_income_1099_div_details",
    {
      requested_organizer_id:
        requireIdentifier(
          organizerId,
          "An organizer identifier",
        ),
      requested_income_source_id:
        requireIdentifier(
          incomeSourceId,
          "An income source identifier",
        ),
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return map1099DivDetails(
    firstRow<Income1099DivRow>(
      data,
      "Form 1099-DIV details were not returned.",
    ),
  )
}

export async function saveOrganizerIncome1099DivDetails(
  request:
    SaveOrganizerIncome1099DivRequest,
): Promise<SaveOrganizerIncome1099DivResult> {
  const {
    data,
    error,
  } = await callRpc(
    "save_client_organizer_income_1099_div_details",
    {
      requested_organizer_id:
        requireIdentifier(
          request.organizerId,
          "An organizer identifier",
        ),
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An income source identifier",
        ),
      requested_payer_identification_number:
        request.payerIdentificationNumber,
      requested_total_ordinary_dividends:
        request.totalOrdinaryDividends,
      requested_qualified_dividends:
        request.qualifiedDividends,
      requested_total_capital_gain_distributions:
        request.totalCapitalGainDistributions,
      requested_unrecaptured_section_1250_gain:
        request.unrecapturedSection1250Gain,
      requested_section_1202_gain:
        request.section1202Gain,
      requested_collectibles_28_percent_rate_gain:
        request.collectibles28PercentRateGain,
      requested_section_897_ordinary_dividends:
        request.section897OrdinaryDividends,
      requested_section_897_capital_gain:
        request.section897CapitalGain,
      requested_nondividend_distributions:
        request.nondividendDistributions,
      requested_federal_income_tax_withheld:
        request.federalIncomeTaxWithheld,
      requested_section_199a_dividends:
        request.section199aDividends,
      requested_investment_expenses:
        request.investmentExpenses,
      requested_foreign_tax_paid:
        request.foreignTaxPaid,
      requested_foreign_country_or_us_possession:
        request.foreignCountryOrUsPossession,
      requested_exempt_interest_dividends:
        request.exemptInterestDividends,
      requested_specified_private_activity_bond_interest_dividends:
        request.specifiedPrivateActivityBondInterestDividends,
      requested_state_code:
        request.stateCode,
      requested_state_identification_number:
        request.stateIdentificationNumber,
      requested_state_tax_withheld:
        request.stateTaxWithheld,
      requested_document_received:
        request.documentReceived,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row =
    firstRow<SaveIncome1099DivRow>(
      data,
      "Form 1099-DIV details could not be saved.",
    )

  return {
    incomeSourceId:
      row.income_source_id,
    organizerId:
      row.organizer_id,
    incomeType:
      "1099_div",
    payerName:
      row.payer_name,
    recipientType:
      row.recipient_type,
    recordStatus:
      row.record_status,
    documentReceived:
      row.document_received,
    notes:
      row.notes ?? "",
    displayOrder:
      row.display_order,
    incomeCreatedAt:
      row.income_created_at,
    incomeUpdatedAt:
      row.income_updated_at,
    details:
      map1099DivDetails({
        ...row,
        created_at:
          row.details_created_at,
        updated_at:
          row.details_updated_at,
      }),
  }
}
