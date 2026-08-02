import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  CalendarDays,
  FileCheck2,
  Hospital,
  ShieldCheck,
} from "lucide-react"

import {
  OrganizerCheckboxField,
  OrganizerFormActions,
  OrganizerSelectField,
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/form"

import {
  OrganizerSectionCard,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"

import {
  healthcareCoverageMetadata,
  healthcareDocumentMetadata,
} from "@/features/client-portal/constants/healthcare.constants"

import type {
  CreateOrganizerHealthcareCoverageRequest,
  HealthcareCoverageType,
  HealthcareDocumentType,
  OrganizerHealthcareCoverage,
  UpdateOrganizerHealthcareCoverageRequest,
} from "@/features/client-portal/types/organizer-healthcare.types"

interface HealthcareCoverageFormProps {
  organizerId: string

  coverage?:
    OrganizerHealthcareCoverage | null

  isSaving?: boolean

  onCancel: () => void

  onCreate: (
    request:
      CreateOrganizerHealthcareCoverageRequest,
  ) => Promise<void>

  onUpdate: (
    request:
      UpdateOrganizerHealthcareCoverageRequest,
  ) => Promise<void>
}

interface HealthcareCoverageFormState {
  providerName: string

  coverageType:
    HealthcareCoverageType | ""

  coveredPersonName: string

  policyNumber: string

  startMonth: string

  endMonth: string

  isFullYearCoverage:
    boolean

  documentReceived:
    boolean

  documentType:
    HealthcareDocumentType | ""

  notes: string
}

interface HealthcareCoverageFormErrors {
  providerName?: string

  coverageType?: string

  coveredPersonName?: string

  startMonth?: string

  endMonth?: string

  documentType?: string

  form?: string
}

const coverageTypeOptions:
  Array<{
    value: string
    label: string
  }> =
  Object.entries(
    healthcareCoverageMetadata,
  ).map(
    ([
      value,
      metadata,
    ]) => ({
      value,
      label:
        metadata.title,
    }),
  )

const documentTypeOptions:
  Array<{
    value: string
    label: string
  }> = [
    {
      value: "",
      label:
        "Select a document type",
    },
    ...Object.entries(
      healthcareDocumentMetadata,
    ).map(
      ([
        value,
        metadata,
      ]) => ({
        value,
        label:
          metadata.title,
      }),
    ),
  ]

const monthOptions:
  Array<{
    value: string
    label: string
  }> = [
    {
      value: "",
      label: "Select a month",
    },
    {
      value: "1",
      label: "January",
    },
    {
      value: "2",
      label: "February",
    },
    {
      value: "3",
      label: "March",
    },
    {
      value: "4",
      label: "April",
    },
    {
      value: "5",
      label: "May",
    },
    {
      value: "6",
      label: "June",
    },
    {
      value: "7",
      label: "July",
    },
    {
      value: "8",
      label: "August",
    },
    {
      value: "9",
      label: "September",
    },
    {
      value: "10",
      label: "October",
    },
    {
      value: "11",
      label: "November",
    },
    {
      value: "12",
      label: "December",
    },
  ]

function createFormState(
  coverage:
    OrganizerHealthcareCoverage | null,
): HealthcareCoverageFormState {
  if (!coverage) {
    return {
      providerName: "",
      coverageType: "",
      coveredPersonName: "",
      policyNumber: "",
      startMonth: "",
      endMonth: "",
      isFullYearCoverage:
        false,
      documentReceived:
        false,
      documentType: "",
      notes: "",
    }
  }

  return {
    providerName:
      coverage.providerName,

    coverageType:
      coverage.coverageType,

    coveredPersonName:
      coverage.coveredPersonName,

    policyNumber:
      coverage.policyNumber ?? "",

    startMonth:
      coverage.startMonth === null
        ? ""
        : String(
            coverage.startMonth,
          ),

    endMonth:
      coverage.endMonth === null
        ? ""
        : String(
            coverage.endMonth,
          ),

    isFullYearCoverage:
      coverage.isFullYearCoverage,

    documentReceived:
      coverage.documentReceived,

    documentType:
      coverage.documentType ?? "",

    notes:
      coverage.notes,
  }
}

function parseOptionalMonth(
  value: string,
): number | null {
  if (!value) {
    return null
  }

  const parsed =
    Number(value)

  return Number.isInteger(parsed)
    ? parsed
    : null
}

export function HealthcareCoverageForm({
  organizerId,
  coverage = null,
  isSaving = false,
  onCancel,
  onCreate,
  onUpdate,
}: HealthcareCoverageFormProps) {
  const isEditing =
    coverage !== null

  const [
    form,
    setForm,
  ] =
    useState<HealthcareCoverageFormState>(
      () =>
        createFormState(
          coverage,
        ),
    )

  const [
    errors,
    setErrors,
  ] =
    useState<HealthcareCoverageFormErrors>(
      {},
    )

  useEffect(() => {
    setForm(
      createFormState(
        coverage,
      ),
    )

    setErrors({})
  }, [
    coverage,
  ])

  function updateField<
    Field extends keyof HealthcareCoverageFormState,
  >(
    field: Field,
    value:
      HealthcareCoverageFormState[Field],
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    )

    setErrors(
      (currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
        form: undefined,
      }),
    )
  }

  function handleFullYearChange(
    checked: boolean,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        isFullYearCoverage:
          checked,
        startMonth:
          checked
            ? "1"
            : currentForm.startMonth,
        endMonth:
          checked
            ? "12"
            : currentForm.endMonth,
      }),
    )

    setErrors(
      (currentErrors) => ({
        ...currentErrors,
        startMonth:
          undefined,
        endMonth:
          undefined,
        form:
          undefined,
      }),
    )
  }

  function handleDocumentReceivedChange(
    checked: boolean,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        documentReceived:
          checked,
        documentType:
          checked
            ? currentForm.documentType
            : "",
      }),
    )

    setErrors(
      (currentErrors) => ({
        ...currentErrors,
        documentType:
          undefined,
        form:
          undefined,
      }),
    )
  }

  function validateForm():
    HealthcareCoverageFormErrors {
    const nextErrors:
      HealthcareCoverageFormErrors = {}

    if (!form.providerName.trim()) {
      nextErrors.providerName =
        "Healthcare provider name is required."
    }

    if (!form.coverageType) {
      nextErrors.coverageType =
        "Select a healthcare coverage type."
    }

    if (
      !form.coveredPersonName.trim()
    ) {
      nextErrors.coveredPersonName =
        "Covered person name is required."
    }

    const startMonth =
      parseOptionalMonth(
        form.startMonth,
      )

    const endMonth =
      parseOptionalMonth(
        form.endMonth,
      )

    if (
      !form.isFullYearCoverage
    ) {
      if (startMonth === null) {
        nextErrors.startMonth =
          "Select the coverage start month."
      }

      if (endMonth === null) {
        nextErrors.endMonth =
          "Select the coverage end month."
      }

      if (
        startMonth !== null &&
        endMonth !== null &&
        startMonth > endMonth
      ) {
        nextErrors.endMonth =
          "The end month cannot be before the start month."
      }
    }

    if (
      form.documentReceived &&
      !form.documentType
    ) {
      nextErrors.documentType =
        "Select the document that was received."
    }

    return nextErrors
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const nextErrors =
      validateForm()

    setErrors(
      nextErrors,
    )

    if (
      Object.keys(
        nextErrors,
      ).length > 0
    ) {
      return
    }

    const startMonth =
      form.isFullYearCoverage
        ? 1
        : parseOptionalMonth(
            form.startMonth,
          )

    const endMonth =
      form.isFullYearCoverage
        ? 12
        : parseOptionalMonth(
            form.endMonth,
          )

    const sharedRequest = {
      organizerId,

      providerName:
        form.providerName.trim(),

      coverageType:
        form.coverageType as
          HealthcareCoverageType,

      coveredPersonName:
        form.coveredPersonName.trim(),

      policyNumber:
        form.policyNumber.trim()
          ? form.policyNumber.trim()
          : null,

      startMonth,

      endMonth,

      isFullYearCoverage:
        form.isFullYearCoverage,

      documentReceived:
        form.documentReceived,

      documentType:
        form.documentReceived &&
        form.documentType
          ? form.documentType as
              HealthcareDocumentType
          : null,

      notes:
        form.notes.trim(),
    }

    try {
      if (
        isEditing &&
        coverage
      ) {
        await onUpdate({
          ...sharedRequest,

          coverageId:
            coverage.coverageId,
        })

        return
      }

      await onCreate(
        sharedRequest,
      )
    } catch {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,

          form:
            isEditing
              ? "Healthcare coverage could not be updated. Review the page message and try again."
              : "Healthcare coverage could not be created. Review the page message and try again.",
        }),
      )
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          Healthcare Coverage
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {isEditing
            ? "Edit Coverage"
            : "Add Coverage"}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Add the health insurance policy or government coverage that applied
          during the tax year.
        </p>
      </header>

      {errors.form && (
        <OrganizerValidationSummary
          variant="error"
          title={
            isEditing
              ? "Unable to update coverage"
              : "Unable to add coverage"
          }
          message={
            errors.form
          }
        />
      )}

      <OrganizerSectionCard
        title="Provider and Coverage"
        description="Identify the healthcare provider, coverage source, and covered household member."
        icon={
          <Hospital
            className="h-5 w-5"
            aria-hidden="true"
          />
        }
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <OrganizerTextField
          id="healthcare-provider-name"
          label="Provider Name"
          required
          value={
            form.providerName
          }
          error={
            errors.providerName
          }
          disabled={isSaving}
          maxLength={200}
          autoComplete="organization"
          placeholder="Blue Cross Blue Shield"
          onChange={(event) => {
            updateField(
              "providerName",
              event.target.value,
            )
          }}
        />

        <OrganizerSelectField
          id="healthcare-coverage-type"
          label="Coverage Type"
          required
          value={
            form.coverageType
          }
          options={
            coverageTypeOptions
          }
          error={
            errors.coverageType
          }
          disabled={isSaving}
          onChange={(event) => {
            updateField(
              "coverageType",
              event.target
                .value as
                HealthcareCoverageType,
            )
          }}
        />

        <OrganizerTextField
          id="healthcare-covered-person"
          label="Covered Person"
          required
          value={
            form.coveredPersonName
          }
          error={
            errors.coveredPersonName
          }
          disabled={isSaving}
          maxLength={200}
          autoComplete="name"
          placeholder="Client or household member name"
          onChange={(event) => {
            updateField(
              "coveredPersonName",
              event.target.value,
            )
          }}
        />

        <OrganizerTextField
          id="healthcare-policy-number"
          label="Policy Number"
          value={
            form.policyNumber
          }
          disabled={isSaving}
          maxLength={100}
          autoComplete="off"
          placeholder="Optional"
          onChange={(event) => {
            updateField(
              "policyNumber",
              event.target.value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Coverage Period"
        description="Indicate whether coverage applied for the full year or only during specific months."
        icon={
          <CalendarDays
            className="h-5 w-5"
            aria-hidden="true"
          />
        }
      >
        <div className="space-y-6">
          <OrganizerCheckboxField
            id="healthcare-full-year"
            label="Full-year coverage"
            description="Coverage applied from January through December."
            checked={
              form.isFullYearCoverage
            }
            disabled={isSaving}
            onChange={(event) => {
              handleFullYearChange(
                event.target.checked,
              )
            }}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <OrganizerSelectField
              id="healthcare-start-month"
              label="Start Month"
              required={
                !form.isFullYearCoverage
              }
              value={
                form.startMonth
              }
              options={
                monthOptions
              }
              error={
                errors.startMonth
              }
              disabled={
                isSaving ||
                form.isFullYearCoverage
              }
              onChange={(event) => {
                updateField(
                  "startMonth",
                  event.target.value,
                )
              }}
            />

            <OrganizerSelectField
              id="healthcare-end-month"
              label="End Month"
              required={
                !form.isFullYearCoverage
              }
              value={
                form.endMonth
              }
              options={
                monthOptions
              }
              error={
                errors.endMonth
              }
              disabled={
                isSaving ||
                form.isFullYearCoverage
              }
              onChange={(event) => {
                updateField(
                  "endMonth",
                  event.target.value,
                )
              }}
            />
          </div>
        </div>
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Healthcare Document"
        description="Track whether the supporting healthcare tax document has been received."
        icon={
          <FileCheck2
            className="h-5 w-5"
            aria-hidden="true"
          />
        }
      >
        <div className="space-y-6">
          <OrganizerCheckboxField
            id="healthcare-document-received"
            label="Supporting document received"
            description="Mark this after the Form 1095 or other coverage document has been uploaded or delivered."
            checked={
              form.documentReceived
            }
            disabled={isSaving}
            onChange={(event) => {
              handleDocumentReceivedChange(
                event.target.checked,
              )
            }}
          />

          <OrganizerSelectField
            id="healthcare-document-type"
            label="Document Type"
            required={
              form.documentReceived
            }
            value={
              form.documentType
            }
            options={
              documentTypeOptions
            }
            error={
              errors.documentType
            }
            disabled={
              isSaving ||
              !form.documentReceived
            }
            onChange={(event) => {
              updateField(
                "documentType",
                event.target
                  .value as
                  HealthcareDocumentType,
              )
            }}
          />
        </div>
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Additional Information"
        description="Add any non-sensitive information that may help the tax preparer review this coverage."
        icon={
          <ShieldCheck
            className="h-5 w-5"
            aria-hidden="true"
          />
        }
      >
        <div className="space-y-2">
          <label
            htmlFor="healthcare-notes"
            className="block text-sm font-medium text-slate-700"
          >
            Notes
          </label>

          <textarea
            id="healthcare-notes"
            rows={4}
            maxLength={4000}
            disabled={isSaving}
            value={
              form.notes
            }
            onChange={(event) => {
              updateField(
                "notes",
                event.target.value,
              )
            }}
            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Add information the tax preparer should know."
          />

          <p className="text-xs text-slate-500">
            Do not enter Social Security numbers, medical details, or other
            sensitive personal information in this field.
          </p>
        </div>
      </OrganizerSectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <OrganizerFormActions
          isSaving={
            isSaving
          }
          saveLabel={
            isEditing
              ? "Save Changes"
              : "Add Coverage"
          }
          cancelLabel="Cancel"
          onCancel={
            onCancel
          }
        />
      </div>
    </form>
  )
}
