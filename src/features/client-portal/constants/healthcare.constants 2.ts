import type {
  HealthcareCoverageType,
  HealthcareDocumentType,
} from "@/features/client-portal/types/organizer-healthcare.types"

export const healthcareCoverageMetadata:
  Record<
    HealthcareCoverageType,
    {
      title: string
      shortTitle: string
    }
  > = {
  employer: {
    title: "Employer Sponsored",
    shortTitle: "Employer",
  },

  marketplace: {
    title: "Marketplace (1095-A)",
    shortTitle: "Marketplace",
  },

  medicare: {
    title: "Medicare",
    shortTitle: "Medicare",
  },

  medicaid: {
    title: "Medicaid",
    shortTitle: "Medicaid",
  },

  cobra: {
    title: "COBRA",
    shortTitle: "COBRA",
  },

  private: {
    title: "Private Insurance",
    shortTitle: "Private",
  },

  military: {
    title: "Military / TRICARE",
    shortTitle: "Military",
  },

  other: {
    title: "Other Coverage",
    shortTitle: "Other",
  },
}

export const healthcareDocumentMetadata:
  Record<
    HealthcareDocumentType,
    {
      title: string
    }
  > = {
  "1095_a": {
    title: "Form 1095-A",
  },

  "1095_b": {
    title: "Form 1095-B",
  },

  "1095_c": {
    title: "Form 1095-C",
  },

  insurance_card: {
    title: "Insurance Card",
  },

  other: {
    title: "Other Document",
  },
}