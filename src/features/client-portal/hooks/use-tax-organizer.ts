import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getOrCreateClientTaxOrganizer,
} from "@/features/client-portal/services/tax-organizer-service"
import type {
  TaxOrganizerSection,
  TaxOrganizerSectionKey,
  TaxOrganizerSummary,
} from "@/features/client-portal/types/tax-organizer.types"

interface UseTaxOrganizerResult {
  summary: TaxOrganizerSummary | null
  currentSection: TaxOrganizerSection | null
  isLoading: boolean
  errorMessage: string | null
  refresh: () => Promise<void>
}

export function useTaxOrganizer(
  taxYear: number,
): UseTaxOrganizerResult {
  const [
    summary,
    setSummary,
  ] = useState<TaxOrganizerSummary | null>(
    null,
  )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const loadOrganizer =
    useCallback(async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrCreateClientTaxOrganizer(
            taxYear,
          )

        setSummary(result)
      } catch (error) {
        console.error(
          "Unable to load the client tax organizer:",
          error,
        )

        setSummary(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the tax organizer.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [taxYear])

  useEffect(() => {
    void loadOrganizer()
  }, [loadOrganizer])

  const currentSection =
    useMemo(() => {
      if (!summary) {
        return null
      }

      return (
        summary.sections.find(
          (section) =>
            section.sectionKey ===
            summary.organizer.currentSection,
        ) ?? null
      )
    }, [summary])

  return {
    summary,
    currentSection,
    isLoading,
    errorMessage,
    refresh: loadOrganizer,
  }
}

export function findOrganizerSection(
  summary: TaxOrganizerSummary,
  sectionKey: TaxOrganizerSectionKey,
): TaxOrganizerSection | null {
  return (
    summary.sections.find(
      (section) =>
        section.sectionKey ===
        sectionKey,
    ) ?? null
  )
}