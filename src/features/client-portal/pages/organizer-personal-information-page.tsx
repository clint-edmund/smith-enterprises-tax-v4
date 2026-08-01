import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  OrganizerAddressFields,
} from "@/features/client-portal/components/organizer/organizer-address-fields"
import {
  OrganizerCard,
} from "@/features/client-portal/components/organizer/organizer-card"
import {
  OrganizerDateField,
} from "@/features/client-portal/components/organizer/organizer-date-field"
import {
  OrganizerErrorState,
} from "@/features/client-portal/components/organizer/organizer-error-state"
import {
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/organizer-loading-state"
import {
  OrganizerPageHeader,
} from "@/features/client-portal/components/organizer/organizer-page-header"
import {
  OrganizerPhoneField,
} from "@/features/client-portal/components/organizer/organizer-phone-field"
import {
  OrganizerProgressBar,
} from "@/features/client-portal/components/organizer/organizer-progress-bar"
import {
  OrganizerSaveBar,
} from "@/features/client-portal/components/organizer/organizer-save-bar"
import {
  OrganizerSection,
} from "@/features/client-portal/components/organizer/organizer-section"
import {
  OrganizerSelectField,
  type OrganizerSelectOption,
} from "@/features/client-portal/components/organizer/organizer-select-field"
import {
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/organizer-text-field"
import {
  OrganizerYesNoQuestion,
} from "@/features/client-portal/components/organizer/organizer-yes-no-question"
import {
  useOrganizerPersonalInformation,
} from "@/features/client-portal/hooks/use-organizer-personal-information"
import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"
import type {
  SaveOrganizerPersonalInformationRequest,
} from "@/features/client-portal/services/organizer-personal-information-service"
import {
  hasOrganizerPersonalValidationErrors,
  type OrganizerPersonalValidationErrors,
  validateOrganizerPersonalInformation,
} from "@/features/client-portal/utils/organizer-personal-validation"

const filingStatusOptions: OrganizerSelectOption[] = [
  {
    value: "single",
    label: "Single",
  },
  {
    value: "married_filing_jointly",
    label: "Married Filing Jointly",
  },
  {
    value: "married_filing_separately",
    label: "Married Filing Separately",
  },
  {
    value: "head_of_household",
    label: "Head of Household",
  },
  {
    value: "qualifying_surviving_spouse",
    label: "Qualifying Surviving Spouse",
  },
  {
    value: "not_sure",
    label: "Not Sure",
  },
]

interface PersonalInformationFormState {
  legalFirstName: string
  legalMiddleName: string
  legalLastName: string
  preferredName: string

  birthDate: string
  filingStatus: string
  occupation: string

  email: string
  mobilePhone: string
  alternatePhone: string

  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string

  addressChangedThisYear: boolean | null
  maritalStatusChangedThisYear: boolean | null
  employerChangedThisYear: boolean | null
}

const emptyForm: PersonalInformationFormState = {
  legalFirstName: "",
  legalMiddleName: "",
  legalLastName: "",
  preferredName: "",

  birthDate: "",
  filingStatus: "",
  occupation: "",

  email: "",
  mobilePhone: "",
  alternatePhone: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",

  addressChangedThisYear: null,
  maritalStatusChangedThisYear: null,
  employerChangedThisYear: null,
}

export function OrganizerPersonalInformationPage() {
  const {
    taxYear: organizerTaxYear,
    organizer,
    progress,
    completedSections,
    remainingSections,
    isLoading,
    errorMessage,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    personalInformation,
    isLoading:
      isPersonalInformationLoading,
    isSaving,
    errorMessage:
      personalInformationError,
    saveMessage,
    refresh:
      refreshPersonalInformation,
    save,
  } =
    useOrganizerPersonalInformation(
      organizerId,
    )

  const [
    form,
    setForm,
  ] =
    useState<PersonalInformationFormState>(
      emptyForm,
    )

  const [
    initialForm,
    setInitialForm,
  ] =
    useState<PersonalInformationFormState>(
      emptyForm,
    )

  const [
    validationErrors,
    setValidationErrors,
  ] =
    useState<OrganizerPersonalValidationErrors>(
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
    if (!personalInformation) {
      return
    }

    const nextForm:
      PersonalInformationFormState = {
        legalFirstName:
          personalInformation.legalFirstName,

        legalMiddleName:
          personalInformation.legalMiddleName,

        legalLastName:
          personalInformation.legalLastName,

        preferredName:
          personalInformation.preferredName,

        birthDate:
          personalInformation.birthDate ?? "",

        filingStatus:
          personalInformation.filingStatus,

        occupation:
          personalInformation.occupation,

        email:
          personalInformation.email,

        mobilePhone:
          personalInformation.mobilePhone,

        alternatePhone:
          personalInformation.alternatePhone,

        addressLine1:
          personalInformation.addressLine1,

        addressLine2:
          personalInformation.addressLine2,

        city:
          personalInformation.city,

        state:
          personalInformation.state,

        postalCode:
          personalInformation.postalCode,

        addressChangedThisYear:
          personalInformation.addressChangedThisYear,

        maritalStatusChangedThisYear:
          personalInformation.maritalStatusChangedThisYear,

        employerChangedThisYear:
          personalInformation.employerChangedThisYear,
      }

    setForm(nextForm)
    setInitialForm(nextForm)
    setValidationErrors({})
  }, [personalInformation])

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

  function updateField<
    Field extends keyof PersonalInformationFormState,
  >(
    field: Field,
    value:
      PersonalInformationFormState[Field],
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
    SaveOrganizerPersonalInformationRequest {
    return {
      organizerId,

      legalFirstName:
        form.legalFirstName,

      legalMiddleName:
        form.legalMiddleName,

      legalLastName:
        form.legalLastName,

      preferredName:
        form.preferredName,

      birthDate:
        form.birthDate || null,

      filingStatus:
        form.filingStatus,

      occupation:
        form.occupation,

      email:
        form.email,

      mobilePhone:
        form.mobilePhone,

      alternatePhone:
        form.alternatePhone,

      addressLine1:
        form.addressLine1,

      addressLine2:
        form.addressLine2,

      city:
        form.city,

      state:
        form.state,

      postalCode:
        form.postalCode,

      addressChangedThisYear:
        form.addressChangedThisYear,

      maritalStatusChangedThisYear:
        form.maritalStatusChangedThisYear,

      employerChangedThisYear:
        form.employerChangedThisYear,
    }
  }

  async function handleSave(
    continueAfterSave: boolean,
  ) {
    setPageMessage(null)

    const request =
      createSaveRequest()

    const errors =
      validateOrganizerPersonalInformation(
        request,
      )

    setValidationErrors(errors)

    if (
      hasOrganizerPersonalValidationErrors(
        errors,
      )
    ) {
      setPageMessage(
        "Review the highlighted fields before saving.",
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
        refreshPersonalInformation(),
      ])

      setInitialForm(form)

      if (continueAfterSave) {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Personal Information is complete. Identity Verification is the next organizer section."
            : "Your draft was saved. Complete the remaining required fields before continuing.",
        )
      } else {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Personal Information was saved and marked complete."
            : "Your Personal Information draft was saved.",
        )
      }
    } catch {
      // The hook exposes the service error through personalInformationError.
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

  if (
    isPersonalInformationLoading
  ) {
    return (
      <OrganizerLoadingState message="Loading your personal information..." />
    )
  }

  if (
    personalInformationError &&
    !personalInformation
  ) {
    return (
      <OrganizerErrorState
        title="Unable to load personal information"
        message={
          personalInformationError
        }
        onRetry={() => {
          void refreshPersonalInformation()
        }}
      />
    )
  }

  return (
    <section className="space-y-8">
      <OrganizerPageHeader
        eyebrow={`${organizerTaxYear} Tax Organizer`}
        title="Personal Information"
        description="Review and update your legal name, contact details, filing information, and address before continuing."
      />

      <OrganizerCard>
        <form
          className="space-y-10 p-8"
          onSubmit={(event) => {
            event.preventDefault()

            void handleSave(false)
          }}
        >
          <OrganizerProgressBar
            progress={progress}
          />

          <div className="grid gap-6 rounded-xl bg-slate-50 p-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {completedSections}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Remaining
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {remainingSections}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Save status
              </p>

              <p
                className={[
                  "mt-2 text-lg font-bold",
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
            personalInformationError
          ) && (
            <div
              ref={validationSummaryRef}
              role="status"
              className={[
                "rounded-xl border p-4 text-sm",
                personalInformationError
                  ? "border-red-200 bg-red-50 text-red-800"
                  : hasOrganizerPersonalValidationErrors(
                        validationErrors,
                      )
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800",
              ].join(" ")}
            >
              {personalInformationError ??
                pageMessage ??
                saveMessage}
            </div>
          )}

          <OrganizerSection
            title="Legal Name"
            description="Enter your name exactly as it appears on your Social Security card and tax records."
          >
            <OrganizerTextField
              id="legal-first-name"
              label="Legal first name"
              value={
                form.legalFirstName
              }
              onChange={(event) => {
                updateField(
                  "legalFirstName",
                  event.target.value,
                )
              }}
              autoComplete="given-name"
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.legalFirstName
              }
            />

            <OrganizerTextField
              id="legal-middle-name"
              label="Legal middle name"
              value={
                form.legalMiddleName
              }
              onChange={(event) => {
                updateField(
                  "legalMiddleName",
                  event.target.value,
                )
              }}
              autoComplete="additional-name"
              disabled={isSaving}
              helpText="Optional"
            />

            <OrganizerTextField
              id="legal-last-name"
              label="Legal last name"
              value={
                form.legalLastName
              }
              onChange={(event) => {
                updateField(
                  "legalLastName",
                  event.target.value,
                )
              }}
              autoComplete="family-name"
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.legalLastName
              }
            />

            <OrganizerTextField
              id="preferred-name"
              label="Preferred name"
              value={
                form.preferredName
              }
              onChange={(event) => {
                updateField(
                  "preferredName",
                  event.target.value,
                )
              }}
              disabled={isSaving}
              helpText="Optional"
            />
          </OrganizerSection>

          <div className="border-t border-slate-200" />

          <OrganizerSection
            title="Contact Information"
            description="Confirm how Smith Enterprises should contact you about your organizer and tax return."
          >
            <OrganizerTextField
              id="organizer-email"
              label="Email address"
              value={form.email}
              onChange={(event) => {
                updateField(
                  "email",
                  event.target.value,
                )
              }}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.email
              }
              helpText="Use an email address you check regularly."
            />

            <OrganizerPhoneField
              id="mobile-phone"
              label="Mobile phone"
              value={
                form.mobilePhone
              }
              onChange={(value) => {
                updateField(
                  "mobilePhone",
                  value,
                )
              }}
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.mobilePhone
              }
            />

            <OrganizerPhoneField
              id="alternate-phone"
              label="Alternate phone"
              value={
                form.alternatePhone
              }
              onChange={(value) => {
                updateField(
                  "alternatePhone",
                  value,
                )
              }}
              disabled={isSaving}
              helpText="Optional"
            />
          </OrganizerSection>

          <div className="border-t border-slate-200" />

          <OrganizerSection
            title="Mailing Address"
            description="Enter the address that should appear on your tax return and official correspondence."
          >
            <OrganizerAddressFields
              value={{
                addressLine1:
                  form.addressLine1,

                addressLine2:
                  form.addressLine2,

                city:
                  form.city,

                state:
                  form.state,

                postalCode:
                  form.postalCode,
              }}
              onChange={(
                field,
                value,
              ) => {
                updateField(
                  field,
                  value,
                )
              }}
              disabled={isSaving}
              errors={{
                addressLine1:
                  validationErrors.addressLine1,

                city:
                  validationErrors.city,

                state:
                  validationErrors.state,

                postalCode:
                  validationErrors.postalCode,
              }}
            />
          </OrganizerSection>

          <div className="border-t border-slate-200" />

          <OrganizerSection
            title="Taxpayer Details"
            description="Provide the personal details used to prepare your federal and state returns."
          >
            <OrganizerDateField
              id="birth-date"
              label="Date of birth"
              value={
                form.birthDate
              }
              onChange={(event) => {
                updateField(
                  "birthDate",
                  event.target.value,
                )
              }}
              max={
                new Date()
                  .toISOString()
                  .slice(0, 10)
              }
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.birthDate
              }
            />

            <OrganizerSelectField
              id="filing-status"
              label="Expected filing status"
              value={
                form.filingStatus
              }
              options={
                filingStatusOptions
              }
              onChange={(event) => {
                updateField(
                  "filingStatus",
                  event.target.value,
                )
              }}
              required
              disabled={isSaving}
              errorMessage={
                validationErrors.filingStatus
              }
              helpText="Choose Not Sure if you need help determining your filing status."
            />

            <div className="md:col-span-2">
              <OrganizerTextField
                id="occupation"
                label="Occupation"
                value={
                  form.occupation
                }
                onChange={(event) => {
                  updateField(
                    "occupation",
                    event.target.value,
                  )
                }}
                autoComplete="organization-title"
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.occupation
                }
                helpText="Enter your primary occupation during the tax year."
              />
            </div>
          </OrganizerSection>

          <div className="border-t border-slate-200" />

          <OrganizerSection
            title="Changes Since Last Tax Year"
            description="These questions help your preparer identify changes that may affect your tax return."
          >
            <div className="space-y-8 md:col-span-2">
              <OrganizerYesNoQuestion
                id="address-changed"
                label="Has your mailing address changed since your last tax return?"
                value={
                  form.addressChangedThisYear
                }
                onChange={(value) => {
                  updateField(
                    "addressChangedThisYear",
                    value,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.addressChangedThisYear
                }
              />

              <OrganizerYesNoQuestion
                id="marital-status-changed"
                label="Has your marital status changed since your last tax return?"
                value={
                  form.maritalStatusChangedThisYear
                }
                onChange={(value) => {
                  updateField(
                    "maritalStatusChangedThisYear",
                    value,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.maritalStatusChangedThisYear
                }
              />

              <OrganizerYesNoQuestion
                id="employer-changed"
                label="Have you changed employers since your last tax return?"
                value={
                  form.employerChangedThisYear
                }
                onChange={(value) => {
                  updateField(
                    "employerChangedThisYear",
                    value,
                  )
                }}
                required
                disabled={isSaving}
                errorMessage={
                  validationErrors.employerChangedThisYear
                }
              />
            </div>
          </OrganizerSection>

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
        </form>
      </OrganizerCard>
    </section>
  )
}
