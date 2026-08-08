export const incomeTypes = [
  "w2",
  "1099_nec",
  "1099_misc",
  "1099_k",
  "1099_int",
  "1099_div",
  "1099_r",
  "ssa_1099",
  "1099_g",
  "other",
] as const

export type IncomeType =
  (typeof incomeTypes)[number]

export const incomeRecipients = [
  "taxpayer",
  "spouse",
  "dependent",
  "joint",
] as const

export type IncomeRecipient =
  (typeof incomeRecipients)[number]

export const incomeStatuses = [
  "draft",
  "complete",
  "needs_review",
] as const

export type IncomeStatus =
  (typeof incomeStatuses)[number]

export interface OrganizerIncomeSource {
  incomeSourceId: string

  organizerId: string

  incomeType: IncomeType

  payerName: string

  recipientType:
    IncomeRecipient

  recordStatus:
    IncomeStatus

  documentReceived:
    boolean

  notes: string

  displayOrder: number

  createdAt: string

  updatedAt: string
}

export interface OrganizerIncomeW2Details {
  incomeSourceId: string

  employerIdentificationNumber:
    string

  wages:
    number | null

  federalIncomeTaxWithheld:
    number | null

  socialSecurityWages:
    number | null

  socialSecurityTaxWithheld:
    number | null

  medicareWages:
    number | null

  medicareTaxWithheld:
    number | null

  stateCode:
    string

  stateWages:
    number | null

  stateIncomeTaxWithheld:
    number | null

  localWages:
    number | null

  localIncomeTaxWithheld:
    number | null

  createdAt:
    string | null

  updatedAt:
    string | null
}

export interface SaveIncomeW2DetailsRequest {
  organizerId: string

  incomeSourceId: string

  employerIdentificationNumber:
    string

  wages:
    number | null

  federalIncomeTaxWithheld:
    number | null

  socialSecurityWages:
    number | null

  socialSecurityTaxWithheld:
    number | null

  medicareWages:
    number | null

  medicareTaxWithheld:
    number | null

  stateCode:
    string

  stateWages:
    number | null

  stateIncomeTaxWithheld:
    number | null

  localWages:
    number | null

  localIncomeTaxWithheld:
    number | null

  documentReceived:
    boolean
}

export interface SaveIncomeW2DetailsResponse {
  incomeSource:
    OrganizerIncomeSource

  w2Details:
    OrganizerIncomeW2Details
}

export interface CreateIncomeSourceRequest {
  organizerId: string

  incomeType: IncomeType

  payerName: string

  recipientType:
    IncomeRecipient

  notes: string
}

export interface UpdateIncomeSourceRequest {
  incomeSourceId: string

  organizerId: string

  payerName: string

  recipientType:
    IncomeRecipient

  recordStatus:
    IncomeStatus

  documentReceived:
    boolean

  notes: string
}

export interface DeleteIncomeSourceRequest {
  organizerId: string

  incomeSourceId: string
}