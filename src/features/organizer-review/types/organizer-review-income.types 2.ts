export type OrganizerReviewIncomeType =
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

export type OrganizerReviewIncomeRecipientType =
  | "taxpayer"
  | "spouse"
  | "dependent"
  | "joint"

export type OrganizerReviewIncomeRecordStatus =
  | "draft"
  | "complete"
  | "needs_review"

export interface OrganizerReviewIncomeW2Details {
  employerIdentificationNumber: string | null
  wages: number | null
  federalIncomeTaxWithheld: number | null
  socialSecurityWages: number | null
  socialSecurityTaxWithheld: number | null
  medicareWages: number | null
  medicareTaxWithheld: number | null
  stateCode: string | null
  stateWages: number | null
  stateIncomeTaxWithheld: number | null
  localWages: number | null
  localIncomeTaxWithheld: number | null
}

export interface OrganizerReviewIncomeSource {
  organizerId: string
  incomeSourceId: string
  incomeType: OrganizerReviewIncomeType
  payerName: string
  recipientType: OrganizerReviewIncomeRecipientType
  recordStatus: OrganizerReviewIncomeRecordStatus
  documentReceived: boolean
  notes: string
  displayOrder: number
  w2Details: OrganizerReviewIncomeW2Details | null
  createdAt: string
  updatedAt: string
}