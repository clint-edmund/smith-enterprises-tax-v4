export type StaffIncomeReviewIncomeType =
  | "w2"
  | "1099_nec"
  | "1099_misc"
  | "1099_k"
  | "1099_int"
  | "1099_div"
  | "1099_r"
  | "ssa_1099"
  | "1099_g"
  | "other"

export type StaffIncomeReviewRecipientType =
  | "taxpayer"
  | "spouse"
  | "dependent"
  | "joint"

export type StaffIncomeReviewRecordStatus =
  | "draft"
  | "complete"
  | "needs_review"

export type StaffIncomeReviewOrganizerStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "submitted"
  | "returned"

export interface StaffIncomeReviewOrganizer {
  organizerId: string
  clientId: string
  taxYear: number
  status: StaffIncomeReviewOrganizerStatus
  currentSection: string
  progressPercentage: number
  startedAt: string | null
  submittedAt: string | null
  lastSavedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffIncomeReviewReviewer {
  staffId: string
  displayName: string
  role: string
}

export interface StaffIncomeReviewSummary {
  incomeSourceCount: number
  completedSourceCount: number
  needsReviewSourceCount: number
  missingDocumentCount: number
  readySourceCount: number
}

export interface StaffIncomeReviewW2Details {
  employerIdentificationNumber:
    string | null
  wages: number | null
  federalIncomeTaxWithheld:
    number | null
  socialSecurityWages:
    number | null
  socialSecurityTaxWithheld:
    number | null
  medicareWages: number | null
  medicareTaxWithheld:
    number | null
  stateCode: string | null
  stateWages: number | null
  stateIncomeTaxWithheld:
    number | null
  localWages: number | null
  localIncomeTaxWithheld:
    number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface StaffIncomeReview1099IntDetails {
  payerIdentificationNumber:
    string | null
  interestIncome: number | null
  earlyWithdrawalPenalty:
    number | null
  interestOnUsSavingsBondsAndTreasuryObligations:
    number | null
  federalIncomeTaxWithheld:
    number | null
  investmentExpenses:
    number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession:
    string | null
  taxExemptInterest: number | null
  specifiedPrivateActivityBondInterest:
    number | null
  marketDiscount: number | null
  bondPremium: number | null
  bondPremiumOnTreasuryObligations:
    number | null
  bondPremiumOnTaxExemptBond:
    number | null
  stateCode: string | null
  stateIdentificationNumber:
    string | null
  stateTaxWithheld: number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface StaffIncomeReview1099DivDetails {
  payerIdentificationNumber:
    string | null
  totalOrdinaryDividends:
    number | null
  qualifiedDividends: number | null
  totalCapitalGainDistributions:
    number | null
  unrecapturedSection1250Gain:
    number | null
  section1202Gain: number | null
  collectibles28PercentRateGain:
    number | null
  section897OrdinaryDividends:
    number | null
  section897CapitalGain:
    number | null
  nondividendDistributions:
    number | null
  federalIncomeTaxWithheld:
    number | null
  section199aDividends:
    number | null
  investmentExpenses:
    number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession:
    string | null
  exemptInterestDividends:
    number | null
  specifiedPrivateActivityBondInterestDividends:
    number | null
  stateCode: string | null
  stateIdentificationNumber:
    string | null
  stateTaxWithheld: number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface StaffIncomeReviewSource {
  incomeSourceId: string
  organizerId: string
  incomeType:
    StaffIncomeReviewIncomeType
  payerName: string
  recipientType:
    StaffIncomeReviewRecipientType
  recordStatus:
    StaffIncomeReviewRecordStatus
  documentReceived: boolean
  notes: string
  displayOrder: number
  createdAt: string
  updatedAt: string
  hasRequiredPrimaryAmount:
    boolean

  w2Details:
    StaffIncomeReviewW2Details | null

  details1099Int:
    StaffIncomeReview1099IntDetails | null

  details1099Div:
    StaffIncomeReview1099DivDetails | null
}

export interface StaffIncomeReview {
  organizer:
    StaffIncomeReviewOrganizer

  reviewer:
    StaffIncomeReviewReviewer

  summary:
    StaffIncomeReviewSummary

  incomeSources:
    StaffIncomeReviewSource[]
}

export interface GetStaffIncomeReviewRequest {
  clientId: string
  taxYear: number
}

/*
 * Compatibility aliases
 *
 * The existing Income Review page already imports these names.
 * The aliases allow the page to keep compiling while the service
 * and hook are transitioned to the unified staff review payload.
 */
export type OrganizerReviewIncomeType =
  StaffIncomeReviewIncomeType

export type OrganizerReviewIncomeRecipientType =
  StaffIncomeReviewRecipientType

export type OrganizerReviewIncomeRecordStatus =
  StaffIncomeReviewRecordStatus

export type OrganizerReviewIncomeW2Details =
  StaffIncomeReviewW2Details

export type OrganizerReviewIncome1099IntDetails =
  StaffIncomeReview1099IntDetails

export type OrganizerReviewIncome1099DivDetails =
  StaffIncomeReview1099DivDetails

export type OrganizerReviewIncomeSource =
  StaffIncomeReviewSource
