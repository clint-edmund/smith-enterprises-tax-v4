export type OrganizerReviewDependentRelationship =
  | "son"
  | "daughter"
  | "stepson"
  | "stepdaughter"
  | "foster_child"
  | "brother"
  | "sister"
  | "stepbrother"
  | "stepsister"
  | "half_brother"
  | "half_sister"
  | "grandchild"
  | "parent"
  | "grandparent"
  | "niece"
  | "nephew"
  | "other_relative"
  | "non_relative"

export interface OrganizerReviewDependent {
  organizerId: string

  dependentId: string

  firstName: string

  middleName:
    string | null

  lastName: string

  suffix:
    string | null

  relationship:
    OrganizerReviewDependentRelationship

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

  createdAt: string

  updatedAt: string
}
