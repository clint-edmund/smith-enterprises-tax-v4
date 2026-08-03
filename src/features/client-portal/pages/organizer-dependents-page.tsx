import {
  useMemo,
  useState,
} from "react"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  DependentForm,
  DependentList,
} from "@/features/client-portal/components/organizer/dependents"

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
  useOrganizerDependents,
} from "@/features/client-portal/hooks/use-organizer-dependents"

import {
  calculateDependentsHealth,
} from "@/features/client-portal/services/organizer-health"

import type {
  AddOrganizerDependentRequest,
  OrganizerDependent,
  UpdateOrganizerDependentRequest,
} from "@/features/client-portal/types/organizer-dependent.types"

export function OrganizerDependentsPage() {
  const {
    organizer,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    dependents,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    saveMessage,
    addDependent,
    updateDependent,
    deleteDependent,
    clearMessages,
  } =
    useOrganizerDependents(
      organizerId,
    )

  const [
    isAdding,
    setIsAdding,
  ] = useState(false)

  const [
    selectedDependent,
    setSelectedDependent,
  ] =
    useState<OrganizerDependent | null>(
      null,
    )

  const [
    dependentToDelete,
    setDependentToDelete,
  ] =
    useState<OrganizerDependent | null>(
      null,
    )

  const dependentsHealth =
    useMemo(
      () =>
        calculateDependentsHealth({
          dependents,
        }),
      [
        dependents,
      ],
    )

  async function handleAdd(
    request:
      AddOrganizerDependentRequest,
  ) {
    await addDependent(
      request,
    )

    await refreshOrganizer()

    setIsAdding(false)
    setSelectedDependent(null)
  }

  async function handleUpdate(
    request:
      UpdateOrganizerDependentRequest,
  ) {
    await updateDependent(
      request,
    )

    await refreshOrganizer()

    setIsAdding(false)
    setSelectedDependent(null)
  }

  async function confirmDelete() {
    if (!dependentToDelete) {
      return
    }

    await deleteDependent({
      organizerId,

      dependentId:
        dependentToDelete.dependentId,
    })

    await refreshOrganizer()

    setDependentToDelete(
      null,
    )
  }

  function openAddForm() {
    clearMessages()
    setSelectedDependent(null)
    setIsAdding(true)
  }

  function handleEdit(
    dependent:
      OrganizerDependent,
  ) {
    clearMessages()

    setSelectedDependent(
      dependent,
    )

    setIsAdding(true)
  }

  function handleDelete(
    dependent:
      OrganizerDependent,
  ) {
    clearMessages()

    setDependentToDelete(
      dependent,
    )
  }

  function closeForm() {
    if (isSaving) {
      return
    }

    clearMessages()
    setIsAdding(false)
    setSelectedDependent(null)
  }

  const dependentToDeleteName =
    dependentToDelete
      ? [
          dependentToDelete.firstName,
          dependentToDelete.middleName,
          dependentToDelete.lastName,
          dependentToDelete.suffix,
        ]
          .filter(Boolean)
          .join(" ")
      : ""

  return (
    <OrganizerPage
      sectionKey="dependents"
      title="Dependents"
      description="Add each person who may qualify as a dependent on your tax return."
      loadingMessage="Loading your dependents..."
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
            title="Dependent saved"
            message={
              saveMessage
            }
          />
        )}

        {isLoading ? (
          <OrganizerLoadingState
            message="Loading your dependents..."
          />
        ) : isAdding ? (
          <DependentForm
            organizerId={
              organizerId
            }
            dependent={
              selectedDependent
            }
            isSaving={
              isSaving
            }
            onCancel={
              closeForm
            }
            onAdd={
              handleAdd
            }
            onUpdate={
              handleUpdate
            }
          />
        ) : (
          <OrganizerSectionLayout
            title="Dependent Information"
            description="Add each child, relative, or other person who may qualify as a dependent for this tax year."
            health={
              <OrganizerHealthBanner
                health={
                  dependentsHealth
                }
              />
            }
          >
            <DependentList
              dependents={
                dependents
              }
              onAdd={
                openAddForm
              }
              onEdit={
                handleEdit
              }
              onDelete={
                handleDelete
              }
            />
          </OrganizerSectionLayout>
        )}

        {dependentToDelete && (
          <OrganizerDeleteDialog
            title="Delete Dependent?"
            message={`Are you sure you want to delete ${dependentToDeleteName}? This also removes any dependent-level Secure Vault records associated with this dependent. This action cannot be undone.`}
            isDeleting={
              isDeleting
            }
            onCancel={() => {
              setDependentToDelete(
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
