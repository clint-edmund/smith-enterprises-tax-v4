import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  OrganizerFormActions,
  OrganizerSelectField,
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/form"

import {
  incomeTypeMetadata,
} from "@/features/client-portal/constants/income.constants"

import type {
  CreateIncomeSourceRequest,
  IncomeRecipient,
  IncomeType,
  OrganizerIncomeSource,
  UpdateIncomeSourceRequest,
} from "@/features/client-portal/types/organizer-income.types"

interface IncomeSourceFormProps {
  organizerId: string

  incomeType: IncomeType

  incomeSource?:
    OrganizerIncomeSource | null

  isSaving?: boolean

  onCancel: () => void

  onCreate: (
    request:
      CreateIncomeSourceRequest,
  ) => Promise<void>

  onUpdate: (
    request:
      UpdateIncomeSourceRequest,
  ) => Promise<void>
}

interface IncomeSourceFormState {
  payerName: string

  recipientType:
    IncomeRecipient | ""

  notes: string

  documentReceived: boolean
}

interface IncomeSourceFormErrors {
  payerName?: string

  recipientType?: string

  form?: string
}

const recipientOptions = [
  {
    value: "taxpayer",
    label: "Taxpayer",
  },
  {
    value: "spouse",
    label: "Spouse",
  },
  {
    value: "dependent",
    label: "Dependent",
  },
  {
    value: "joint",
    label: "Joint",
  },
] as const

function createFormState(
  incomeSource:
    OrganizerIncomeSource | null,
): IncomeSourceFormState {
  if (!incomeSource) {
    return {
      payerName: "",
      recipientType:
        "taxpayer",
      notes: "",
      documentReceived:
        false,
    }
  }

  return {
    payerName:
      incomeSource.payerName,

    recipientType:
      incomeSource.recipientType,

    notes:
      incomeSource.notes,

    documentReceived:
      incomeSource.documentReceived,
  }
}

export function IncomeSourceForm({
  organizerId,
  incomeType,
  incomeSource = null,
  isSaving = false,
  onCancel,
  onCreate,
  onUpdate,
}: IncomeSourceFormProps) {
  const isEditing =
    incomeSource !== null

  const [
    form,
    setForm,
  ] =
    useState<IncomeSourceFormState>(
      () =>
        createFormState(
          incomeSource,
        ),
    )

  const [
    errors,
    setErrors,
  ] =
    useState<IncomeSourceFormErrors>(
      {},
    )

  useEffect(() => {
    setForm(
      createFormState(
        incomeSource,
      ),
    )

    setErrors({})
  }, [
    incomeSource,
    incomeType,
  ])

  const incomeMetadata =
    incomeTypeMetadata.find(
      (item) =>
        item.type ===
        incomeType,
    )

  function updateField<
    Field extends keyof IncomeSourceFormState,
  >(
    field: Field,
    value:
      IncomeSourceFormState[Field],
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

  function validateForm():
    IncomeSourceFormErrors {
    const nextErrors:
      IncomeSourceFormErrors = {}

    if (!form.payerName.trim()) {
      nextErrors.payerName =
        incomeType === "w2"
          ? "Employer name is required."
          : "Payer name is required."
    }

    if (!form.recipientType) {
      nextErrors.recipientType =
        "Select the income recipient."
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

    try {
      if (
        isEditing &&
        incomeSource
      ) {
        await onUpdate({
          organizerId,

          incomeSourceId:
            incomeSource.incomeSourceId,

          payerName:
            form.payerName.trim(),

          recipientType:
            form.recipientType as
              IncomeRecipient,

          recordStatus:
            incomeSource.recordStatus,

          documentReceived:
            form.documentReceived,

          notes:
            form.notes.trim(),
        })

        return
      }

      await onCreate({
        organizerId,

        incomeType,

        payerName:
          form.payerName.trim(),

        recipientType:
          form.recipientType as
            IncomeRecipient,

        notes:
          form.notes.trim(),
      })
    } catch {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,

          form:
            isEditing
              ? "The income source could not be updated. Review the page message and try again."
              : "The income source could not be created. Review the page message and try again.",
        }),
      )
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          {incomeMetadata?.shortTitle ??
            "Income"}
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {isEditing
            ? "Edit Income Source"
            : `Add ${incomeMetadata?.title ?? "Income Source"}`}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {incomeMetadata?.description}
        </p>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      <OrganizerTextField
        id="income-payer-name"
        label={
          incomeType === "w2"
            ? "Employer Name"
            : "Payer Name"
        }
        required
        value={
          form.payerName
        }
        error={
          errors.payerName
        }
        disabled={isSaving}
        maxLength={200}
        autoComplete="organization"
        onChange={(event) => {
          updateField(
            "payerName",
            event.target.value,
          )
        }}
      />

      <OrganizerSelectField
        id="income-recipient-type"
        label="Income Recipient"
        required
        value={
          form.recipientType
        }
        options={
          recipientOptions
        }
        error={
          errors.recipientType
        }
        disabled={isSaving}
        onChange={(event) => {
          updateField(
            "recipientType",
            event.target
              .value as
              IncomeRecipient,
          )
        }}
      />

      <div className="space-y-2">
        <label
          htmlFor="income-notes"
          className="block text-sm font-medium text-slate-700"
        >
          Notes
        </label>

        <textarea
          id="income-notes"
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
          placeholder="Add any information your tax preparer should know."
        />

        <p className="text-xs text-slate-500">
          Do not enter Social Security numbers or other sensitive identifiers in notes.
        </p>
      </div>

      {isEditing && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={
              form.documentReceived
            }
            disabled={isSaving}
            onChange={(event) => {
              updateField(
                "documentReceived",
                event.target.checked,
              )
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Supporting document received
            </span>

            <span className="mt-1 block text-sm leading-6 text-slate-600">
              Mark this when the corresponding tax document has been uploaded or delivered.
            </span>
          </span>
        </label>
      )}

      <OrganizerFormActions
        isSaving={
          isSaving
        }
        saveLabel={
          isEditing
            ? "Save Changes"
            : "Continue"
        }
        onCancel={
          onCancel
        }
      />
    </form>
  )
}