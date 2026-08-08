export interface OrganizerPersonalInformation {
  organizerId: string

  legalFirstName: string
  legalMiddleName: string
  legalLastName: string
  preferredName: string

  birthDate: string | null

  filingStatus: string

  occupation: string

  email: string

  mobilePhone: string
  alternatePhone: string

  addressLine1: string
  addressLine2: string

  city: string
  state: string
  postalCode: string

  addressChangedThisYear: boolean | null
  maritalStatusChangedThisYear: boolean | null
  employerChangedThisYear: boolean | null

  createdAt: string
  updatedAt: string
}