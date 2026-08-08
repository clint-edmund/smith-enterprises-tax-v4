import type {
  DependentRelationship,
} from "@/features/client-portal/constants/dependent-relationships"

export interface OrganizerDependent {
  dependentId: string

  organizerId: string

  firstName: string

  middleName: string

  lastName: string

  suffix: string

  relationship:
    DependentRelationship

  birthDate: string

  isFullTimeStudent:
    boolean

  isPermanentlyDisabled:
    boolean

  livedWithTaxpayerAllYear:
    boolean

  monthsLivedWithTaxpayer:
    number

  usCitizenOrResident:
    boolean

  claimedByAnotherTaxpayer:
    boolean

  displayOrder: number

  sectionStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  sectionProgressPercentage:
    number

  organizerProgressPercentage:
    number

  createdAt: string

  updatedAt: string
}

export interface AddOrganizerDependentRequest {
  organizerId: string

  firstName: string

  middleName: string

  lastName: string

  suffix: string

  relationship:
    DependentRelationship

  birthDate: string

  isFullTimeStudent:
    boolean

  isPermanentlyDisabled:
    boolean

  livedWithTaxpayerAllYear:
    boolean

  monthsLivedWithTaxpayer:
    number

  usCitizenOrResident:
    boolean

  claimedByAnotherTaxpayer:
    boolean
}

export type AddOrganizerDependentResponse =
  OrganizerDependent

export interface UpdateOrganizerDependentRequest {
  organizerId: string

  dependentId: string

  firstName: string

  middleName: string

  lastName: string

  suffix: string

  relationship:
    DependentRelationship

  birthDate: string

  isFullTimeStudent:
    boolean

  isPermanentlyDisabled:
    boolean

  livedWithTaxpayerAllYear:
    boolean

  monthsLivedWithTaxpayer:
    number

  usCitizenOrResident:
    boolean

  claimedByAnotherTaxpayer:
    boolean
}

export type UpdateOrganizerDependentResponse =
  OrganizerDependent

export interface DeleteOrganizerDependentRequest {
  organizerId: string
  dependentId: string
}

export interface DeleteOrganizerDependentResponse {
  dependentId: string
  organizerId: string
  dependentName: string
  remainingDependentCount: number

  sectionStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  sectionProgressPercentage: number
  organizerProgressPercentage: number
  deletedAt: string
}