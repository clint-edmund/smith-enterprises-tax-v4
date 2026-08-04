import {
  useState,
} from "react"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  Income1099DivForm,
  Income1099IntForm,
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

import {
  useOrganizerIncome1099Div,
} from "@/features/client-portal/hooks/use-organizer-income-1099-div"

import {
  useOrganizerIncome1099Int,
} from "@/features/client-portal/hooks/use-organizer-income-1099-int"

import type {
  SaveOrganizerIncome1099DivRequest,
  SaveOrganizerIncome1099IntRequest,
} from "@/features/client-portal/types/organizer-income-1099.types"

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
  | "1099_int_form"
  | "1099_div_form"

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

  const {
    details:
      selected1099IntDetails,
    isLoading:
      isLoading1099Int,
    isSaving:
      isSaving1099Int,
    errorMessage:
      error1099Int,
    load:
      load1099IntDetails,
    save:
      save1099IntDetails,
    clear:
      clear1099IntDetails,
  } =
    useOrganizerIncome1099Int()

  const {
    details:
      selected1099DivDetails,
    isLoading:
      isLoading1099Div,
    isSaving:
      isSaving1099Div,
    errorMessage:
      error1099Div,
    load:
      load1099DivDetails,
    save:
      save1099DivDetails,
    clear:
      clear1099DivDetails,
  } =
    useOrganizerIncome1099Div()

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

  function clearDetailSelections() {
    clearSelectedW2Details()
    clear1099IntDetails()
    clear1099DivDetails()
  }

  function returnToList() {
    clearDetailSelections()
    setSelectedIncomeSource(null)
    setSelectedIncomeType(null)
    setMode("list")
  }

  function beginAddIncomeSource() {
    clearMessages()
    clearDetailSelections()
    setSelectedIncomeSource(null)
    setSelectedIncomeType(null)
    setMode("select_type")
  }

  function handleIncomeTypeSelect(
    incomeType:
      IncomeType,
  ) {
    clearMessages()
    clearDetailSelections()

    setSelectedIncomeType(
      incomeType,
    )

    setSelectedIncomeSource(null)
    setMode("source_form")
  }

  async function openDetailForm(
    incomeSource:
      OrganizerIncomeSource,
    loadExisting:
      boolean,
  ) {
    if (
      incomeSource.incomeType ===
      "w2"
    ) {
      if (loadExisting) {
        await loadW2Details(
          incomeSource.incomeSourceId,
        )
      } else {
        clearSelectedW2Details()
      }

      setMode("w2_form")
      return
    }

    if (
      incomeSource.incomeType ===
      "1099_int"
    ) {
      if (loadExisting) {
        await load1099IntDetails(
          organizerId,
          incomeSource.incomeSourceId,
        )
      } else {
        clear1099IntDetails()
      }

      setMode(
        "1099_int_form",
      )
      return
    }

    if (
      incomeSource.incomeType ===
      "1099_div"
    ) {
      if (loadExisting) {
        await load1099DivDetails(
          organizerId,
          incomeSource.incomeSourceId,
        )
      } else {
        clear1099DivDetails()
      }

      setMode(
        "1099_div_form",
      )
      return
    }

    returnToList()
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

    await openDetailForm(
      result,
      false,
    )
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

    await openDetailForm(
      result,
      true,
    )
  }

  function handleEditIncomeSource(
    incomeSource:
      OrganizerIncomeSource,
  ) {
    clearMessages()
    clearDetailSelections()

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

  async function handleSave1099Int(
    request:
      SaveOrganizerIncome1099IntRequest,
  ) {
    await save1099IntDetails(
      request,
    )

    await refreshOrganizer()

    returnToList()
  }

  async function handleSave1099Div(
    request:
      SaveOrganizerIncome1099DivRequest,
  ) {
    await save1099DivDetails(
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
        ) : mode ===
            "1099_int_form" &&
          selectedIncomeSource &&
          selectedIncomeSource.incomeType ===
            "1099_int" ? (
          <Income1099IntForm
            organizerId={
              organizerId
            }
            incomeSource={
              selectedIncomeSource
            }
            details={
              selected1099IntDetails
            }
            isLoading={
              isLoading1099Int
            }
            isSaving={
              isSaving1099Int
            }
            errorMessage={
              error1099Int
            }
            onCancel={
              returnToList
            }
            onSave={
              handleSave1099Int
            }
          />
        ) : mode ===
            "1099_div_form" &&
          selectedIncomeSource &&
          selectedIncomeSource.incomeType ===
            "1099_div" ? (
          <Income1099DivForm
            organizerId={
              organizerId
            }
            incomeSource={
              selectedIncomeSource
            }
            details={
              selected1099DivDetails
            }
            isLoading={
              isLoading1099Div
            }
            isSaving={
              isSaving1099Div
            }
            errorMessage={
              error1099Div
            }
            onCancel={
              returnToList
            }
            onSave={
              handleSave1099Div
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
