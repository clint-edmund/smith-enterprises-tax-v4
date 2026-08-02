import {
  useMemo,
  type ReactNode,
} from "react"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"
import {
  getOrganizerNavigationItems,
} from "@/features/client-portal/services/organizer-navigation-service"
import type {
  TaxOrganizerSectionKey,
} from "@/features/client-portal/types/tax-organizer.types"

import {
  OrganizerErrorState,
} from "./organizer-error-state"
import {
  OrganizerLoadingState,
} from "./organizer-loading-state"
import {
  OrganizerWorkspace,
} from "./workspace/organizer-workspace"

interface OrganizerPageProps {
  sectionKey:
    TaxOrganizerSectionKey

  title: string

  description: string

  children:
    ReactNode

  loadingMessage?: string
}

export function OrganizerPage({
  sectionKey,
  title,
  description,
  children,
  loadingMessage =
    "Loading your tax organizer...",
}: OrganizerPageProps) {
  const {
    taxYear,
    summary,
    progress,
    completedSections,
    totalSections,
    isLoading,
    errorMessage,
    refreshOrganizer,
  } = useOrganizer()

  const navigationItems =
    useMemo(
      () =>
        getOrganizerNavigationItems({
          sections:
            summary?.sections ??
            [],

          currentSectionKey:
            sectionKey,
        }),
      [
        sectionKey,
        summary,
      ],
    )

  if (isLoading) {
    return (
      <OrganizerLoadingState
        message={
          loadingMessage
        }
      />
    )
  }

  if (errorMessage) {
    return (
      <OrganizerErrorState
        message={errorMessage}
        onRetry={() => {
          void refreshOrganizer()
        }}
      />
    )
  }

  return (
    <OrganizerWorkspace
      title={title}
      description={
        description
      }
      taxYear={taxYear}
      progress={progress}
      completedSections={
        completedSections
      }
      totalSections={
        totalSections
      }
      currentSectionTitle={
        title
      }
      navigationItems={
        navigationItems
      }
    >
      {children}
    </OrganizerWorkspace>
  )
}