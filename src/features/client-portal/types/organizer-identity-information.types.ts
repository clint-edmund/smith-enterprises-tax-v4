export type OrganizerIdentificationType =
  | "drivers_license"
  | "state_id"
  | "passport"
  | "military_id"
  | "other"
  | ""

export type OrganizerCitizenshipStatus =
  | "us_citizen"
  | "resident_alien"
  | "nonresident_alien"
  | "dual_citizen"
  | "other"
  | ""

export interface OrganizerIdentityInformation {
  organizerId: string

  identificationType:
    OrganizerIdentificationType

  identificationState: string

  identificationIssueDate:
    string | null

  identificationExpirationDate:
    string | null

  citizenshipStatus:
    OrganizerCitizenshipStatus

  isUsCitizen: boolean | null

  hasGovernmentPhotoId:
    boolean | null

  hasIdentityChanged:
    boolean | null

  createdAt: string
  updatedAt: string
}