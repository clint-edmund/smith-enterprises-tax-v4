export type OrganizerBankAccountType =
  | ""
  | "checking"
  | "savings"

export interface OrganizerBankingInformation {
  organizerId: string

  accountHolderName: string

  bankName: string

  accountType:
    OrganizerBankAccountType

  useDirectDeposit:
    boolean | null

  authorizeDirectDebit:
    boolean | null

  hasRoutingNumber:
    boolean

  routingNumberMasked:
    string | null

  hasBankAccountNumber:
    boolean

  bankAccountNumberMasked:
    string | null

  createdAt: string | null

  updatedAt: string | null
}

export interface SaveOrganizerBankingInformationRequest {
  organizerId: string

  accountHolderName: string

  bankName: string

  accountType:
    OrganizerBankAccountType

  useDirectDeposit:
    boolean | null

  authorizeDirectDebit:
    boolean | null
}

export interface SaveOrganizerBankingInformationResponse {
  organizerId: string

  sectionStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  sectionProgressPercentage:
    number

  organizerProgressPercentage:
    number

  savedAt: string
}