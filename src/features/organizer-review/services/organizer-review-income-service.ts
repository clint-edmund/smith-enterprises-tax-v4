import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerReviewIncomeSource,
  OrganizerReviewIncomeW2Details,
} from "../types"

interface StaffIncomeReviewRow {
  organizer_id: string
  income_source_id: string
  income_type: string
  payer_name: string
  recipient_type: string
  record_status: string
  document_received: boolean
  notes: string | null
  display_order: number
  employer_identification_number: string | null
  wages: number | null
  federal_income_tax_withheld: number | null
  social_security_wages: number | null
  social_security_tax_withheld: number | null
  medicare_wages: number | null
  medicare_tax_withheld: number | null
  state_code: string | null
  state_wages: number | null
  state_income_tax_withheld: number | null
  local_wages: number | null
  local_income_tax_withheld: number | null
  created_at: string
  updated_at: string
}

function hasW2Details(
  row: StaffIncomeReviewRow,
): boolean {
  return (
    row.income_type === "w2" ||
    row.employer_identification_number !== null ||
    row.wages !== null ||
    row.federal_income_tax_withheld !== null ||
    row.social_security_wages !== null ||
    row.social_security_tax_withheld !== null ||
    row.medicare_wages !== null ||
    row.medicare_tax_withheld !== null ||
    row.state_code !== null ||
    row.state_wages !== null ||
    row.state_income_tax_withheld !== null ||
    row.local_wages !== null ||
    row.local_income_tax_withheld !== null
  )
}

function mapW2Details(
  row: StaffIncomeReviewRow,
): OrganizerReviewIncomeW2Details | null {
  if (!hasW2Details(row)) {
    return null
  }

  return {
    employerIdentificationNumber:
      row.employer_identification_number,
    wages:
      row.wages,
    federalIncomeTaxWithheld:
      row.federal_income_tax_withheld,
    socialSecurityWages:
      row.social_security_wages,
    socialSecurityTaxWithheld:
      row.social_security_tax_withheld,
    medicareWages:
      row.medicare_wages,
    medicareTaxWithheld:
      row.medicare_tax_withheld,
    stateCode:
      row.state_code,
    stateWages:
      row.state_wages,
    stateIncomeTaxWithheld:
      row.state_income_tax_withheld,
    localWages:
      row.local_wages,
    localIncomeTaxWithheld:
      row.local_income_tax_withheld,
  }
}

function mapIncomeReviewRow(
  row: StaffIncomeReviewRow,
): OrganizerReviewIncomeSource {
  return {
    organizerId:
      row.organizer_id,
    incomeSourceId:
      row.income_source_id,
    incomeType:
      row.income_type as
        OrganizerReviewIncomeSource["incomeType"],
    payerName:
      row.payer_name,
    recipientType:
      row.recipient_type as
        OrganizerReviewIncomeSource["recipientType"],
    recordStatus:
      row.record_status as
        OrganizerReviewIncomeSource["recordStatus"],
    documentReceived:
      row.document_received,
    notes:
      row.notes ?? "",
    displayOrder:
      row.display_order,
    w2Details:
      mapW2Details(row),
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  }
}

export async function getOrganizerReviewIncome(
  clientId: string,
  taxYear: number,
): Promise<OrganizerReviewIncomeSource[]> {
  const normalizedClientId =
    clientId.trim()

  if (!normalizedClientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  if (
    !Number.isInteger(taxYear) ||
    taxYear < 1900 ||
    taxYear > 2200
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_staff_organizer_income_review",
    {
      requested_client_id:
        normalizedClientId,
      requested_tax_year:
        taxYear,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return (
    (
      data as
        | StaffIncomeReviewRow[]
        | null
    ) ?? []
  ).map(
    mapIncomeReviewRow,
  )
}
