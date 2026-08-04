import {
  supabase,
} from "@/services/supabase"

import type {
  GetStaffIncomeReviewRequest,
  StaffIncomeReview,
  StaffIncomeReview1099DivDetails,
  StaffIncomeReview1099IntDetails,
  StaffIncomeReviewOrganizer,
  StaffIncomeReviewReviewer,
  StaffIncomeReviewSource,
  StaffIncomeReviewSummary,
  StaffIncomeReviewW2Details,
} from "@/features/organizer-review/types"

interface RpcError {
  code?: string
  message: string
  details?: string
  hint?: string
}

interface RpcResponse {
  data: unknown
  error: RpcError | null
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

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  )
}

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(
      `${label} was not returned in the expected format.`,
    )
  }

  return value
}

function requireString(
  value: unknown,
  label: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} was not returned.`,
    )
  }

  return value
}

function optionalString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null
}

function normalizedString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : ""
}

function requireNumber(
  value: unknown,
  label: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `${label} was not returned as a valid number.`,
    )
  }

  return value
}

function optionalNumber(
  value: unknown,
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : null
}

function requireBoolean(
  value: unknown,
  label: string,
): boolean {
  if (
    typeof value !== "boolean"
  ) {
    throw new Error(
      `${label} was not returned as a valid boolean.`,
    )
  }

  return value
}

function requireInteger(
  value: unknown,
  label: string,
): number {
  const parsed =
    requireNumber(
      value,
      label,
    )

  if (
    !Number.isInteger(
      parsed,
    )
  ) {
    throw new Error(
      `${label} was not returned as a valid integer.`,
    )
  }

  return parsed
}

function requireArray(
  value: unknown,
  label: string,
): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `${label} was not returned as a valid list.`,
    )
  }

  return value
}

function mapOrganizer(
  value: unknown,
): StaffIncomeReviewOrganizer {
  const row =
    requireRecord(
      value,
      "Organizer information",
    )

  return {
    organizerId:
      requireString(
        row.organizerId,
        "Organizer identifier",
      ),

    clientId:
      requireString(
        row.clientId,
        "Client identifier",
      ),

    taxYear:
      requireInteger(
        row.taxYear,
        "Tax year",
      ),

    status:
      requireString(
        row.status,
        "Organizer status",
      ) as StaffIncomeReviewOrganizer["status"],

    currentSection:
      normalizedString(
        row.currentSection,
      ),

    progressPercentage:
      requireNumber(
        row.progressPercentage,
        "Organizer progress",
      ),

    startedAt:
      optionalString(
        row.startedAt,
      ),

    submittedAt:
      optionalString(
        row.submittedAt,
      ),

    lastSavedAt:
      optionalString(
        row.lastSavedAt,
      ),

    createdAt:
      requireString(
        row.createdAt,
        "Organizer created timestamp",
      ),

    updatedAt:
      requireString(
        row.updatedAt,
        "Organizer updated timestamp",
      ),
  }
}

function mapReviewer(
  value: unknown,
): StaffIncomeReviewReviewer {
  const row =
    requireRecord(
      value,
      "Reviewer information",
    )

  return {
    staffId:
      requireString(
        row.staffId,
        "Reviewer identifier",
      ),

    displayName:
      requireString(
        row.displayName,
        "Reviewer display name",
      ),

    role:
      requireString(
        row.role,
        "Reviewer role",
      ),
  }
}

function mapSummary(
  value: unknown,
): StaffIncomeReviewSummary {
  const row =
    requireRecord(
      value,
      "Income review summary",
    )

  return {
    incomeSourceCount:
      requireInteger(
        row.incomeSourceCount,
        "Income source count",
      ),

    completedSourceCount:
      requireInteger(
        row.completedSourceCount,
        "Completed income count",
      ),

    needsReviewSourceCount:
      requireInteger(
        row.needsReviewSourceCount,
        "Needs-review income count",
      ),

    missingDocumentCount:
      requireInteger(
        row.missingDocumentCount,
        "Missing-document count",
      ),

    readySourceCount:
      requireInteger(
        row.readySourceCount,
        "Ready income count",
      ),
  }
}

function mapW2Details(
  value: unknown,
): StaffIncomeReviewW2Details | null {
  if (value === null) {
    return null
  }

  const row =
    requireRecord(
      value,
      "W-2 details",
    )

  return {
    employerIdentificationNumber:
      optionalString(
        row.employerIdentificationNumber,
      ),
    wages:
      optionalNumber(
        row.wages,
      ),
    federalIncomeTaxWithheld:
      optionalNumber(
        row.federalIncomeTaxWithheld,
      ),
    socialSecurityWages:
      optionalNumber(
        row.socialSecurityWages,
      ),
    socialSecurityTaxWithheld:
      optionalNumber(
        row.socialSecurityTaxWithheld,
      ),
    medicareWages:
      optionalNumber(
        row.medicareWages,
      ),
    medicareTaxWithheld:
      optionalNumber(
        row.medicareTaxWithheld,
      ),
    stateCode:
      optionalString(
        row.stateCode,
      ),
    stateWages:
      optionalNumber(
        row.stateWages,
      ),
    stateIncomeTaxWithheld:
      optionalNumber(
        row.stateIncomeTaxWithheld,
      ),
    localWages:
      optionalNumber(
        row.localWages,
      ),
    localIncomeTaxWithheld:
      optionalNumber(
        row.localIncomeTaxWithheld,
      ),
    createdAt:
      optionalString(
        row.createdAt,
      ),
    updatedAt:
      optionalString(
        row.updatedAt,
      ),
  }
}

function map1099IntDetails(
  value: unknown,
): StaffIncomeReview1099IntDetails | null {
  if (value === null) {
    return null
  }

  const row =
    requireRecord(
      value,
      "1099-INT details",
    )

  return {
    payerIdentificationNumber:
      optionalString(
        row.payerIdentificationNumber,
      ),
    interestIncome:
      optionalNumber(
        row.interestIncome,
      ),
    earlyWithdrawalPenalty:
      optionalNumber(
        row.earlyWithdrawalPenalty,
      ),
    interestOnUsSavingsBondsAndTreasuryObligations:
      optionalNumber(
        row
          .interestOnUsSavingsBondsAndTreasuryObligations,
      ),
    federalIncomeTaxWithheld:
      optionalNumber(
        row.federalIncomeTaxWithheld,
      ),
    investmentExpenses:
      optionalNumber(
        row.investmentExpenses,
      ),
    foreignTaxPaid:
      optionalNumber(
        row.foreignTaxPaid,
      ),
    foreignCountryOrUsPossession:
      optionalString(
        row.foreignCountryOrUsPossession,
      ),
    taxExemptInterest:
      optionalNumber(
        row.taxExemptInterest,
      ),
    specifiedPrivateActivityBondInterest:
      optionalNumber(
        row
          .specifiedPrivateActivityBondInterest,
      ),
    marketDiscount:
      optionalNumber(
        row.marketDiscount,
      ),
    bondPremium:
      optionalNumber(
        row.bondPremium,
      ),
    bondPremiumOnTreasuryObligations:
      optionalNumber(
        row
          .bondPremiumOnTreasuryObligations,
      ),
    bondPremiumOnTaxExemptBond:
      optionalNumber(
        row
          .bondPremiumOnTaxExemptBond,
      ),
    stateCode:
      optionalString(
        row.stateCode,
      ),
    stateIdentificationNumber:
      optionalString(
        row.stateIdentificationNumber,
      ),
    stateTaxWithheld:
      optionalNumber(
        row.stateTaxWithheld,
      ),
    createdAt:
      optionalString(
        row.createdAt,
      ),
    updatedAt:
      optionalString(
        row.updatedAt,
      ),
  }
}

function map1099DivDetails(
  value: unknown,
): StaffIncomeReview1099DivDetails | null {
  if (value === null) {
    return null
  }

  const row =
    requireRecord(
      value,
      "1099-DIV details",
    )

  return {
    payerIdentificationNumber:
      optionalString(
        row.payerIdentificationNumber,
      ),
    totalOrdinaryDividends:
      optionalNumber(
        row.totalOrdinaryDividends,
      ),
    qualifiedDividends:
      optionalNumber(
        row.qualifiedDividends,
      ),
    totalCapitalGainDistributions:
      optionalNumber(
        row
          .totalCapitalGainDistributions,
      ),
    unrecapturedSection1250Gain:
      optionalNumber(
        row.unrecapturedSection1250Gain,
      ),
    section1202Gain:
      optionalNumber(
        row.section1202Gain,
      ),
    collectibles28PercentRateGain:
      optionalNumber(
        row
          .collectibles28PercentRateGain,
      ),
    section897OrdinaryDividends:
      optionalNumber(
        row
          .section897OrdinaryDividends,
      ),
    section897CapitalGain:
      optionalNumber(
        row.section897CapitalGain,
      ),
    nondividendDistributions:
      optionalNumber(
        row.nondividendDistributions,
      ),
    federalIncomeTaxWithheld:
      optionalNumber(
        row.federalIncomeTaxWithheld,
      ),
    section199aDividends:
      optionalNumber(
        row.section199aDividends,
      ),
    investmentExpenses:
      optionalNumber(
        row.investmentExpenses,
      ),
    foreignTaxPaid:
      optionalNumber(
        row.foreignTaxPaid,
      ),
    foreignCountryOrUsPossession:
      optionalString(
        row.foreignCountryOrUsPossession,
      ),
    exemptInterestDividends:
      optionalNumber(
        row.exemptInterestDividends,
      ),
    specifiedPrivateActivityBondInterestDividends:
      optionalNumber(
        row
          .specifiedPrivateActivityBondInterestDividends,
      ),
    stateCode:
      optionalString(
        row.stateCode,
      ),
    stateIdentificationNumber:
      optionalString(
        row.stateIdentificationNumber,
      ),
    stateTaxWithheld:
      optionalNumber(
        row.stateTaxWithheld,
      ),
    createdAt:
      optionalString(
        row.createdAt,
      ),
    updatedAt:
      optionalString(
        row.updatedAt,
      ),
  }
}

function mapIncomeSource(
  value: unknown,
): StaffIncomeReviewSource {
  const row =
    requireRecord(
      value,
      "Income source",
    )

  return {
    incomeSourceId:
      requireString(
        row.incomeSourceId,
        "Income source identifier",
      ),

    organizerId:
      requireString(
        row.organizerId,
        "Income organizer identifier",
      ),

    incomeType:
      requireString(
        row.incomeType,
        "Income type",
      ) as StaffIncomeReviewSource["incomeType"],

    payerName:
      requireString(
        row.payerName,
        "Payer name",
      ),

    recipientType:
      requireString(
        row.recipientType,
        "Recipient type",
      ) as StaffIncomeReviewSource["recipientType"],

    recordStatus:
      requireString(
        row.recordStatus,
        "Income record status",
      ) as StaffIncomeReviewSource["recordStatus"],

    documentReceived:
      requireBoolean(
        row.documentReceived,
        "Document received status",
      ),

    notes:
      normalizedString(
        row.notes,
      ),

    displayOrder:
      requireInteger(
        row.displayOrder,
        "Income display order",
      ),

    createdAt:
      requireString(
        row.createdAt,
        "Income created timestamp",
      ),

    updatedAt:
      requireString(
        row.updatedAt,
        "Income updated timestamp",
      ),

    hasRequiredPrimaryAmount:
      requireBoolean(
        row.hasRequiredPrimaryAmount,
        "Primary amount status",
      ),

    reviewStatus:
      requireString(
        row.reviewStatus,
        "Income review status",
      ) as StaffIncomeReviewSource["reviewStatus"],

    internalNotes:
      normalizedString(
        row.internalNotes,
      ),

    reviewedBy:
      optionalString(
        row.reviewedBy,
      ),

    reviewedByName:
      optionalString(
        row.reviewedByName,
      ),

    reviewedAt:
      optionalString(
        row.reviewedAt,
      ),

    followUpRequestedAt:
      optionalString(
        row.followUpRequestedAt,
      ),

    returnedToClientAt:
      optionalString(
        row.returnedToClientAt,
      ),

    reviewUpdatedAt:
      optionalString(
        row.reviewUpdatedAt,
      ),

    w2Details:
      mapW2Details(
        row.w2Details,
      ),

    details1099Int:
      map1099IntDetails(
        row.details1099Int,
      ),

    details1099Div:
      map1099DivDetails(
        row.details1099Div,
      ),
  }
}

function mapStaffIncomeReview(
  value: unknown,
): StaffIncomeReview {
  const row =
    requireRecord(
      value,
      "Staff Income Review",
    )

  return {
    organizer:
      mapOrganizer(
        row.organizer,
      ),

    reviewer:
      mapReviewer(
        row.reviewer,
      ),

    summary:
      mapSummary(
        row.summary,
      ),

    incomeSources:
      requireArray(
        row.incomeSources,
        "Income sources",
      ).map(
        mapIncomeSource,
      ),
  }
}

function validateRequest(
  request:
    GetStaffIncomeReviewRequest,
): {
  clientId: string
  taxYear: number
} {
  const clientId =
    request.clientId.trim()

  if (!clientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  if (
    !Number.isInteger(
      request.taxYear,
    ) ||
    request.taxYear < 1900 ||
    request.taxYear > 2200
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  return {
    clientId,
    taxYear:
      request.taxYear,
  }
}

export async function getStaffIncomeReview(
  request:
    GetStaffIncomeReviewRequest,
): Promise<StaffIncomeReview> {
  const validated =
    validateRequest(
      request,
    )

  const {
    data,
    error,
  } = await callRpc(
    "get_staff_income_review",
    {
      requested_client_id:
        validated.clientId,

      requested_tax_year:
        validated.taxYear,
    },
  )

  if (error) {
    console.error(
      "Staff Income Review RPC error:",
      {
        code:
          error.code,

        message:
          error.message,

        details:
          error.details,

        hint:
          error.hint,
      },
    )

    throw new Error(
      error.message,
    )
  }

  return mapStaffIncomeReview(
    data,
  )
}
