import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  OrganizerCard,
} from "@/features/client-portal/components/organizer/organizer-card"

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
  OrganizerProgressBar,
} from "@/features/client-portal/components/organizer/organizer-progress-bar"

import {
  OrganizerSection,
} from "@/features/client-portal/components/organizer/organizer-section"

import {
  useOrganizerIdentityInformation,
} from "@/features/client-portal/hooks/use-organizer-identity-information"

import {
  useTaxOrganizer,
} from "@/features/client-portal/hooks/use-tax-organizer"

import type {
  OrganizerCitizenshipStatus,
  OrganizerIdentificationType,
} from "@/features/client-portal/types/organizer-identity-information.types"

import {
  OrganizerDateField,
} from "@/features/client-portal/components/organizer/organizer-date-field"

import {
  OrganizerIdentificationTypeSelect,
} from "@/features/client-portal/components/organizer/organizer-identification-type-select"

import {
  OrganizerStateSelect,
} from "@/features/client-portal/components/organizer/organizer-state-select"

import {
  OrganizerCitizenshipStatusSelect,
} from "@/features/client-portal/components/organizer/organizer-citizenship-status-select"

import {
  OrganizerYesNoQuestion,
} from "@/features/client-portal/components/organizer/organizer-yes-no-question"


interface IdentityForm {

  identificationType:
    OrganizerIdentificationType

  identificationState:
    string

  identificationIssueDate:
    string

  identificationExpirationDate:
    string

  citizenshipStatus:
    OrganizerCitizenshipStatus

  isUsCitizen:
    boolean | null

  hasGovernmentPhotoId:
    boolean | null

  hasIdentityChanged:
    boolean | null

}

const emptyForm: IdentityForm = {

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

  const organizerTaxYear =
    new Date().getFullYear()

  const {
    summary,
    isLoading,
    errorMessage,
    refresh,
  } =
    useTaxOrganizer(
      organizerTaxYear,
    )

  const organizerId =
    summary?.organizer.id ??
    ""

  const {
  identityInformation,

  isLoading:
    isIdentityLoading,

  errorMessage:
    identityError,

  refresh:
    refreshIdentity,
} =
  useOrganizerIdentityInformation(
    organizerId,
  )

  const [
    form,
    setForm,
  ] =
    useState(emptyForm)

  const [
    originalForm,
    setOriginalForm,
  ] =
    useState(emptyForm)

  useEffect(() => {

    if (!identityInformation) {

      return

    }

    const nextForm = {

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

    setForm(
      nextForm,
    )

    setOriginalForm(
      nextForm,
    )

  }, [
    identityInformation,
  ])

    const progress =
      summary?.organizer
        .progressPercentage ??
      0

    const completedSections =
      summary?.completedSections ??
      0

    const totalSections =
      summary?.totalSections ??
      13

    const remainingSections =
      useMemo(
        () =>
          Math.max(
            totalSections -
              completedSections,
            0,
          ),
        [
          completedSections,
          totalSections,
        ],
      )

    const hasUnsavedChanges =
      useMemo(
        () =>
          JSON.stringify(
            form,
          ) !==
          JSON.stringify(
            originalForm,
          ),
        [
          form,
          originalForm,
        ],
      )

      if (isLoading) {

      return (
        <OrganizerLoadingState />
      )

    }

    if (errorMessage) {

      return (
        <OrganizerErrorState
          message={errorMessage}
          onRetry={() => {
            void refresh()
          }}
        />
      )

    }

    if (
      isIdentityLoading
    ) {

      return (
        <OrganizerLoadingState />
      )

    }

    if (
      identityError
    ) {

      return (
        <OrganizerErrorState
          message={
            identityError
          }
          onRetry={() => {
            void refreshIdentity()
          }}
        />
      )

    }

    return (

    <section className="space-y-8">

      <OrganizerPageHeader
        eyebrow={`${organizerTaxYear} Tax Organizer`}
        title="Identity Verification"
        description="Verify your identification information before continuing."
      />

      <OrganizerCard>

        <div className="space-y-8 p-8">

          <OrganizerProgressBar
            progress={progress}
          />

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
      Remaining
    </p>

    <p className="mt-2 text-2xl font-bold text-slate-950">
      {remainingSections}
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

          <OrganizerSection
            title="Government Identification"
            description="Provide details about your current government-issued photo identification. Identification numbers and document images will be collected later through the restricted secure-vault workflow."
          >
            <OrganizerIdentificationTypeSelect
              id="identification-type"
              value={form.identificationType}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  identificationType:
                    event.target.value as OrganizerIdentificationType,
                }))
              }}
              required
            />

            <OrganizerStateSelect
              id="identification-state"
              label="Issuing state"
              value={form.identificationState}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  identificationState:
                    event.target.value,
                }))
              }}
              required
            />

            <OrganizerDateField
              id="identification-issue-date"
              label="Issue date"
              value={form.identificationIssueDate}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  identificationIssueDate:
                    event.target.value,
                }))
              }}
              max={
                new Date()
                  .toISOString()
                  .slice(0, 10)
              }
              helpText="Optional if the issue date is not shown on your identification."
            />

            <OrganizerDateField
              id="identification-expiration-date"
              label="Expiration date"
              value={
                form.identificationExpirationDate
              }
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  identificationExpirationDate:
                    event.target.value,
                }))
              }}
              min={
                form.identificationIssueDate ||
                undefined
              }
              required
            />
          </OrganizerSection>

          <div className="border-t border-slate-200" />

          <OrganizerSection
            title="Citizenship Information"
            description="Confirm your citizenship classification for tax-preparation purposes."
          >
            <OrganizerCitizenshipStatusSelect
              id="citizenship-status"
              value={form.citizenshipStatus}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  citizenshipStatus:
                    event.target.value as OrganizerCitizenshipStatus,
                }))
              }}
              required
              helpText="Choose the option that best describes your current status."
            />

            <div className="md:col-span-2">
              <OrganizerYesNoQuestion
                id="is-us-citizen"
                label="Are you currently a U.S. citizen?"
                value={form.isUsCitizen}
                onChange={(value) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    isUsCitizen: value,
                  }))
                }}
                required
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
                  setForm((currentForm) => ({
                    ...currentForm,
                    hasGovernmentPhotoId:
                      value,
                  }))
                }}
                required
              />

              <OrganizerYesNoQuestion
                id="identity-changed"
                label="Has your legal identity information or government identification changed since your last tax return?"
                value={
                  form.hasIdentityChanged
                }
                onChange={(value) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    hasIdentityChanged:
                      value,
                  }))
                }}
                required
              />
            </div>
          </OrganizerSection>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-900">
              Sensitive identification data
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Identification numbers and document images are not collected on this
              page. They will be submitted later through the restricted encrypted-vault
              workflow.
            </p>
          </div>

        </div>

      </OrganizerCard>

    </section>

  )

}