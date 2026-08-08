import {
  taxOrganizerSections,
} from "@/features/client-portal/constants/tax-organizer-sections"
import type {
  OrganizerNavigationItem,
} from "@/features/client-portal/components/organizer/workspace/organizer-workspace.types"
import type {
  TaxOrganizerSection,
  TaxOrganizerSectionKey,
} from "@/features/client-portal/types/tax-organizer.types"

const organizerRoutes:
  Record<TaxOrganizerSectionKey, string> = {
    personal:
      "/client/organizer/personal",

    identity:
      "/client/organizer/identity",

    banking:
      "/client/organizer/banking",

    dependents:
      "/client/organizer/dependents",

    income:
      "/client/organizer/income",

    business:
      "/client/organizer/business",

    rental:
      "/client/organizer/rental",

    healthcare:
      "/client/organizer/healthcare",

    education:
      "/client/organizer/education",

    deductions:
      "/client/organizer/deductions",

    documents:
      "/client/organizer/documents",

    review:
      "/client/organizer/review",

    signature:
      "/client/organizer/signature",
  }

interface GetOrganizerNavigationItemsOptions {
  sections: TaxOrganizerSection[]
  currentSectionKey:
    TaxOrganizerSectionKey
  lockFutureSections?: boolean
}

export function getOrganizerNavigationItems({
  sections,
  currentSectionKey,
  lockFutureSections = true,
}: GetOrganizerNavigationItemsOptions):
  OrganizerNavigationItem[] {
  const currentSectionIndex =
    taxOrganizerSections.findIndex(
      (section) =>
        section.key ===
        currentSectionKey,
    )

  return taxOrganizerSections.map(
    (
      sectionDefinition,
      sectionIndex,
    ) => {
      const sectionRecord =
        sections.find(
          (section) =>
            section.sectionKey ===
            sectionDefinition.key,
        )

      const completed =
        sectionRecord?.status ===
        "completed"

      const current =
        sectionDefinition.key ===
        currentSectionKey

      const locked =
        lockFutureSections &&
        sectionIndex >
          currentSectionIndex &&
        !completed

      return {
        key:
          sectionDefinition.key,

        title:
          sectionDefinition.title,

        route:
          organizerRoutes[
            sectionDefinition.key
          ],

        completed,

        current,

        locked,
      }
    },
  )
}