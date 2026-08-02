import {
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
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerDependents,
} from "@/features/client-portal/hooks/use-organizer-dependents"

import type {
  AddOrganizerDependentRequest,
  OrganizerDependent,
  UpdateOrganizerDependentRequest,
} from "@/features/client-portal/types/organizer-dependent.types"

import {
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/shared"

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
            onCancel={() => {
              clearMessages()
              setIsAdding(false)
              setSelectedDependent(null)
            }}
            onAdd={
              handleAdd
            }
            onUpdate={
              handleUpdate
            }
          />
        ) : (
          <DependentList
            dependents={
              dependents
            }
            onAdd={() => {
              clearMessages()
              setSelectedDependent(null)
              setIsAdding(true)
            }}
            onEdit={
              handleEdit
            }
            onDelete={
              handleDelete
            }
          />
        )}
        {dependentToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dependent-title"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2
                id="delete-dependent-title"
                className="text-xl font-semibold text-slate-950"
              >
                Delete Dependent?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  {dependentToDelete.firstName}{" "}
                  {dependentToDelete.lastName}
                </span>
                ? This also removes any dependent-level Secure Vault records associated
                with this dependent.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setDependentToDelete(
                      null,
                    )
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    void confirmDelete()
                  }}
                  className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting
                    ? "Deleting..."
                    : "Delete Dependent"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerPage>
  )
}