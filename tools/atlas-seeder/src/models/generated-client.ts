import type {
  AtlasFilingStatus,
} from "../fixtures"

export type AtlasClientStatus =
  | "active"
  | "inactive"
  | "archived"

export type AtlasClientScenario =
  | "simple_w2"
  | "married_family"
  | "retired"
  | "self_employed"
  | "small_business"
  | "rental_property"
  | "complex_investor"

export interface GeneratedClient {
  clientNumber: number

  firstName: string
  lastName: string

  birthDate: string

  email: string
  phone: string

  addressLine1: string
  city: string
  state: "DC" | "MD" | "VA"
  postalCode: string

  occupation: string
  employer: string | null

  filingStatus: AtlasFilingStatus

  status: AtlasClientStatus
  scenario: AtlasClientScenario

  createdAt: string
}