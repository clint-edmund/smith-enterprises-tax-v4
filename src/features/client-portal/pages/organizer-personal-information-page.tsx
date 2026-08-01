import {
  useEffect,
  useMemo,
  useState,
} from "react"

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
  OrganizerProgressBar,
} from "@/features/client-portal/components/organizer/organizer-progress-bar"
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
  useOrganizerPersonalInformation,
} from "@/features/client-portal/hooks/use-organizer-personal-information"
import {
  useTaxOrganizer,
} from "@/features/client-portal/hooks/use-tax-organizer"

import {
  OrganizerAddressFields,
} from "@/features/client-portal/components/organizer/organizer-address-fields"
import {
  OrganizerPhoneField,
} from "@/features/client-portal/components/organizer/organizer-phone-field"

const filingStatusOptions: OrganizerSelectOption[] = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_surviving_spouse", label: "Qualifying Surviving Spouse" },
  { value: "not_sure", label: "Not Sure" },
]

export function OrganizerPersonalInformationPage() {
  const organizerTaxYear =
    new Date().getFullYear()

  const {
    summary,
    isLoading,
    errorMessage,
    refresh,
  } = useTaxOrganizer(
    organizerTaxYear,
  )

  const organizerId =
    summary?.organizer.id ?? ""

  const {
    personalInformation,
    isLoading:
      isPersonalInformationLoading,
    errorMessage:
      personalInformationError,
    refresh:
      refreshPersonalInformation,
  } =
    useOrganizerPersonalInformation(
      organizerId,
    )

  const [
    legalFirstName,
    setLegalFirstName,
  ] = useState("")

  const [
    legalMiddleName,
    setLegalMiddleName,
  ] = useState("")

  const [
    legalLastName,
    setLegalLastName,
  ] = useState("")

  const [
    preferredName,
    setPreferredName,
  ] = useState("")

  const [
    birthDate,
    setBirthDate,
  ] = useState("")

  const [
    filingStatus,
    setFilingStatus,
  ] = useState("")

  const [
    occupation,
    setOccupation,
  ] = useState("")

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    mobilePhone,
    setMobilePhone,
  ] = useState("")

  const [
    alternatePhone,
    setAlternatePhone,
  ] = useState("")

  const [
    addressLine1,
    setAddressLine1,
  ] = useState("")

  const [
    addressLine2,
    setAddressLine2,
  ] = useState("")

  const [
    city,
    setCity,
  ] = useState("")

  const [
    state,
    setState,
  ] = useState("")

  const [
    postalCode,
    setPostalCode,
  ] = useState("")

  useEffect(() => {
    if (!personalInformation) {
      return
    }

    setLegalFirstName(
      personalInformation.legalFirstName,
    )

    setLegalMiddleName(
      personalInformation.legalMiddleName,
    )

    setLegalLastName(
      personalInformation.legalLastName,
    )

    setPreferredName(
      personalInformation.preferredName,
    )

    setBirthDate(
      personalInformation.birthDate ?? "",
    )

    setFilingStatus(
      personalInformation.filingStatus,
    )

    setOccupation(
      personalInformation.occupation,
    )

    setEmail(
      personalInformation.email,
    )

    setMobilePhone(
      personalInformation.mobilePhone,
    )

    setAlternatePhone(
      personalInformation.alternatePhone,
    )

    setAddressLine1(
      personalInformation.addressLine1,
    )

    setAddressLine2(
      personalInformation.addressLine2,
    )

    setCity(
      personalInformation.city,
    )

    setState(
      personalInformation.state,
    )

    setPostalCode(
      personalInformation.postalCode,
    )
  }, [personalInformation])

  const progress =
    summary?.organizer
      .progressPercentage ?? 0

  const completedSections =
    summary?.completedSections ?? 0

  const totalSections =
    summary?.totalSections ?? 13

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
          void refresh()
        }}
      />
    )
  }

  if (isPersonalInformationLoading) {
    return (
      <OrganizerLoadingState message="Loading your personal information..." />
    )
  }

  if (personalInformationError) {
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
        description="Review and update your legal name, filing status, date of birth, and occupation before continuing."
      />

      <OrganizerCard>
        <div className="space-y-10 p-8">
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
                Status
              </p>

              <p className="mt-2 text-lg font-bold text-blue-700">
                In Progress
              </p>
            </div>
          </div>

          <OrganizerSection
            title="Legal Name"
            description="Enter your name exactly as it appears on your Social Security card and tax records."
          >
            <OrganizerTextField
              id="legal-first-name"
              label="Legal first name"
              value={legalFirstName}
              onChange={(event) => {
                setLegalFirstName(
                  event.target.value,
                )
              }}
              autoComplete="given-name"
              required
            />

            <OrganizerTextField
              id="legal-middle-name"
              label="Legal middle name"
              value={legalMiddleName}
              onChange={(event) => {
                setLegalMiddleName(
                  event.target.value,
                )
              }}
              autoComplete="additional-name"
              helpText="Optional"
            />

            <OrganizerTextField
              id="legal-last-name"
              label="Legal last name"
              value={legalLastName}
              onChange={(event) => {
                setLegalLastName(
                  event.target.value,
                )
              }}
              autoComplete="family-name"
              required
            />

            <OrganizerTextField
              id="preferred-name"
              label="Preferred name"
              value={preferredName}
              onChange={(event) => {
                setPreferredName(
                  event.target.value,
                )
              }}
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
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                )
              }}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              helpText="This should be an email address you check regularly."
            />

            <OrganizerPhoneField
              id="mobile-phone"
              label="Mobile phone"
              value={mobilePhone}
              onChange={setMobilePhone}
              required
            />

            <OrganizerPhoneField
              id="alternate-phone"
              label="Alternate phone"
              value={alternatePhone}
              onChange={setAlternatePhone}
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
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
              }}
              onChange={(
                field,
                value,
              ) => {
                switch (field) {
                  case "addressLine1":
                    setAddressLine1(value)
                    break

                  case "addressLine2":
                    setAddressLine2(value)
                    break

                  case "city":
                    setCity(value)
                    break

                  case "state":
                    setState(value)
                    break

                  case "postalCode":
                    setPostalCode(value)
                    break
                }
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
              value={birthDate}
              onChange={(event) => {
                setBirthDate(
                  event.target.value,
                )
              }}
              max={
                new Date()
                  .toISOString()
                  .slice(0, 10)
              }
              required
            />

            <OrganizerSelectField
              id="filing-status"
              label="Expected filing status"
              value={filingStatus}
              options={
                filingStatusOptions
              }
              onChange={(event) => {
                setFilingStatus(
                  event.target.value,
                )
              }}
              required
              helpText="Choose Not Sure if you need help determining your filing status."
            />

            <div className="md:col-span-2">
              <OrganizerTextField
                id="occupation"
                label="Occupation"
                value={occupation}
                onChange={(event) => {
                  setOccupation(
                    event.target.value,
                  )
                }}
                autoComplete="organization-title"
                required
                helpText="Enter your primary occupation during the tax year."
              />
            </div>
          </OrganizerSection>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-900">
              Form fields connected
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Your personal, contact, and address information is loaded from
              the secure organizer record. The year-over-year questions,
              validation, and save workflow will be connected next.
            </p>
          </div>
        </div>
      </OrganizerCard>
    </section>
  )
}
