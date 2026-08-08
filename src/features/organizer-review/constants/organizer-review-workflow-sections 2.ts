export type OrganizerReviewWorkflowSectionKey =
  | "healthcare"
  | "income"
  | "dependents"
  | "investments"
  | "education"
  | "business"
  | "documents"

export interface OrganizerReviewWorkflowSectionDefinition {
  key:
    OrganizerReviewWorkflowSectionKey

  title: string

  description: string

  routeSegment: string

  isRequiredForPreparation:
    boolean

  displayOrder: number
}

export const organizerReviewWorkflowSections:
  readonly OrganizerReviewWorkflowSectionDefinition[] = [
    {
      key:
        "healthcare",

      title:
        "Healthcare",

      description:
        "Review healthcare coverage and supporting documents.",

      routeSegment:
        "healthcare",

      isRequiredForPreparation:
        true,

      displayOrder:
        10,
    },

    {
      key:
        "income",

      title:
        "Income",

      description:
        "Review reported income sources and supporting documents.",

      routeSegment:
        "income",

      isRequiredForPreparation:
        true,

      displayOrder:
        20,
    },

    {
      key:
        "dependents",

      title:
        "Dependents",

      description:
        "Review dependent identity, residency, and eligibility information.",

      routeSegment:
        "dependents",

      isRequiredForPreparation:
        true,

      displayOrder:
        30,
    },

    {
      key:
        "investments",

      title:
        "Investments",

      description:
        "Review investment income and brokerage documentation.",

      routeSegment:
        "investments",

      isRequiredForPreparation:
        true,

      displayOrder:
        40,
    },

    {
      key:
        "education",

      title:
        "Education",

      description:
        "Review tuition, student, and education-credit information.",

      routeSegment:
        "education",

      isRequiredForPreparation:
        true,

      displayOrder:
        50,
    },

    {
      key:
        "business",

      title:
        "Business",

      description:
        "Review self-employment and business activity information.",

      routeSegment:
        "business",

      isRequiredForPreparation:
        true,

      displayOrder:
        60,
    },

    {
      key:
        "documents",

      title:
        "Documents",

      description:
        "Review required tax documents and uploaded files.",

      routeSegment:
        "documents",

      isRequiredForPreparation:
        true,

      displayOrder:
        70,
    },
  ]
