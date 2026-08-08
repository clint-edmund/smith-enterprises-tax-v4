import type {
  TaxOrganizerSectionKey,
} from "@/features/client-portal/types/tax-organizer.types"

export interface TaxOrganizerSectionDefinition {
  key: TaxOrganizerSectionKey
  title: string
  description: string
  isRequired: boolean
}

export const taxOrganizerSections: TaxOrganizerSectionDefinition[] = [
  {
    key: "personal",
    title: "Personal Information",
    description:
      "Review your contact information, address, filing status, and occupation.",
    isRequired: true,
  },
  {
    key: "identity",
    title: "Identity Verification",
    description:
      "Provide the identity information required to prepare your return.",
    isRequired: true,
  },
  {
    key: "banking",
    title: "Bank Information",
    description:
      "Provide direct-deposit or payment information when applicable.",
    isRequired: false,
  },
  {
    key: "dependents",
    title: "Dependents",
    description:
      "Tell us about children or other qualifying dependents.",
    isRequired: false,
  },
  {
    key: "income",
    title: "Income",
    description:
      "Identify wages, retirement, investment, and other income sources.",
    isRequired: true,
  },
  {
    key: "business",
    title: "Business",
    description:
      "Provide self-employment or business income and expense information.",
    isRequired: false,
  },
  {
    key: "rental",
    title: "Rental Property",
    description:
      "Provide rental income, expenses, and property information.",
    isRequired: false,
  },
  {
    key: "healthcare",
    title: "Healthcare",
    description:
      "Provide marketplace insurance, HSA, and related information.",
    isRequired: false,
  },
  {
    key: "education",
    title: "Education",
    description:
      "Provide tuition, student-loan, and education-credit information.",
    isRequired: false,
  },
  {
    key: "deductions",
    title: "Deductions and Credits",
    description:
      "Identify expenses and tax benefits that may apply.",
    isRequired: false,
  },
  {
    key: "documents",
    title: "Documents",
    description:
      "Upload tax forms and supporting documents securely.",
    isRequired: true,
  },
  {
    key: "review",
    title: "Review",
    description:
      "Review your organizer for completeness before submission.",
    isRequired: true,
  },
  {
    key: "signature",
    title: "Signature",
    description:
      "Complete required acknowledgments and electronic signatures.",
    isRequired: true,
  },
]