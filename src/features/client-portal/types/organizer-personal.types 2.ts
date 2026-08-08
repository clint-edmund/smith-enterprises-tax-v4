export type FilingStatus =
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household"
  | "qualifying_surviving_spouse"
  | "not_sure"

export interface OrganizerPersonalInformation {
  legalFirstName: string
  legalMiddleName: string
  legalLastName: string
  preferredName: string

  birthDate: string
  occupation: string
  filingStatus: FilingStatus

  email: string
  phone: string
  alternatePhone: string

  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string

  addressChangedThisYear: boolean | null
  maritalStatusChangedThisYear: boolean | null
}