import {
  useMemo,
  useState,
} from "react"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  HealthcareCoverageList,
  HealthcareDialog,
} from "@/features/client-portal/components/organizer/healthcare"

import {
  OrganizerDeleteDialog,
  OrganizerHealthBanner,
  OrganizerLoadingState,
  OrganizerSectionLayout,
} from "@/features/client-portal/components/organizer/shared"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerHealthcare,
} from "@/features/client-portal/hooks/use-organizer-healthcare"

import {
  calculateHealthcareHealth,
} from "@/features/client-portal/services/organizer-health"

import type {
  CreateOrganizerHealthcareCoverageRequest,
  OrganizerHealthcareCoverage,
  UpdateOrganizerHealthcareCoverageRequest,
} from "@/features/client-portal/types/organizer-healthcare.types"

export function HealthcarePage() {
  const {
    organizer,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    coverages,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    saveMessage,
    createCoverage,
    updateCoverage,
    deleteCoverage,
    clearMessages,
  } =
    useOrganizerHealthcare(
      organizerId,
    )

  const [
    isDialogOpen,
    setIsDialogOpen,
  ] =
    useState(false)

  const [
    selectedCoverage,
    setSelectedCoverage,
  ] =
    useState<OrganizerHealthcareCoverage | null>(
      null,
    )

  const [
    coverageToDelete,
    setCoverageToDelete,
  ] =
    useState<OrganizerHealthcareCoverage | null>(
      null,
    )

  const healthcareHealth =
    useMemo(
      () =>
        calculateHealthcareHealth({
          coverages,
        }),
      [
        coverages,
      ],
    )

  function openCreateDialog() {
    clearMessages()
    setSelectedCoverage(null)
    setIsDialogOpen(true)
  }

  function openEditDialog(
    coverage:
      OrganizerHealthcareCoverage,
  ) {
    clearMessages()
    setSelectedCoverage(
      coverage,
    )
    setIsDialogOpen(true)
  }

  function closeDialog() {
    if (isSaving) {
      return
    }

    setIsDialogOpen(false)
    setSelectedCoverage(null)
  }

  function requestDelete(
    coverage:
      OrganizerHealthcareCoverage,
  ) {
    clearMessages()
    setCoverageToDelete(
      coverage,
    )
  }

  async function handleCreate(
    request:
      CreateOrganizerHealthcareCoverageRequest,
  ) {
    await createCoverage(
      request,
    )

    await refreshOrganizer()

    setIsDialogOpen(false)
    setSelectedCoverage(null)
  }

  async function handleUpdate(
    request:
      UpdateOrganizerHealthcareCoverageRequest,
  ) {
    await updateCoverage(
      request,
    )

    await refreshOrganizer()

    setIsDialogOpen(false)
    setSelectedCoverage(null)
  }

  async function confirmDelete() {
    if (!coverageToDelete) {
      return
    }

    await deleteCoverage({
      organizerId,

      coverageId:
        coverageToDelete.coverageId,
    })

    await refreshOrganizer()

    setCoverageToDelete(null)
  }

  return (
    <OrganizerPage
      sectionKey="healthcare"
      title="Healthcare"
      description="Review healthcare coverage and supporting insurance documents for this tax year."
      loadingMessage="Loading healthcare information..."
    >
      <div className="space-y-8">
        {errorMessage && (
          <OrganizerValidationSummary
            variant="error"
            title="Unable to complete the request"
            message={
              errorMessage
            }
          />
        )}

        {saveMessage && (
          <OrganizerValidationSummary
            variant="success"
            title="Healthcare information saved"
            message={
              saveMessage
            }
          />
        )}

        {isLoading ? (
          <OrganizerLoadingState
            message="Loading healthcare coverage..."
          />
        ) : (
          <OrganizerSectionLayout
            title="Healthcare Coverage"
            description="Add each healthcare policy or government coverage source that applied during the tax year."
            health={
              <OrganizerHealthBanner
                health={
                  healthcareHealth
                }
              />
            }
          >
            <HealthcareCoverageList
              coverages={
                coverages
              }
              onAdd={
                openCreateDialog
              }
              onEdit={
                openEditDialog
              }
              onDelete={
                requestDelete
              }
            />
          </OrganizerSectionLayout>
        )}

        <HealthcareDialog
          isOpen={
            isDialogOpen
          }
          organizerId={
            organizerId
          }
          coverage={
            selectedCoverage
          }
          isSaving={
            isSaving
          }
          onClose={
            closeDialog
          }
          onCreate={
            handleCreate
          }
          onUpdate={
            handleUpdate
          }
        />

        {coverageToDelete && (
          <OrganizerDeleteDialog
            title="Delete Healthcare Coverage?"
            message={`Are you sure you want to delete ${coverageToDelete.providerName} coverage for ${coverageToDelete.coveredPersonName}? This action cannot be undone.`}
            isDeleting={
              isDeleting
            }
            onCancel={() => {
              setCoverageToDelete(
                null,
              )
            }}
            onConfirm={() => {
              void confirmDelete()
            }}
          />
        )}
      </div>
    </OrganizerPage>
  )
}
