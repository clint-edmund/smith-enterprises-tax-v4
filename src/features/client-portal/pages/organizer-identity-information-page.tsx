import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  OrganizerCitizenshipStatusSelect,
} from "@/features/client-portal/components/organizer/organizer-citizenship-status-select"
import {
  OrganizerDateField,
} from "@/features/client-portal/components/organizer/organizer-date-field"
import {
  OrganizerErrorState,
} from "@/features/client-portal/components/organizer/organizer-error-state"
import {
  OrganizerIdentificationTypeSelect,
} from "@/features/client-portal/components/organizer/organizer-identification-type-select"
import {
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/organizer-loading-state"
import {
  OrganizerSaveBar,
} from "@/features/client-portal/components/organizer/organizer-save-bar"
import {
  OrganizerSection,
} from "@/features/client-portal/components/organizer/organizer-section"
import {
  OrganizerStateSelect,
} from "@/features/client-portal/components/organizer/organizer-state-select"
import {
  OrganizerYesNoQuestion,
} from "@/features/client-portal/components/organizer/organizer-yes-no-question"
import {
  OrganizerWorkspace,
} from "@/features/client-portal/components/organizer/workspace/organizer-workspace"
import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"
import {
  useOrganizerIdentityInformation,
} from "@/features/client-portal/hooks/use-organizer-identity-information"
import {
  getOrganizerNavigationItems,
} from "@/features/client-portal/services/organizer-navigation-service"
import type {
  SaveOrganizerIdentityInformationRequest,
} from "@/features/client-portal/services/organizer-identity-information-service"
import type {
  OrganizerCitizenshipStatus,
  OrganizerIdentificationType,
} from "@/features/client-portal/types/organizer-identity-information.types"
import {
  hasOrganizerIdentityValidationErrors,
  type OrganizerIdentityValidationErrors,
  validateOrganizerIdentityInformation,
} from "@/features/client-portal/utils/organizer-identity-validation"

import {
  SecureIdentitySection,
} from "@/features/client-portal/components/secure-identity-section"

interface IdentityFormState {
  identificationType:
    OrganizerIdentificationType

  identificationState: string

  identificationIssueDate: string

  identificationExpirationDate: string

  citizenshipStatus:
    OrganizerCitizenshipStatus

  isUsCitizen: boolean | null

  hasGovernmentPhotoId:
    boolean | null

  hasIdentityChanged:
    boolean | null
}

const emptyForm: IdentityFormState = {
  identificationType: "",
  identificationState: "",
  identificationIssueDate: "",
  identificationExpirationDate: "",
  citizenshipStatus: "",
  isUsCitizen: null,
  hasGovernmentPhotoId: null,
  hasIdentityChanged: null,
}

export function OrganizerIdentityInformationPage() {
  const {
    taxYear,
    summary,
    organizer,
    progress,
    completedSections,
    totalSections,
    isLoading,
    errorMessage,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    identityInformation,
    isLoading:
      isIdentityLoading,
    isSaving,
    errorMessage:
      identityError,
    saveMessage,
    refresh:
      refreshIdentity,
    save,
  } =
    useOrganizerIdentityInformation(
      organizerId,
    )

  const [
    form,
    setForm,
  ] =
    useState<IdentityFormState>(
      emptyForm,
    )

  const [
    initialForm,
    setInitialForm,
  ] =
    useState<IdentityFormState>(
      emptyForm,
    )

  const [
    validationErrors,
    setValidationErrors,
  ] =
    useState<OrganizerIdentityValidationErrors>(
      {},
    )

  const [
    pageMessage,
    setPageMessage,
  ] = useState<string | null>(
    null,
  )

  const validationSummaryRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  useEffect(() => {
    if (!identityInformation) {
      return
    }

    const nextForm:
      IdentityFormState = {
        identificationType:
          identityInformation.identificationType,

        identificationState:
          identityInformation.identificationState,

        identificationIssueDate:
          identityInformation.identificationIssueDate ??
          "",

        identificationExpirationDate:
          identityInformation.identificationExpirationDate ??
          "",

        citizenshipStatus:
          identityInformation.citizenshipStatus,

        isUsCitizen:
          identityInformation.isUsCitizen,

        hasGovernmentPhotoId:
          identityInformation.hasGovernmentPhotoId,

        hasIdentityChanged:
          identityInformation.hasIdentityChanged,
      }

    setForm(nextForm)
    setInitialForm(nextForm)
    setValidationErrors({})
  }, [identityInformation])

  const hasUnsavedChanges =
    useMemo(
      () =>
        JSON.stringify(form) !==
        JSON.stringify(initialForm),
      [
        form,
        initialForm,
      ],
    )

  const navigationItems =
    useMemo(
      () =>
        getOrganizerNavigationItems({
          sections:
            summary?.sections ?? [],

          currentSectionKey:
            organizer?.currentSection ??
            "identity",
        }),
      [
        summary,
        organizer,
      ],
    )

  function updateField<
    Field extends keyof IdentityFormState,
  >(
    field: Field,
    value:
      IdentityFormState[Field],
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    )

    setValidationErrors(
      (currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }),
    )

    setPageMessage(null)
  }

  function createSaveRequest():
    SaveOrganizerIdentityInformationRequest {
    return {
      organizerId,

      identificationType:
        form.identificationType,

      identificationState:
        form.identificationState,

      identificationIssueDate:
        form.identificationIssueDate ||
        null,

      identificationExpirationDate:
        form.identificationExpirationDate ||
        null,

      citizenshipStatus:
        form.citizenshipStatus,

      isUsCitizen:
        form.isUsCitizen,

      hasGovernmentPhotoId:
        form.hasGovernmentPhotoId,

      hasIdentityChanged:
        form.hasIdentityChanged,
    }
  }

  async function handleSave(
    continueAfterSave: boolean,
  ) {
    setPageMessage(null)

    const request =
      createSaveRequest()

    const errors =
      validateOrganizerIdentityInformation(
        request,
      )

    if (
      request.identificationIssueDate &&
      request.identificationExpirationDate &&
      request.identificationExpirationDate <
        request.identificationIssueDate
    ) {
      errors.identificationExpirationDate =
        "Expiration date cannot be before the issue date."
    }

    setValidationErrors(errors)

    if (
      hasOrganizerIdentityValidationErrors(
        errors,
      )
    ) {
      setPageMessage(
        "Review the highlighted identity fields before saving.",
      )

      requestAnimationFrame(() => {
        validationSummaryRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "center",
          },
        )
      })

      return
    }

    try {
      const result =
        await save(request)

      await Promise.all([
        refreshOrganizer(),
        refreshIdentity(),
      ])

      setInitialForm(form)

      if (continueAfterSave) {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Identity Verification is complete. Banking Information is the next organizer section."
            : "Your identity draft was saved. Complete the remaining required fields before continuing.",
        )
      } else {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Identity Verification was saved and marked complete."
            : "Your Identity Verification draft was saved.",
        )
      }
    } catch {
      // The identity hook exposes the service error through identityError.
    }
  }

  if (isLoading) {
    return (
      <OrganizerLoadingState message="Loading your tax organizer..." />
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

  if (isIdentityLoading) {
    return (
      <OrganizerLoadingState message="Loading your identity information..." />
    )
  }

  if (
    identityError &&
    !identityInformation
  ) {
    return (
      <OrganizerErrorState
        title="Unable to load identity information"
        message={identityError}
        onRetry={() => {
          void refreshIdentity()
        }}
      />
    )
  }

  return (
    <OrganizerWorkspace
      title="Identity Verification"
      description="Verify your government-issued identification and citizenship information."
      taxYear={taxYear}
      progress={progress}
      completedSections={
        completedSections
      }
      totalSections={totalSections}
      currentSectionTitle="Identity Verification"
      navigationItems={
        navigationItems
      }
    >
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault()

          void handleSave(false)
        }}
      >
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            {taxYear} Tax Organizer
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Identity Verification
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Confirm the non-sensitive details associated with your current
            government identification. Identification numbers, Social Security
            numbers, and document images will be collected later through the
            encrypted secure vault.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-10">
            <div className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {completedSections}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total sections
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {totalSections}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Save status
                </p>

                <p
                  className={[
                    "mt-2 font-bold",
                    hasUnsavedChanges
                      ? "text-amber-700"
                      : "text-emerald-700",
                  ].join(" ")}
                >
                  {hasUnsavedChanges
                    ? "Unsaved Changes"
                    : "All Changes Saved"}
                </p>
              </div>
            </div>

            {(
              pageMessage ||
              saveMessage ||
              identityError
            ) && (
              <div
                ref={
                  validationSummaryRef
                }
                role="status"
                className={[
                  "rounded-xl border p-4 text-sm",
                  identityError
                    ? "border-red-200 bg-red-50 text-red-800"
                    : hasOrganizerIdentityValidationErrors(
                          validationErrors,
                        )
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800",
                ].join(" ")}
              >
                {identityError ??
                  pageMessage ??
                  saveMessage}
              </div>
            )}

            <OrganizerSection
              title="Government Identification"
              description="Provide details about your current government-issued photo identification."
            >
              <OrganizerIdentificationTypeSelect
                id="identification-type"
                value={
                  form.identificationType
                }
                onChange={(event) => {
                  updateField(
                    "identificationType",
                    event.target.value as OrganizerIdentificationType,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.identificationType
                }
              />

              <OrganizerStateSelect
                id="identification-state"
                label="Issuing state"
                value={
                  form.identificationState
                }
                onChange={(event) => {
                  updateField(
                    "identificationState",
                    event.target.value,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.identificationState
                }
              />

              <OrganizerDateField
                id="identification-issue-date"
                label="Issue date"
                value={
                  form.identificationIssueDate
                }
                onChange={(event) => {
                  updateField(
                    "identificationIssueDate",
                    event.target.value,
                  )
                }}
                max={
                  new Date()
                    .toISOString()
                    .slice(0, 10)
                }
                disabled={isSaving}
                helpText="Optional if the issue date is not displayed on your identification."
              />

              <OrganizerDateField
                id="identification-expiration-date"
                label="Expiration date"
                value={
                  form.identificationExpirationDate
                }
                onChange={(event) => {
                  updateField(
                    "identificationExpirationDate",
                    event.target.value,
                  )
                }}
                min={
                  form.identificationIssueDate ||
                  undefined
                }
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.identificationExpirationDate
                }
              />
            </OrganizerSection>

            <div className="border-t border-slate-200" />

            <OrganizerSection
              title="Citizenship Information"
              description="Confirm your citizenship classification for tax-preparation purposes."
            >
              <OrganizerCitizenshipStatusSelect
                id="citizenship-status"
                value={
                  form.citizenshipStatus
                }
                onChange={(event) => {
                  updateField(
                    "citizenshipStatus",
                    event.target.value as OrganizerCitizenshipStatus,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.citizenshipStatus
                }
                helpText="Choose the option that best describes your current status."
              />

              <div className="md:col-span-2">
                <OrganizerYesNoQuestion
                  id="is-us-citizen"
                  label="Are you currently a U.S. citizen?"
                  value={
                    form.isUsCitizen
                  }
                  onChange={(value) => {
                    updateField(
                      "isUsCitizen",
                      value,
                    )
                  }}
                  required
                  disabled={isSaving}
                  errorMessage={
                    validationErrors.isUsCitizen
                  }
                />
              </div>
            </OrganizerSection>

            <div className="border-t border-slate-200" />

            <OrganizerSection
              title="Identity Confirmation"
              description="Answer these questions about your current identification documents."
            >
              <div className="space-y-8 md:col-span-2">
                <OrganizerYesNoQuestion
                  id="has-government-photo-id"
                  label="Do you currently possess a valid government-issued photo identification?"
                  value={
                    form.hasGovernmentPhotoId
                  }
                  onChange={(value) => {
                    updateField(
                      "hasGovernmentPhotoId",
                      value,
                    )
                  }}
                  required
                  disabled={isSaving}
                  errorMessage={
                    validationErrors.hasGovernmentPhotoId
                  }
                />

                <OrganizerYesNoQuestion
                  id="identity-changed"
                  label="Has your legal identity information or government identification changed since your last tax return?"
                  value={
                    form.hasIdentityChanged
                  }
                  onChange={(value) => {
                    updateField(
                      "hasIdentityChanged",
                      value,
                    )
                  }}
                  required
                  disabled={isSaving}
                  errorMessage={
                    validationErrors.hasIdentityChanged
                  }
                />
              </div>
            </OrganizerSection>

            <div className="border-t border-slate-200" />

            <SecureIdentitySection
              organizerId={organizerId}
              disabled={isSaving}
            />

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-900">
                Restricted sensitive data
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Social Security numbers are encrypted and stored in the Secure Vault.
                Identification numbers and document images will be added through the same
                restricted workflow in a later phase. Full protected values are never
                displayed in the ordinary client portal.
              </p>
            </div>
            
            <OrganizerSaveBar
              isSaving={isSaving}
              saveMessage={
                pageMessage ??
                saveMessage
              }
              onSave={() => {
                void handleSave(false)
              }}
              onContinue={() => {
                void handleSave(true)
              }}
            />
          </div>
        </div>
      </form>
    </OrganizerWorkspace>
  )
}
