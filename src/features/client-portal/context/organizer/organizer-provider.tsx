import {
  useMemo,
  type PropsWithChildren,
} from "react"

import {
  OrganizerContext,
  type OrganizerContextValue,
} from "@/features/client-portal/context/organizer/organizer-context"
import {
  useTaxOrganizer,
} from "@/features/client-portal/hooks/use-tax-organizer"

interface OrganizerProviderProps
  extends PropsWithChildren {
  taxYear?: number
}

export function OrganizerProvider({
  children,
  taxYear =
    new Date().getFullYear(),
}: OrganizerProviderProps) {
  const {
    summary,
    currentSection,
    isLoading,
    errorMessage,
    refresh,
  } = useTaxOrganizer(
    taxYear,
  )

  const organizer =
    summary?.organizer ?? null

  const progress =
    organizer?.progressPercentage ?? 0

  const completedSections =
    summary?.completedSections ?? 0

  const totalSections =
    summary?.totalSections ?? 13

  const remainingSections =
    Math.max(
      totalSections -
        completedSections,
      0,
    )

  const contextValue =
    useMemo<OrganizerContextValue>(
      () => ({
        taxYear,
        summary,
        organizer,
        currentSection,
        progress,
        completedSections,
        totalSections,
        remainingSections,
        isLoading,
        errorMessage,
        refreshOrganizer:
          refresh,
      }),
      [
        taxYear,
        summary,
        organizer,
        currentSection,
        progress,
        completedSections,
        totalSections,
        remainingSections,
        isLoading,
        errorMessage,
        refresh,
      ],
    )

  return (
    <OrganizerContext.Provider
      value={contextValue}
    >
      {children}
    </OrganizerContext.Provider>
  )
}