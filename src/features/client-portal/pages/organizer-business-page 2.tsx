import {
  useState,
} from "react"

import {
  BusinessForm,
  BusinessList,
} from "@/features/client-portal/components/organizer/business"

import {
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/shared"

import {
  OrganizerPage,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"

import {
  useOrganizerBusiness,
} from "@/features/client-portal/hooks/use-organizer-business"

import type {
  OrganizerBusiness,
} from "@/features/client-portal/types/organizer-business.types"

export function OrganizerBusinessPage() {
  const {
    organizer,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    businessResponse,
    businesses,
    isLoading,
    isSavingActivity,
    isSavingBusiness,
    isDeleting,
    errorMessage,
    saveMessage,
    saveBusinessActivity,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    clearMessages,
  } = useOrganizerBusiness(
    organizerId,
  )

  const [
    editingBusiness,
    setEditingBusiness,
  ] =
    useState<OrganizerBusiness | null>(
      null,
    )

  const [
    showForm,
    setShowForm,
  ] =
    useState(false)

  const hasBusinessActivity =
    businessResponse
      ?.hasBusinessActivity ??
    null

  async function handleActivity(
    value: boolean,
  ) {
    try {
      await saveBusinessActivity({
        organizerId,
        hasBusinessActivity:
          value,
      })

      await refreshOrganizer()

      if (!value) {
        setShowForm(false)
        setEditingBusiness(null)
      }
    } catch {
      // The hook exposes the service error.
    }
  }

  async function handleCreate(
    request:
      Parameters<
        typeof createBusiness
      >[0],
  ) {
    await createBusiness(
      request,
    )

    await refreshOrganizer()

    setShowForm(false)
    setEditingBusiness(null)
  }

  async function handleUpdate(
    request:
      Parameters<
        typeof updateBusiness
      >[0],
  ) {
    await updateBusiness(
      request,
    )

    await refreshOrganizer()

    setShowForm(false)
    setEditingBusiness(null)
  }

  async function handleDelete(
    business:
      OrganizerBusiness,
  ) {
    const businessName =
      business.businessName ||
      business.dbaName ||
      "this business"

    const confirmed =
      window.confirm(
        `Delete "${businessName}"?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteBusiness({
        organizerId,
        businessId:
          business.id,
      })

      await refreshOrganizer()
    } catch {
      // The hook exposes the service error.
    }
  }

  function openAddForm() {
    clearMessages()
    setEditingBusiness(null)
    setShowForm(true)
  }

  function openEditForm(
    business:
      OrganizerBusiness,
  ) {
    clearMessages()
    setEditingBusiness(
      business,
    )
    setShowForm(true)
  }

  function closeForm() {
    if (isSavingBusiness) {
      return
    }

    clearMessages()
    setEditingBusiness(null)
    setShowForm(false)
  }

  return (
    <OrganizerPage
      sectionKey="business"
      title="Business & Self-Employment"
      description="Tell us about each business, independent-contractor activity, or other self-employment activity for this tax year."
      loadingMessage="Loading your Business organizer..."
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
            title="Business information saved"
            message={
              saveMessage
            }
          />
        )}

        {isLoading ? (
          <OrganizerLoadingState
            message="Loading your Business organizer..."
          />
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Business Activity
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Did you operate a business or receive self-employment income?
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Include sole proprietorships, independent-contractor work,
                single-member LLC activity, partnerships, corporations,
                farms, and other business activity.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={
                    isSavingActivity
                  }
                  onClick={() => {
                    void handleActivity(
                      true,
                    )
                  }}
                  className={[
                    "rounded-lg border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                    hasBusinessActivity ===
                    true
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Yes
                </button>

                <button
                  type="button"
                  disabled={
                    isSavingActivity
                  }
                  onClick={() => {
                    void handleActivity(
                      false,
                    )
                  }}
                  className={[
                    "rounded-lg border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                    hasBusinessActivity ===
                    false
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  No
                </button>
              </div>
            </section>

            {hasBusinessActivity ===
              false && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="font-semibold text-emerald-950">
                  Business section complete
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  You reported that you had no business or self-employment
                  activity for this tax year.
                </p>
              </section>
            )}

            {hasBusinessActivity ===
              true && (
              <>
                {showForm ? (
                  <BusinessForm
                    organizerId={
                      organizerId
                    }
                    business={
                      editingBusiness
                    }
                    isSaving={
                      isSavingBusiness
                    }
                    onCancel={
                      closeForm
                    }
                    onCreate={
                      handleCreate
                    }
                    onUpdate={
                      handleUpdate
                    }
                  />
                ) : (
                  <BusinessList
                    businesses={
                      businesses
                    }
                    isDeleting={
                      isDeleting
                    }
                    onAdd={
                      openAddForm
                    }
                    onEdit={
                      openEditForm
                    }
                    onDelete={(
                      business,
                    ) => {
                      void handleDelete(
                        business,
                      )
                    }}
                  />
                )}
              </>
            )}

            {hasBusinessActivity ===
              null && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="font-semibold text-amber-950">
                  Answer required
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Select Yes or No before completing this organizer section.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </OrganizerPage>
  )
}
