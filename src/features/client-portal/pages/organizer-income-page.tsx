import {
  useState,
} from "react"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  IncomeSourceForm,
  IncomeSourceList,
  IncomeTypeSelector,
  IncomeW2Form,
} from "@/features/client-portal/components/organizer/income"

import {
  OrganizerDeleteDialog,
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/shared"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerIncome,
} from "@/features/client-portal/hooks/use-organizer-income"

import type {
  CreateIncomeSourceRequest,
  IncomeType,
  OrganizerIncomeSource,
  SaveIncomeW2DetailsRequest,
  UpdateIncomeSourceRequest,
} from "@/features/client-portal/types/organizer-income.types"

type IncomePageMode =
  | "list"
  | "select_type"
  | "source_form"
  | "w2_form"

export function OrganizerIncomePage() {
  const {
    organizer,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    incomeSources,
    selectedW2Details,
    isLoading,
    isLoadingW2,
    isSaving,
    isSavingW2,
    isDeleting,
    errorMessage,
    saveMessage,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    loadW2Details,
    saveW2Details,
    clearSelectedW2Details,
    clearMessages,
  } =
    useOrganizerIncome(
      organizerId,
    )

  const [
    mode,
    setMode,
  ] =
    useState<IncomePageMode>(
      "list",
    )

  const [
    selectedIncomeType,
    setSelectedIncomeType,
  ] =
    useState<IncomeType | null>(
      null,
    )

  const [
    selectedIncomeSource,
    setSelectedIncomeSource,
  ] =
    useState<OrganizerIncomeSource | null>(
      null,
    )

  const [
    incomeSourceToDelete,
    setIncomeSourceToDelete,
  ] =
    useState<OrganizerIncomeSource | null>(
      null,
    )

  function returnToList() {
    clearSelectedW2Details()
    setSelectedIncomeSource(null)
    setSelectedIncomeType(null)
    setMode("list")
  }

  function beginAddIncomeSource() {
    clearMessages()
    clearSelectedW2Details()
    setSelectedIncomeSource(null)
    setSelectedIncomeType(null)
    setMode("select_type")
  }

  function handleIncomeTypeSelect(
    incomeType:
      IncomeType,
  ) {
    clearMessages()
    setSelectedIncomeType(
      incomeType,
    )
    setSelectedIncomeSource(null)
    setMode("source_form")
  }

  async function handleCreateIncomeSource(
    request:
      CreateIncomeSourceRequest,
  ) {
    const result =
      await createIncomeSource(
        request,
      )

    await refreshOrganizer()

    setSelectedIncomeSource(
      result,
    )

    setSelectedIncomeType(
      result.incomeType,
    )

    if (
      result.incomeType ===
      "w2"
    ) {
      clearSelectedW2Details()
      setMode("w2_form")

      return
    }

    returnToList()
  }

  async function handleUpdateIncomeSource(
    request:
      UpdateIncomeSourceRequest,
  ) {
    const result =
      await updateIncomeSource(
        request,
      )

    await refreshOrganizer()

    setSelectedIncomeSource(
      result,
    )

    setSelectedIncomeType(
      result.incomeType,
    )

    if (
      result.incomeType ===
      "w2"
    ) {
      await loadW2Details(
        result.incomeSourceId,
      )

      setMode("w2_form")

      return
    }

    returnToList()
  }

  async function handleEditIncomeSource(
    incomeSource:
      OrganizerIncomeSource,
  ) {
    clearMessages()
    clearSelectedW2Details()

    setSelectedIncomeSource(
      incomeSource,
    )

    setSelectedIncomeType(
      incomeSource.incomeType,
    )

    setMode(
      "source_form",
    )
  }

  function handleDeleteIncomeSource(
    incomeSource:
      OrganizerIncomeSource,
  ) {
    clearMessages()

    setIncomeSourceToDelete(
      incomeSource,
    )
  }

  async function confirmDeleteIncomeSource() {
    if (
      !incomeSourceToDelete
    ) {
      return
    }

    await deleteIncomeSource({
      organizerId,

      incomeSourceId:
        incomeSourceToDelete
          .incomeSourceId,
    })

    await refreshOrganizer()

    setIncomeSourceToDelete(
      null,
    )

    if (
      selectedIncomeSource
        ?.incomeSourceId ===
      incomeSourceToDelete
        .incomeSourceId
    ) {
      returnToList()
    }
  }

  async function handleSaveW2(
    request:
      SaveIncomeW2DetailsRequest,
  ) {
    await saveW2Details(
      request,
    )

    await refreshOrganizer()

    returnToList()
  }

  const activeIncomeType =
    selectedIncomeSource
      ?.incomeType ??
    selectedIncomeType

  return (
    <OrganizerPage
      sectionKey="income"
      title="Income"
      description="Add each W-2, 1099, retirement statement, benefit statement, or other source of income for this tax year."
      loadingMessage="Loading your income information..."
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
            title="Income information saved"
            message={
              saveMessage
            }
          />
        )}

        {isLoading ? (
          <OrganizerLoadingState
            message="Loading your income sources..."
          />
        ) : mode ===
          "select_type" ? (
          <IncomeTypeSelector
            selectedType={
              selectedIncomeType
            }
            disabled={
              isSaving
            }
            onSelect={
              handleIncomeTypeSelect
            }
            onCancel={
              returnToList
            }
          />
        ) : mode ===
            "source_form" &&
          activeIncomeType ? (
          <IncomeSourceForm
            organizerId={
              organizerId
            }
            incomeType={
              activeIncomeType
            }
            incomeSource={
              selectedIncomeSource
            }
            isSaving={
              isSaving
            }
            onCancel={
              returnToList
            }
            onCreate={
              handleCreateIncomeSource
            }
            onUpdate={
              handleUpdateIncomeSource
            }
          />
        ) : mode ===
            "w2_form" &&
          selectedIncomeSource &&
          selectedIncomeSource.incomeType ===
            "w2" ? (
          <IncomeW2Form
            organizerId={
              organizerId
            }
            incomeSource={
              selectedIncomeSource
            }
            w2Details={
              selectedW2Details
            }
            isLoading={
              isLoadingW2
            }
            isSaving={
              isSavingW2
            }
            onCancel={
              returnToList
            }
            onSave={
              handleSaveW2
            }
          />
        ) : (
          <IncomeSourceList
            incomeSources={
              incomeSources
            }
            onAdd={
              beginAddIncomeSource
            }
            onEdit={
              handleEditIncomeSource
            }
            onDelete={
              handleDeleteIncomeSource
            }
          />
        )}

        {incomeSourceToDelete && (
          <OrganizerDeleteDialog
            title="Delete Income Source?"
            message={`Are you sure you want to delete ${incomeSourceToDelete.payerName}? Any form-specific details associated with this income source will also be removed.`}
            isDeleting={
              isDeleting
            }
            onCancel={() => {
              setIncomeSourceToDelete(
                null,
              )
            }}
            onConfirm={() => {
              void confirmDeleteIncomeSource()
            }}
          />
        )}
      </div>
    </OrganizerPage>
  )
}
